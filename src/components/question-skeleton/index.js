import React from 'react';
import { useTranslation } from 'next-i18next';
import { HiDocumentText } from 'react-icons/hi2';

const QuestionSkeleton = ({ index, loadingIndex, total }) => {
  const { t } = useTranslation('common');
  
  // Calculate the question number (1-based) 
  const questionNumber = loadingIndex + 1;
  
  return (
    <div className="card relative overflow-hidden animate-fade-in border-l-4 border-l-neutral-200">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{
        backgroundSize: '200% 100%',
        zIndex: 10
      }}></div>
      
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-200 animate-pulse"></div>
          <div>
            <div className="h-4 bg-neutral-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-neutral-200 rounded-full w-16 animate-pulse"></div>
              <div className="h-4 bg-neutral-200 rounded-full w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-neutral-200 rounded-lg animate-pulse"></div>
          <div className="h-8 w-8 bg-neutral-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 md:p-6 bg-white space-y-6 relative">
        {/* Prompt field */}
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse"></div>
          <div className="h-24 bg-neutral-100 rounded-xl animate-pulse"></div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-neutral-200 rounded w-16 animate-pulse"></div>
              <div className="h-9 bg-neutral-100 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div className="h-10 bg-neutral-200 rounded-xl animate-pulse"></div>

        {/* Loading indicator */}
        <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-300 border-t-brand-600"></div>
            </div>
            <div>
              <span className="text-sm font-semibold text-brand-700 block">
                {t('streaming.generatingQuestion')} #{questionNumber}
              </span>
              <span className="text-xs text-brand-600">
                Sedang memproses...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSkeleton;
