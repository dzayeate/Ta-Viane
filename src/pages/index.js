import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ModalPrompt from '@/components/modal-prompt';
import Login from '@/modules/auth';
import users from '@/mock/users/index.json';
import Navbar from '@/components/navbar';
import QuestionEditor from '@/modules/question-editor';
import QuestionSkeleton from '@/components/question-skeleton';
import SuggestionList from '@/components/suggestion-list';
import BottomNavigation from '@/components/bottom-navigation';
import Footer from '@/components/footer';
import QuestionReview from '@/modules/question-review';

export default function Home() {
  const { t, ready, i18n } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState([]);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [streamingState, setStreamingState] = useState({
    isStreaming: false,
    total: 0,
    completed: 0
  });
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [generationMetadata, setGenerationMetadata] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState([]);

  // Check if user is logged in on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nupkt = localStorage.getItem('nupkt');
      setIsLoggedIn(!!nupkt);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [nuptk, setNupkt] = useState("");
  const [nama, setNama] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
    width: 0
  });
  const [isFoucused, setIsFocused] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [generateClickCount, setGenerateClickCount] = useState(0);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
          newQuestions[targetIndex] = {
            prompt: question.prompt,
            difficulty: question.difficulty,
            type: question.type,
            title: "",
            description: "",
            answer: "",
            topic: "",
            isLoading: false,
            questionNumber: question.questionNumber, // Store question number for display
            globalIndex: globalIndex
          };
        } else {
          // If for some reason the index doesn't match, find the first available skeleton
          const skeletonIndex = newQuestions.findIndex(q => q.isLoading);
          if (skeletonIndex !== -1) {
            newQuestions[skeletonIndex] = {
              prompt: question.prompt,
              difficulty: question.difficulty,
              type: question.type,
              title: "",
              description: "",
              answer: "",
              topic: "",
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
      const { completed, total } = event.detail;

      // Remove any remaining skeleton questions and prepare for review
      setQuestions(prevQuestions => {
        const cleanedQuestions = prevQuestions.filter(q => !q.isLoading);

        // Set questions for review - show all completed questions
        if (cleanedQuestions.length > 0) {
          setTimeout(() => {
            setReviewQuestions(cleanedQuestions);
            setIsReviewOpen(true);
          }, 800); // Delay untuk smooth transition
        }

        return cleanedQuestions;
      });

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
    generateQueue = generateQueue
      .then(() => task())
      .catch((err) => {
        console.error('Error di queue:', err);
      });
    return generateQueue;
  }

  async function onGenerate(event, index) {
    event.preventDefault();

    setIsGenerating((prev) => {
      const newIsGenerating = [...prev];
      newIsGenerating[index] = true;
      return newIsGenerating;
    });

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

          if ((title && description && answer && generatedTopic) || retryCount >= maxRetries) {
            setQuestions((prevQuestions) => {
              const newQuestions = [...prevQuestions];
              newQuestions[index] = {
                ...newQuestions[index],
                title,
                description,
                answer,
                topic: generatedTopic,
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
            alert(error.message);
          }
        }
      }
    });

    setIsGenerating((prev) => {
      const newIsGenerating = [...prev];
      newIsGenerating[index] = false;
      return newIsGenerating;
    });

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

    setIsFocused(true);
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

      // Update state
      setSavedQuestions(updatedSaved);

      // Tampilkan notifikasi
      alert(`Berhasil menyimpan ${questionsToSave.length} soal ke Bank Soal!`);

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
      alert('Gagal menyimpan soal ke server. Silakan coba lagi.');
    }
  };

  // Handler untuk review - Modify questions
  const handleReviewModify = (questionsToModify, metadata) => {
    // Tutup review modal
    setIsReviewOpen(false);

    // Buka modal prompt lagi dengan data yang sama untuk modifikasi
    // Atau biarkan soal tetap di editor untuk dimodifikasi manual
    // Untuk sekarang, kita biarkan soal tetap ada di editor

    alert(`Anda dapat memodifikasi ${questionsToModify.length} soal yang dipilih.`);

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
      alert('Belum ada soal untuk direview. Silakan buat soal terlebih dahulu.');
    }
  };

  // Count questions with content
  const completedQuestionsCount = questions.filter(q =>
    !q.isLoading && (q.title || q.description || q.answer || q.prompt)
  ).length;

  if (isLoading || !ready) {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white/20 rounded-full"></div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Auto Physics</h2>
          <p className="text-white/80">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div key={i18n.language} className="min-h-screen bg-neutral-50">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-screen bg-gradient-brand">
          <h1 className="text-white text-xl font-display">Loading...</h1>
        </div>
      ) :
        !isLoggedIn ? (
          <Login />
        ) :
          (
            <div className='flex flex-col min-h-screen'>
              {/* Navbar */}
              <Navbar showLogout={isLoggedIn} onLogout={handleLogout} />

              {/* Main Content Area - NEW LAYOUT */}
              <main className="flex-1 pt-20 pb-28">
                {/* Background Pattern */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl"></div>
                </div>

                {/* Modal */}
                <ModalPrompt isOpen={isModalOpen} onClose={closeModal} onSubmit={handleModalSubmit} />

                {/* Review Modal - STEP D & E */}
                {isReviewOpen && (
                  <QuestionReview
                    questions={reviewQuestions}
                    metadata={generationMetadata}
                    onSave={handleReviewSave}
                    onModify={handleReviewModify}
                    onCancel={handleReviewCancel}
                  />
                )}

                {/* Content Container - NEW STRUCTURE */}
                <div className="container-content relative">
                  {/* Page Header */}
                  <div className="mb-8 animate-slide-down">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
                          {t('main.title')}
                        </h1>
                        <p className="text-neutral-600 text-lg">
                          {t('main.subtitle')}
                        </p>
                      </div>
                      {questions.length > 0 && (
                        <div className="hidden md:flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-brand-600">{questions.length}</div>
                            <div className="text-sm text-neutral-500">Total Soal</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Streaming Progress Banner - NEW DESIGN */}
                  {streamingState.isStreaming && (
                    <div className="mb-8 card animate-slide-down overflow-hidden border-brand-300 shadow-lg">
                      <div className="bg-gradient-brand p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="relative flex-shrink-0 mt-1">
                              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <div className="relative w-6 h-6">
                                  <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                                  <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-display font-bold text-white text-lg mb-1">
                                {streamingState.message || t('streaming.generatingQuestions')}
                              </h3>
                              <p className="text-white/80 text-sm">
                                Sedang membuat soal dengan AI, mohon tunggu...
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={cancelStreaming}
                            className="btn btn-ghost text-white hover:bg-white/20 border-white/20 shrink-0"
                            title="Batalkan"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-white/90">
                            <span className="font-medium">
                              {streamingState.completed} dari {streamingState.total} soal
                            </span>
                            <span className="font-bold text-lg">
                              {Math.round((streamingState.completed / streamingState.total) * 100)}%
                            </span>
                          </div>
                          <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                              className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500 ease-out shadow-lg"
                              style={{
                                width: `${Math.max((streamingState.completed / streamingState.total) * 100, 2)}%`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{
                                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                                backgroundSize: '200% 100%'
                              }}></div>
                            </div>
                          </div>
                          {streamingState.totalChunks > 1 && (
                            <div className="flex items-center gap-3 pt-2">
                              <div className="flex gap-1.5">
                                {Array.from({ length: streamingState.totalChunks }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx + 1 < streamingState.currentChunk
                                      ? 'bg-success-400 w-8'
                                      : idx + 1 === streamingState.currentChunk
                                        ? 'bg-white w-6 animate-pulse'
                                        : 'bg-white/30 w-2'
                                      }`}
                                  ></div>
                                ))}
                              </div>
                              <span className="text-xs text-white/80">
                                Batch {streamingState.currentChunk}/{streamingState.totalChunks}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Questions List - NEW GRID LAYOUT */}
                  <div className="space-y-6">
                    {questions.length === 0 ? (
                      <div className="card p-12 text-center animate-fade-in">
                        <div className="max-w-md mx-auto">
                          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-lg">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                            Mulai Membuat Soal
                          </h3>
                          <p className="text-neutral-600 mb-6">
                            Klik tombol di bawah untuk membuat soal otomatis atau tambahkan soal baru
                          </p>
                          <div className="flex gap-3 justify-center">
                            <button onClick={openModal} className="btn btn-primary btn-lg">
                              Buat Otomatis
                            </button>
                            <button onClick={addQuestion} className="btn btn-outline btn-lg">
                              Tambah Manual
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      questions.map((question, index) => (
                        question.isLoading ? (
                          <QuestionSkeleton
                            key={`skeleton-${index}`}
                            index={index}
                            loadingIndex={question.loadingIndex}
                            total={streamingState.total}
                          />
                        ) : (
                          <QuestionEditor
                            key={index}
                            index={index}
                            question={question}
                            isGenerating={isGenerating}
                            isShow={isShow}
                            onRemove={questions.length > 1 ? removeQuestion : null}
                            onInputChange={handleInputChange}
                            onGenerate={onGenerate}
                            onToggleVisibility={toggleVisibility}
                            onTextareaFocus={handleTextareaFocus}
                            activeSuggestionIndex={activeSuggestionIndex}
                            t={t}
                          />
                        )
                      ))
                    )}
                  </div>
                </div>
              </main>

              {/* Suggestion List Overlay */}
              {activeSuggestionIndex !== null && (
                <SuggestionList
                  activeSuggestionIndex={activeSuggestionIndex}
                  onSuggestionClick={(index, value) => {
                    handleInputChange(index, 'prompt', value);
                    setActiveSuggestionIndex(null);
                  }}
                  position={suggestionPosition}
                  query={suggestionQuery}
                />
              )}

              {/* Bottom Navigation - NEW POSITION */}
              <BottomNavigation
                nuptk={nuptk}
                nama={nama}
                onOpenModal={openModal}
                onAddQuestion={addQuestion}
                onOpenReview={handleOpenReview}
                questionCount={completedQuestionsCount}
                t={t}
              />

              {/* Footer */}
              <Footer t={t} />
            </div>
          )}
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
