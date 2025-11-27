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
    <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-neutral-200/50 shadow-lg z-40 pb-safe transition-all duration-300">
      <div className="container-app">
        <div className="flex justify-around items-center h-16 md:h-20 py-1">
          {/* Feedback Button */}
          <a
            href={`#tally-open=m61EBN&tally-layout=modal&tally-emoji-text=👋&tally-emoji-animation=wave&nuptk=${nuptk}&nama=${nama}`}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 group"
            title="Feedback"
          >
            <MdFeedback className="text-2xl group-hover:-translate-y-0.5 transition-transform duration-200" />
            <span className="text-[10px] font-medium">{t('main.feedback')}</span>
          </a>

          {/* Review Button - Show when there are questions */}
          {questionCount > 0 && onOpenReview && (
            <button
              onClick={onOpenReview}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-neutral-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200 group relative"
              title="Review Soal"
            >
              <div className="relative">
                <HiEye className="text-2xl group-hover:-translate-y-0.5 transition-transform duration-200" />
                {questionCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    {questionCount > 9 ? '9+' : questionCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">Review</span>
            </button>
          )}

          {/* Generate Button - Primary Action */}
          <div className="relative -top-5">
            <button
              onClick={onOpenModal}
              className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:bg-brand-700 hover:scale-105 transition-all duration-200 group"
              title="Buat Soal Otomatis"
            >
              <HiSparkles className="text-2xl md:text-3xl group-hover:rotate-12 transition-transform duration-300" />
            </button>
            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-brand-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {t('main.generate') || 'Buat'}
            </span>
          </div>

          {/* Add Question Button */}
          <button
            onClick={onAddQuestion}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-neutral-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200 group"
            title="Tambah Soal Manual"
          >
            <LuPlus className="text-2xl group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-[10px] font-medium">{t('main.addQuestion') || 'Tambah'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
