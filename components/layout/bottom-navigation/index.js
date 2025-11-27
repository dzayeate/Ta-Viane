import React from 'react';
import { LuPlus } from 'react-icons/lu';
import { HiSparkles, HiEye } from 'react-icons/hi2';
import { MdFeedback } from 'react-icons/md';

export default function BottomNavigation({
  nuptk,
  nama,
  onOpenModal,
  onAddQuestion,
  onOpenReview,
  questionCount = 0,
  t
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-neutral-200/50 shadow-large z-50 backdrop-blur-2xl">
      <div className="container-app pb-safe">
        <div className="flex justify-around items-center h-20 py-2">
          {/* Feedback Button */}
          <a
            href={`#tally-open=m61EBN&tally-layout=modal&tally-emoji-text=👋&tally-emoji-animation=wave&nuptk=${nuptk}&nama=${nama}`}
            className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-neutral-600 hover:text-warning-500 hover:bg-warning-50 transition-all duration-200 group"
            title="Feedback"
          >
            <MdFeedback className="text-2xl transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xs font-semibold">{t('main.feedback')}</span>
          </a>

          {/* Review Button - Show when there are questions */}
          {questionCount > 0 && onOpenReview && (
            <button
              onClick={onOpenReview}
              className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition-all duration-200 group relative"
              title="Review Soal"
            >
              <div className="relative">
                <HiEye className="text-2xl transition-transform duration-200 group-hover:scale-110" />
                {questionCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {questionCount > 9 ? '9+' : questionCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold">Review</span>
            </button>
          )}

          {/* Generate Button - Primary Action */}
          <button
            onClick={onOpenModal}
            className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl bg-gradient-brand text-white shadow-lg hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
            title="Buat Soal Otomatis"
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            <HiSparkles className="text-2xl relative z-10 transition-transform duration-200 group-hover:rotate-12" />
            <span className="text-xs font-bold relative z-10">{t('main.generate') || 'Buat Otomatis'}</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full animate-pulse shadow-lg"></div>
          </button>

          {/* Add Question Button */}
          <button
            onClick={onAddQuestion}
            className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl text-neutral-600 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200 group"
            title="Tambah Soal Manual"
          >
            <LuPlus className="text-2xl transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110" />
            <span className="text-xs font-semibold">{t('main.addQuestion') || 'Tambah Soal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
