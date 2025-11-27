import React from 'react';
import { useTranslation } from 'next-i18next';
import { HiDocumentText } from 'react-icons/hi2';

const QuestionSkeleton = ({ index, loadingIndex, total }) => {
  const { t } = useTranslation('common');
  
  // Calculate the question number (1-based) 
  const questionNumber = loadingIndex + 1;
  
  return (
    <div className="card relative overflow-hidden animate-fade-in">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{
        backgroundSize: '200% 100%',
      }}></div>
      
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 rounded-lg animate-pulse">
              <HiDocumentText className="text-gray-400 text-xl" />
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-full w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-5 md:p-6 space-y-5 relative">
        {/* Prompt field */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        {/* Difficulty and Type fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-11 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-11 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Generate button */}
        <div className="h-11 bg-success-200 rounded-lg animate-pulse"></div>

        {/* Loading indicator */}
        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg border border-primary-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-300 border-t-primary-600"></div>
            </div>
            <div>
              <span className="text-sm font-semibold text-primary-700 block">
                {t('streaming.generatingQuestion')} #{questionNumber}
              </span>
              <span className="text-xs text-primary-600">
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