import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Login from '@/modules/auth';
import Sidebar from '@/components/sidebar';
import QuestionEditor from '@/modules/question-editor';
import QuestionSkeleton from '@/components/question-skeleton';
import SuggestionList from '@/components/suggestion-list';
import QuestionReview from '@/modules/question-review';
import { useHomeLogic } from '@/modules/home/hooks/useHomeLogic';
import { HiSparkles, HiBolt, HiPencilSquare, HiListBullet, HiArchiveBox } from 'react-icons/hi2';

export default function Home() {
  const {
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
    suggestionQuery,
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
  } = useHomeLogic();

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
            <div className='flex min-h-screen'>
              {/* Sidebar - NEW NAVIGATION */}
              <Sidebar 
                t={t}
                user={{ nama, nuptk }}
                onLogout={handleLogout}
                onOpenModal={() => router.push('/create-question')}
                onAddQuestion={addQuestion}
                onOpenReview={handleOpenReview}
                questionCount={completedQuestionsCount}
              />

              {/* Main Content Area - NEW LAYOUT */}
              <main className="flex-1 pt-20 lg:pt-8 pb-12 px-4 lg:px-8 overflow-x-hidden">
                {/* Background Pattern */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl"></div>
                </div>

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
                <div className="max-w-5xl mx-auto relative">
                  {/* Page Header */}
                  <div className="mb-8 animate-slide-down">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 mb-2">
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
                      <div className="animate-fade-in">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                                    <HiSparkles className="w-8 h-8 text-yellow-300" />
                                    Selamat Datang, {nama || 'Guru'}!
                                </h2>
                                <p className="text-brand-100 text-lg max-w-xl flex items-center gap-2">
                                    Siap membuat soal fisika hari ini? <HiBolt className="w-5 h-5 text-yellow-300" />
                                </p>
                                <p className="text-brand-100 mt-2">
                                    Pilih menu di bawah untuk mulai membuat soal berkualitas dengan bantuan AI.
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button 
                                onClick={() => router.push('/create-question')}
                                className="group bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md hover:border-brand-300 transition-all text-left"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                    <HiPencilSquare className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors">Buat Soal Essay</h3>
                                <p className="text-sm text-neutral-500">Generate soal essay mendalam dengan kriteria spesifik.</p>
                            </button>

                            <button 
                                onClick={() => router.push('/create-question')}
                                className="group bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md hover:border-brand-300 transition-all text-left"
                            >
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                    <HiListBullet className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors">Buat Soal Pilihan Ganda</h3>
                                <p className="text-sm text-neutral-500">Generate soal PG lengkap dengan kunci jawaban dan pembahasan.</p>
                            </button>

                            <button 
                                onClick={() => router.push('/saved-questions')}
                                className="group bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md hover:border-brand-300 transition-all text-left"
                            >
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                                    <HiArchiveBox className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-brand-600 transition-colors">Lihat Bank Soal</h3>
                                <p className="text-sm text-neutral-500">Akses koleksi soal yang telah Anda buat dan simpan sebelumnya.</p>
                            </button>
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
