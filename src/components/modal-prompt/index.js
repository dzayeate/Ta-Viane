import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi2';

const ModalPrompt = ({ isOpen, onClose, onSubmit }) => {
  const { t, i18n } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [streamingQuestions, setStreamingQuestions] = useState([]);
  const [formData, setFormData] = useState({
    prompt: '',
    topic: '',
    grade: '',
    total: 1,
    difficulty: t('difficulties.random'),
    type: t('types.random'),
    reference: ''
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const abortControllerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const collectedQuestionsRef = useRef([]);

  const suggestionList = [
    {
      label: t('suggestions.algebra.label'),
      value: t('suggestions.algebra.value')
    },
    {
      label: t('suggestions.trigonometry.label'),
      value: t('suggestions.trigonometry.value')
    },
    {
      label: t('suggestions.calculus.label'),
      value: t('suggestions.calculus.value')
    },
    {
      label: t('suggestions.geometry.label'),
      value: t('suggestions.geometry.value')
    },
    {
      label: t('suggestions.statistics.label'),
      value: t('suggestions.statistics.value')
    },
    {
      label: t('suggestions.probability.label'),
      value: t('suggestions.probability.value')
    },
    {
      label: t('suggestions.numberTheory.label'),
      value: t('suggestions.numberTheory.value')
    },
    {
      label: t('suggestions.linearAlgebra.label'),
      value: t('suggestions.linearAlgebra.value')
    },
    {
      label: t('suggestions.discreteMath.label'),
      value: t('suggestions.discreteMath.value')
    },
    {
      label: t('suggestions.mathLogic.label'),
      value: t('suggestions.mathLogic.value')
    }
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (field === 'prompt') {
      if (value.trim() === "") {
        setFilteredSuggestions([]);
      } else {
        const filtered = suggestionList.filter(s =>
          s.value.toLowerCase().includes(value.toLowerCase()) ||
          s.label.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
      }
    }
  };

  const handleFocus = () => {
    setFilteredSuggestions(suggestionList);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFilteredSuggestions([]);
    }, 200);
  };

  // Cleanup timeout and event source on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSuggestionClick = (suggestion) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setFormData({ ...formData, prompt: suggestion });
    setFilteredSuggestions([]);
  };

  // Streaming generation function
  async function onGenerateStreaming(event) {
    event.preventDefault();
    const { prompt, difficulty, type, total, reference } = formData;

    // Prepare skeleton data for immediate submission
    const skeletonQuestions = Array.from({ length: parseInt(total) }, (_, index) => ({
      prompt: prompt,
      difficulty: difficulty === t('difficulties.random') ? "c1" : difficulty,
      type: type === t('types.random') ? "essay" : type,
      title: "",
      description: "",
      answer: "",
      topic: "",
      isLoading: true,
      loadingIndex: index
    }));

    // Prepare metadata
    const metadata = {
      topic: formData.topic || formData.prompt,
      grade: formData.grade,
      difficulty: difficulty === t('difficulties.random') ? 'Acak' : difficulty,
      type: type === t('types.random') ? 'Acak' : type,
      total: parseInt(total),
      prompt: formData.prompt
    };

    // Submit skeleton questions immediately and close modal
    onSubmit(skeletonQuestions, {
      isStreaming: true,
      total: parseInt(total),
      metadata: metadata
    });
    onClose();

    setIsGenerating(true);
    setStreamingQuestions([]);
    collectedQuestionsRef.current = [];

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController();
    let isCancelled = false;

    try {
      const totalQuestions = parseInt(total);

      // Split into chunks of 5
      const chunkSize = 5;
      const chunks = [];
      let startIndex = 1;

      while (startIndex <= totalQuestions) {
        const endIndex = Math.min(startIndex + chunkSize - 1, totalQuestions);
        const currentChunkSize = endIndex - startIndex + 1;
        chunks.push({
          start: startIndex,
          end: endIndex,
          size: currentChunkSize
        });
        startIndex = endIndex + 1;
      }

      let totalCompleted = 0;

      // Send initial status
      window.dispatchEvent(new CustomEvent('streamingStatus', {
        detail: {
          type: 'status',
          message: 'Starting generation...',
          total: totalQuestions,
          completed: 0,
          chunks: chunks.length
        }
      }));

      // Process each chunk
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          isCancelled = true;
          break;
        }

        const chunk = chunks[chunkIndex];

        // Send chunk progress
        window.dispatchEvent(new CustomEvent('streamingStatus', {
          detail: {
            type: 'progress',
            message: t('streaming.processingChunk', {
              chunkIndex: chunkIndex + 1,
              totalChunks: chunks.length,
              start: chunk.start,
              end: chunk.end
            }),
            total: totalQuestions,
            completed: totalCompleted,
            currentChunk: chunkIndex + 1,
            totalChunks: chunks.length
          }
        }));

        try {
          // Create a POST request to initiate streaming for this chunk
          const response = await fetch('/api/generate', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
              type,
              difficulty,
              reference,
              mode: "list",
              total: chunk.size,
              range: { start: chunk.start, end: chunk.end },
              lang: i18n.language,
              stream: true
            }),
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            throw new Error(t('streaming.failedToStartStreaming', { chunkIndex: chunkIndex + 1 }));
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let chunkCompleted = 0;

          while (true) {
            // Check if cancelled
            if (abortControllerRef.current?.signal.aborted) {
              isCancelled = true;
              reader.cancel();
              break;
            }

            const { done, value } = await reader.read();
            if (done) break;

            const chunkData = decoder.decode(value);
            const lines = chunkData.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'question') {
                    // Calculate correct global index based on chunk position
                    const globalIndex = chunk.start + chunkCompleted - 1;

                    // Adjust question index for global position
                    const adjustedQuestion = {
                      ...data.data,
                      index: globalIndex,
                      questionNumber: chunk.start + chunkCompleted, // Add question number for display
                      chunkIndex: chunkIndex,
                      chunkPosition: chunkCompleted + 1
                    };

                    collectedQuestionsRef.current.push(adjustedQuestion);
                    setStreamingQuestions(prev => [...prev, adjustedQuestion]);
                    chunkCompleted++;

                    // Send update to parent via window event
                    window.dispatchEvent(new CustomEvent('streamingQuestionReady', {
                      detail: {
                        question: adjustedQuestion,
                        completed: totalCompleted + chunkCompleted,
                        total: totalQuestions,
                        chunkIndex: chunkIndex,
                        chunkCompleted: chunkCompleted,
                        chunkTotal: chunk.size,
                        globalIndex: globalIndex
                      }
                    }));
                  } else if (data.type === 'complete') {
                    // Chunk completed
                    totalCompleted += chunkCompleted;
                    break;
                  } else if (data.type === 'error') {
                    console.error('Streaming error:', data.message);

                    // Send error event to parent
                    window.dispatchEvent(new CustomEvent('streamingError', {
                      detail: {
                        message: t('streaming.chunkError', { chunkIndex: chunkIndex + 1, message: data.message }),
                        completed: totalCompleted + chunkCompleted,
                        total: totalQuestions,
                        chunkIndex: chunkIndex
                      }
                    }));
                  }
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          }

          // If cancelled during this chunk, break
          if (isCancelled) {
            break;
          }

        } catch (error) {
          if (error.name === 'AbortError') {
            isCancelled = true;
            break;
          }

          console.error(`Error in chunk ${chunkIndex + 1}:`, error);

          // Send error event to parent
          window.dispatchEvent(new CustomEvent('streamingError', {
            detail: {
              message: t('streaming.chunkError', { chunkIndex: chunkIndex + 1, message: error.message }),
              completed: totalCompleted,
              total: totalQuestions,
              chunkIndex: chunkIndex
            }
          }));
        }
      }

      // Send final status
      if (isCancelled) {
        window.dispatchEvent(new CustomEvent('streamingCancelled', {
          detail: {
            completed: totalCompleted,
            total: totalQuestions,
            message: t('streaming.generationCancelled')
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('streamingComplete', {
          detail: {
            completed: totalCompleted,
            total: totalQuestions,
            message: t('streaming.allChunksCompleted')
          }
        }));
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled by user');
      } else {
        console.error('Streaming error:', error);
        window.dispatchEvent(new CustomEvent('streamingError', {
          detail: {
            message: error.message,
            completed: 0,
            total: parseInt(total)
          }
        }));
      }
    } finally {
      setIsGenerating(false);
      collectedQuestionsRef.current = [];
      abortControllerRef.current = null;
    }
  }

  // All generation now uses streaming by default
  const onGenerate = onGenerateStreaming;

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64File = btoa(e.target.result);
        setIsParsing(true);
        try {
          const response = await fetch('/api/pdf-parse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: base64File }),
          });
          const data = await response.json();
          handleChange('reference', data.text);
        } catch (error) {
          console.error('Error parsing PDF:', error);
          alert(t('streaming.failedToParsePdf'));
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget && !isGenerating) {
      onClose();
    }
  };

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    // Reset streaming state
    setIsGenerating(false);
    setStreamingQuestions([]);
    collectedQuestionsRef.current = [];
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Listen for cancel streaming event
  useEffect(() => {
    const handleCancelStreaming = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };

    window.addEventListener('cancelStreaming', handleCancelStreaming);

    return () => {
      window.removeEventListener('cancelStreaming', handleCancelStreaming);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 animate-fade-in"
      onClick={handleOutsideClick}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div
        className="relative glass w-full md:max-w-lg rounded-2xl shadow-large max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="bg-gradient-brand p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold mb-1">{t('modal.title')}</h2>
              <p className="text-white/90 text-sm">Buat banyak soal sekaligus dengan AI</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              disabled={isGenerating}
            >
              <IoClose className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={onGenerate} className="p-6 space-y-5">
            {/* Prompt Input with Suggestions */}
            <div className="relative">
              <label htmlFor="prompt" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t('modal.prompt')} <span className="text-neutral-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                id="prompt"
                value={formData.prompt}
                onChange={(e) => handleChange('prompt', e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="input"
                placeholder="Contoh: Buat soal tentang hukum Newton..."
                autoCorrect="off"
                autoCapitalize="off"
                autoComplete="off"
                disabled={isGenerating}
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-2 card max-h-60 overflow-auto animate-slide-down shadow-lg">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-brand-50 cursor-pointer transition-colors duration-150 border-b border-neutral-100 last:border-0"
                      onClick={() => handleSuggestionClick(suggestion.value)}
                    >
                      <div className="font-semibold text-brand-700 text-sm">{suggestion.label}</div>
                      <div className="text-xs text-neutral-600 mt-1">{suggestion.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Topic & Grade Row - REQUIRED FIELDS */}
            <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-brand-700 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                Informasi Soal <span className="text-danger-600">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="topic" className="block text-sm font-semibold text-neutral-700 mb-2">
                    {t('modal.topic')} <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => handleChange('topic', e.target.value)}
                    className="input border-brand-300 focus:border-brand-500 focus:ring-brand-500"
                    placeholder={t('modal.topicPlaceholder')}
                    required
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Contoh: Dinamika, Optik, Listrik</p>
                </div>

                <div>
                  <label htmlFor="grade" className="block text-sm font-semibold text-neutral-700 mb-2">
                    {t('modal.grade')} <span className="text-danger-500">*</span>
                  </label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className="input border-brand-300 focus:border-brand-500 focus:ring-brand-500"
                    required
                    disabled={isGenerating}
                  >
                    <option value="">{t('modal.gradePlaceholder')}</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">Pilih tingkat kelas</p>
                </div>
              </div>
            </div>

            {/* Difficulty & Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('modal.difficulty')}
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="input"
                  disabled={isGenerating}
                >
                  <option value={t('difficulties.random')}>{t('difficulties.random')}</option>
                  <option value="c1">{t('main.cognitive.c1')}</option>
                  <option value="c2">{t('main.cognitive.c2')}</option>
                  <option value="c3">{t('main.cognitive.c3')}</option>
                  <option value="c4">{t('main.cognitive.c4')}</option>
                  <option value="c5">{t('main.cognitive.c5')}</option>
                  <option value="c6">{t('main.cognitive.c6')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-neutral-700 mb-2">
                  {t('modal.type')}
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="input"
                  disabled={isGenerating}
                >
                  <option value={t('types.random')}>{t('types.random')}</option>
                  <option value={t('types.multipleChoice')}>{t('types.multipleChoice')}</option>
                  <option value={t('types.essay')}>{t('types.essay')}</option>
                </select>
              </div>
            </div>

            {/* Total Questions */}
            <div>
              <label htmlFor="total" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t('modal.total')} <span className="text-neutral-400 font-normal">(Jumlah soal yang akan dibuat)</span>
              </label>
              <input
                type="number"
                id="total"
                min="1"
                max="100"
                value={formData.total}
                onChange={(e) => handleChange('total', parseInt(e.target.value) || 1)}
                className="input"
                disabled={isGenerating}
              />
              <p className="text-xs text-neutral-500 mt-1">Maksimal 100 soal per batch</p>
            </div>

            {/* Reference Section */}
            <div>
              <label htmlFor="reference" className="block text-sm font-semibold text-neutral-700 mb-2">
                {t('modal.reference')}
                <span className="text-neutral-400 font-normal text-xs ml-1">(Opsional)</span>
              </label>
              <textarea
                id="reference"
                value={formData.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                className="input min-h-[100px] resize-y"
                placeholder="Tambahkan referensi materi atau konteks..."
                disabled={isGenerating}
              />
              <div className="mt-2">
                <label className="btn btn-secondary text-sm gap-2 cursor-pointer inline-flex">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isGenerating || isParsing}
                  />
                  {isParsing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      {t('modal.uploading')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {t('modal.uploadPdf')}
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-ghost"
                disabled={isGenerating}
              >
                {t('modal.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2 group"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('modal.generating')}
                  </>
                ) : (
                  <>
                    <HiSparkles className="text-lg transition-transform duration-200 group-hover:rotate-12" />
                    {t('modal.generate')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalPrompt;
