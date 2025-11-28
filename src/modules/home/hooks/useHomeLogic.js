import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import users from '@/mock/users/index.json';
import { generateQuestionsStream } from '@/services/streamingService';
import Swal from 'sweetalert2';

export const useHomeLogic = () => {
  const { t, ready, i18n } = useTranslation('common');
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState([]);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [streamingState, setStreamingState] = useState({
    isStreaming: false,
    total: 0,
    completed: 0
  });
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [generationMetadata, setGenerationMetadata] = useState(null);

  // Refs for streaming
  const abortControllerRef = useRef(null);
  const collectedQuestionsRef = useRef([]);

  const [isLoading, setIsLoading] = useState(true);
  const [nuptk, setNupkt] = useState("");
  const [nama, setNama] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
    width: 0
  });
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [generateClickCount, setGenerateClickCount] = useState(0);

  // Check if user is logged in on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nupkt = localStorage.getItem('nupkt');
      setIsLoggedIn(!!nupkt);
    }
  }, []);

  useEffect(() => {
    // Logika login
    const storedNupkt = localStorage.getItem('nupkt');
    const storedPassword = localStorage.getItem('password');

    if (storedNupkt && storedPassword) {
      const user = users.find(user => user.NUPTK === storedNupkt && user.Password === storedPassword);
      if (user) {
        setNupkt(storedNupkt);
        setNama(user.Nama);
        setIsLoggedIn(true);
      }
    }

    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);
    setIsLoading(false);
  }, []); // Run only once on mount

  // Check for auto-generation config from Create Question page
  useEffect(() => {
    if (ready && isLoggedIn) {
      const configStr = sessionStorage.getItem('auto_generate_config');
      if (configStr) {
        try {
          const config = JSON.parse(configStr);
          sessionStorage.removeItem('auto_generate_config');
          
          // Start generation
          onGenerateStreaming(config);
        } catch (e) {
          console.error('Error parsing auto generate config:', e);
        }
      }
    }
  }, [ready, isLoggedIn]);

  // Check for manual creation config from Create Question page
  useEffect(() => {
    if (ready && isLoggedIn) {
      const manualConfigStr = sessionStorage.getItem('manual_create_config');
      if (manualConfigStr) {
        try {
          const config = JSON.parse(manualConfigStr);
          sessionStorage.removeItem('manual_create_config');
          
          // Add new blank question with config
          setQuestions(prev => [...prev, {
            prompt: "",
            difficulty: config.difficulty,
            type: config.type,
            title: "",
            description: "",
            answer: "",
            topic: config.topic,
            grade: config.grade,
            isLoading: false
          }]);
          setIsGenerating(prev => [...prev, false]);
          
        } catch (e) {
          console.error('Error parsing manual config:', e);
        }
      }
    }
  }, [ready, isLoggedIn]);

  // Handle language changes
  useEffect(() => {
    if (ready && questions.length > 0) {
      setQuestions(prevQuestions => prevQuestions.map(q => ({
        ...q,
        difficulty: "c1",
        type: "essay"
      })));
    }
  }, [ready, t, i18n.language]); // Re-run when language changes

  // Listen for custom language change events
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const { language } = event.detail;
      if (language && ready) {
        setQuestions(prevQuestions => prevQuestions.map(q => ({
          ...q,
          difficulty: "c1",
          type: "essay"
        })));
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, [ready, t]);

  // Listen for streaming events
  useEffect(() => {
    const handleStreamingQuestionReady = (event) => {
      const { question, completed, total, chunkIndex, chunkCompleted, chunkTotal, globalIndex } = event.detail;

      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];

        // Find the skeleton question at the correct position based on globalIndex
        // Since we create skeleton questions in order, we can use globalIndex directly
        const targetIndex = globalIndex;

        if (targetIndex < newQuestions.length && newQuestions[targetIndex].isLoading) {
          const existingQuestion = newQuestions[targetIndex];
          newQuestions[targetIndex] = {
            prompt: question.prompt,
            difficulty: question.difficulty,
            type: question.type,
            title: "",
            description: "",
            answer: "",
            topic: existingQuestion.topic || "",
            grade: existingQuestion.grade || "",
            isLoading: false,
            questionNumber: question.questionNumber, // Store question number for display
            globalIndex: globalIndex
          };
        } else {
          // If for some reason the index doesn't match, find the first available skeleton
          const skeletonIndex = newQuestions.findIndex(q => q.isLoading);
          if (skeletonIndex !== -1) {
            const existingQuestion = newQuestions[skeletonIndex];
            newQuestions[skeletonIndex] = {
              prompt: question.prompt,
              difficulty: question.difficulty,
              type: question.type,
              title: "",
              description: "",
              answer: "",
              topic: existingQuestion.topic || "",
              grade: existingQuestion.grade || "",
              isLoading: false,
              questionNumber: question.questionNumber,
              globalIndex: globalIndex
            };
          }
        }

        return newQuestions;
      });

      setStreamingState(prev => ({
        ...prev,
        completed: completed
      }));
    };

    const handleStreamingStatus = (event) => {
      const { type, message, completed, total, currentChunk, totalChunks } = event.detail;

      setStreamingState(prev => ({
        ...prev,
        completed: completed,
        total: total,
        currentChunk: currentChunk,
        totalChunks: totalChunks,
        message: message
      }));
    };

    const handleStreamingComplete = (event) => {
      const { completed, total, questions } = event.detail;

      // Remove any remaining skeleton questions
      setQuestions(prevQuestions => {
        return prevQuestions.filter(q => !q.isLoading);
      });

      // Use questions passed from event, fallback to ref
      const generatedQuestions = questions || collectedQuestionsRef.current;

      setStreamingState({
        isStreaming: false,
        total: 0,
        completed: 0,
        currentChunk: 0,
        totalChunks: 0,
        message: ''
      });
    };

    const handleStreamingCancelled = (event) => {
      const { completed, total, message } = event.detail;

      // Remove any remaining skeleton questions
      setQuestions(prevQuestions =>
        prevQuestions.filter(q => !q.isLoading)
      );

      setStreamingState({
        isStreaming: false,
        total: 0,
        completed: 0,
        currentChunk: 0,
        totalChunks: 0,
        message: ''
      });
    };

    const handleStreamingError = (event) => {
      const { message, chunkIndex } = event.detail;
      console.error('Streaming error:', message);
      // Optionally show error to user
    };

    window.addEventListener('streamingQuestionReady', handleStreamingQuestionReady);
    window.addEventListener('streamingStatus', handleStreamingStatus);
    window.addEventListener('streamingComplete', handleStreamingComplete);
    window.addEventListener('streamingCancelled', handleStreamingCancelled);
    window.addEventListener('streamingError', handleStreamingError);

    return () => {
      window.removeEventListener('streamingQuestionReady', handleStreamingQuestionReady);
      window.removeEventListener('streamingStatus', handleStreamingStatus);
      window.removeEventListener('streamingComplete', handleStreamingComplete);
      window.removeEventListener('streamingCancelled', handleStreamingCancelled);
      window.removeEventListener('streamingError', handleStreamingError);
    };
  }, []);

  // Streaming generation function (Moved from ModalPrompt)
  async function onGenerateStreaming(formData) {
    const { prompt, difficulty, type, total, reference } = formData;

    // Prepare skeleton data for immediate submission
    const skeletonQuestions = Array.from({ length: parseInt(total) }, (_, index) => ({
      prompt: prompt,
      difficulty: difficulty === 'random' ? "c1" : difficulty,
      type: type === 'random' ? "essay" : type,
      title: "",
      description: "",
      answer: "",
      topic: formData.topic || "",
      grade: formData.grade || "",
      isLoading: true,
      loadingIndex: index
    }));

    // Prepare metadata
    const metadata = {
      topic: formData.topic || formData.prompt,
      grade: formData.grade,
      difficulty: difficulty === 'random' ? 'Acak' : difficulty,
      type: type === 'random' ? 'Acak' : type,
      total: parseInt(total),
      prompt: formData.prompt
    };

    // Submit skeleton questions immediately
    handleModalSubmit(skeletonQuestions, {
      isStreaming: true,
      total: parseInt(total),
      metadata: metadata
    });

    setStreamingQuestions([]);
    collectedQuestionsRef.current = [];

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Send initial status
      window.dispatchEvent(new CustomEvent('streamingStatus', {
        detail: {
          type: 'status',
          message: 'Starting generation...',
          total: parseInt(total),
          completed: 0,
          chunks: Math.ceil(parseInt(total) / 5)
        }
      }));

      await generateQuestionsStream({
        prompt,
        difficulty,
        type,
        total,
        reference,
        lang: i18n.language,
        signal: abortControllerRef.current.signal
      }, {
        onProgress: (progress) => {
          window.dispatchEvent(new CustomEvent('streamingStatus', {
            detail: {
              type: 'progress',
              message: t('streaming.processingChunk', {
                chunkIndex: progress.chunkIndex + 1,
                totalChunks: progress.totalChunks,
                start: progress.start,
                end: progress.end
              }),
              total: progress.total,
              completed: progress.completed,
              currentChunk: progress.chunkIndex + 1,
              totalChunks: progress.totalChunks
            }
          }));
        },
        onQuestionFound: (info) => {
          const { data, globalIndex, chunkIndex, chunkPosition, totalCompleted } = info;

          // Adjust question index for global position
          const adjustedQuestion = {
            ...data,
            index: globalIndex,
            questionNumber: globalIndex + 1,
            chunkIndex: chunkIndex,
            chunkPosition: chunkPosition,
            // Ensure metadata is preserved for review
            grade: metadata.grade,
            topic: metadata.topic
          };

          collectedQuestionsRef.current.push(adjustedQuestion);
          setStreamingQuestions(prev => [...prev, adjustedQuestion]);

          // Send update to parent via window event
          window.dispatchEvent(new CustomEvent('streamingQuestionReady', {
            detail: {
              question: adjustedQuestion,
              completed: totalCompleted,
              total: parseInt(total),
              chunkIndex: chunkIndex,
              chunkCompleted: chunkPosition,
              chunkTotal: 5, // approximate
              globalIndex: globalIndex
            }
          }));
        },
        onError: (error) => {
          window.dispatchEvent(new CustomEvent('streamingError', {
            detail: {
              message: t('streaming.chunkError', { chunkIndex: error.chunkIndex + 1, message: error.message }),
              completed: error.completed,
              total: parseInt(total),
              chunkIndex: error.chunkIndex
            }
          }));
        },
        onComplete: (result) => {
          if (result.isCancelled) {
            window.dispatchEvent(new CustomEvent('streamingCancelled', {
              detail: {
                completed: result.completed,
                total: parseInt(total),
                message: t('streaming.generationCancelled')
              }
            }));
          } else {
            window.dispatchEvent(new CustomEvent('streamingComplete', {
              detail: {
                completed: result.completed,
                total: parseInt(total),
                message: t('streaming.allChunksCompleted'),
                questions: [...collectedQuestionsRef.current] // Pass copy of questions
              }
            }));
          }
        }
      });

    } catch (error) {
      console.error('Streaming error:', error);
      window.dispatchEvent(new CustomEvent('streamingError', {
        detail: {
          message: error.message,
          completed: 0,
          total: parseInt(total)
        }
      }));
    } finally {
      collectedQuestionsRef.current = [];
      abortControllerRef.current = null;
    }
  }

  // Helper to set streaming questions (used by onGenerateStreaming)
  const setStreamingQuestions = (updater) => {
    // This is just a placeholder since we don't use this state directly in Home
    // The real state update happens via window events
  };

  const handleModalSubmit = (data, options = {}) => {
    // Simpan metadata untuk review
    if (options.metadata) {
      setGenerationMetadata(options.metadata);
    }

    if (options.isStreaming) {
      // Handle streaming mode - set up skeleton questions
      setStreamingState({
        isStreaming: true,
        total: options.total,
        completed: 0,
        currentChunk: 0,
        totalChunks: Math.ceil(options.total / 5),
        message: 'Preparing generation...'
      });
    }

    data?.map((item, dataIndex) => {
      setQuestions((prev) => [
        ...prev,
        {
          prompt: item?.prompt,
          difficulty: item?.difficulty || "c1",
          type: item?.type || "essay",
          title: "",
          description: "",
          answer: "",
          topic: item?.topic || options.metadata?.topic || "",
          grade: item?.grade || options.metadata?.grade || "",
          isLoading: item?.isLoading || false,
          loadingIndex: item?.loadingIndex !== undefined ? item.loadingIndex : dataIndex,
          questionNumber: item?.loadingIndex !== undefined ? item.loadingIndex + 1 : dataIndex + 1,
        },
      ]);
      setIsGenerating((prev) => [...prev, false]);
    });
  };

  const toggleVisibility = (index) => {
    setIsShow((prev) => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const handleInputChange = (index, field, value) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      };
      return newQuestions;
    });

    if (field === 'prompt') {
      setSuggestionQuery(value);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      prompt: "",
      difficulty: "c1",
      type: "essay",
      title: "",
      description: "",
      answer: "",
      topic: ""
    }]);
    setIsGenerating((prev) => [...prev, false]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    const updatedIsGenerating = isGenerating.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    setIsGenerating(updatedIsGenerating);
    setIsShow(prev => prev.filter(i => i !== index));
  };

  let generateQueue = Promise.resolve();

  function addToQueue(task) {
    // Create a promise for this specific task
    const taskPromise = generateQueue.then(() => task());
    
    // Update the queue to wait for this task, but catch errors so the queue doesn't break
    generateQueue = taskPromise.catch(() => {});
    
    // Return the task promise so the caller can await IT specifically
    return taskPromise;
  }

  async function onGenerate(event, index) {
    event.preventDefault();

    setIsGenerating((prev) => {
      const newIsGenerating = [...prev];
      newIsGenerating[index] = true;
      return newIsGenerating;
    });

    try {
      await addToQueue(async () => {
        const { prompt, difficulty, type, topic, grade } = questions[index];
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const result = await fetch('/api/generate', {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ prompt, type, difficulty, topic, grade, mode: "detail", lang: i18n.language }),
            });

            const response = await result.json();
            const data = response?.result || "";

            const [title = "", description = "", answer = "", generatedTopic = ""] = data
              .split("|->")
              .map(item => item.trim());

            if ((title && description && answer) || retryCount >= maxRetries) {
              setQuestions((prevQuestions) => {
                const newQuestions = [...prevQuestions];
                // Use generated topic if available, otherwise keep existing topic
                const finalTopic = generatedTopic || newQuestions[index].topic || topic || "";
                
                newQuestions[index] = {
                  ...newQuestions[index],
                  title,
                  description,
                  answer,
                  topic: finalTopic,
                };
                return newQuestions;
              });
              setIsShow((prev) => [...prev, index]);
              break;
            } else {
              retryCount++;
            }
          } catch (error) {
            console.error(error);
            retryCount++;
            if (retryCount >= maxRetries) {
              Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: error.message,
                customClass: { popup: 'rounded-xl' }
              });
            }
          }
        }
      });
    } catch (error) {
      console.error("Queue task failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Terjadi kesalahan saat memproses permintaan Anda.',
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsGenerating((prev) => {
        const newIsGenerating = [...prev];
        newIsGenerating[index] = false;
        return newIsGenerating;
      });
    }

    setGenerateClickCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount % 5 === 0) {
        window.Tally.openPopup('m61EBN', {
          layout: 'modal',
          width: 376,
          emoji: {
            text: "👋",
            animation: "wave"
          },
        });
      }
      return newCount;
    });
  }

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    setIsLoggedIn(false);
  };

  const handleTextareaFocus = (index, event) => {
    if (index === null) {
      // If index is null, it means we're blurring
      setActiveSuggestionIndex(null);
      return;
    }

    setActiveSuggestionIndex(index);
    setSuggestionQuery('');

    // Get textarea position
    const rect = event.target?.getBoundingClientRect?.();
    if (rect) {
      setSuggestionPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const cancelStreaming = () => {
    // Send cancel event to modal
    window.dispatchEvent(new CustomEvent('cancelStreaming'));
  };

  // Handler untuk review - Save questions
  const handleReviewSave = async (questionsToSave, metadata) => {
    // Simpan soal ke localStorage atau state
    const questionsWithMetadata = questionsToSave.map(q => ({
      ...q,
      savedAt: new Date().toISOString(),
      metadata: metadata,
      author: {
        name: nama,
        nupkt: nuptk
      }
    }));

    try {
      // Save to API (File System)
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionsWithMetadata),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save questions to server');
      }

      // Simpan ke localStorage (optional, but good for backup)
      const existingSaved = JSON.parse(localStorage.getItem('savedQuestions') || '[]');
      const updatedSaved = [...existingSaved, ...questionsWithMetadata];
      localStorage.setItem('savedQuestions', JSON.stringify(updatedSaved));

      // Tampilkan notifikasi
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Berhasil menyimpan ${questionsToSave.length} soal ke Bank Soal!`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl' }
      });

      // Tutup review dan reset
      setIsReviewOpen(false);
      setReviewQuestions([]);
      setGenerationMetadata(null);

      // Hapus soal yang sudah di-save dari list utama
      const savedIds = questionsToSave.map((_, idx) => {
        const foundIdx = questions.findIndex(q =>
          q.title === questionsToSave[idx].title &&
          q.description === questionsToSave[idx].description
        );
        return foundIdx;
      }).filter(idx => idx !== -1);

      setQuestions(prev => prev.filter((_, idx) => !savedIds.includes(idx)));

    } catch (error) {
      console.error('Error saving questions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menyimpan soal ke server. Silakan coba lagi.',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  // Handler untuk review - Modify questions
  const handleReviewModify = (questionsToModify, metadata) => {
    // Tutup review modal
    setIsReviewOpen(false);

    // Buka modal prompt lagi dengan data yang sama untuk modifikasi
    // Atau biarkan soal tetap di editor untuk dimodifikasi manual
    // Untuk sekarang, kita biarkan soal tetap ada di editor

    Swal.fire({
      icon: 'info',
      title: 'Info',
      text: `Anda dapat memodifikasi ${questionsToModify.length} soal yang dipilih.`,
      customClass: { popup: 'rounded-xl' }
    });

    // Reset review
    setReviewQuestions([]);
    setGenerationMetadata(null);
  };

  // Handler untuk cancel review
  const handleReviewCancel = () => {
    setIsReviewOpen(false);
    setReviewQuestions([]);
    setGenerationMetadata(null);
  };

  // Handler untuk buka review manual
  const handleOpenReview = () => {
    // Get all questions with content
    const questionsWithContent = questions.filter(q =>
      !q.isLoading && (q.title || q.description || q.answer || q.prompt)
    );

    if (questionsWithContent.length > 0) {
      setReviewQuestions(questionsWithContent);
      setIsReviewOpen(true);
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Info',
        text: 'Belum ada soal untuk direview. Silakan buat soal terlebih dahulu.',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  // Count questions with content
  const completedQuestionsCount = questions.filter(q =>
    !q.isLoading && (q.title || q.description || q.answer || q.prompt)
  ).length;

  return {
    t,
    ready,
    i18n,
    router,
    isGenerating,
    isShow,
    questions,
    isReviewOpen,
    isLoggedIn,
    streamingState,
    reviewQuestions,
    generationMetadata,
    isLoading,
    nuptk,
    nama,
    activeSuggestionIndex,
    suggestionPosition,
    completedQuestionsCount,
    handleLogout,
    addQuestion,
    handleOpenReview,
    handleReviewSave,
    handleReviewModify,
    handleReviewCancel,
    cancelStreaming,
    removeQuestion,
    handleInputChange,
    onGenerate,
    toggleVisibility,
    handleTextareaFocus,
    setActiveSuggestionIndex
  };
};