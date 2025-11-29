import { useTranslation } from 'next-i18next';

const QuestionSkeleton = ({ index, loadingIndex, total }) => {
  const { t } = useTranslation('common');
  
  // Calculate the question number (1-based) 
  const questionNumber = loadingIndex + 1;
  
  return (
    <div className="card relative overflow-hidden animate-fade-in">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" style={{
        backgroundSize: '200% 100%',
        zIndex: 10
      }}></div>
      
      {/* Card Header - matches QuestionReview */}
      <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Checkbox placeholder */}
            <div className="w-5 h-5 rounded bg-neutral-200 animate-pulse"></div>
            <div>
              {/* Title + badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-6 bg-neutral-200 rounded w-24 animate-pulse"></div>
                <div className="h-5 bg-neutral-200 rounded-full w-16 animate-pulse"></div>
                <div className="h-5 bg-neutral-200 rounded-full w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
          {/* Toggle button placeholder */}
          <div className="h-8 w-20 bg-neutral-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Card Body - Question Content */}
      <div className="px-6 py-5 space-y-4">
        {/* Title placeholder */}
        <div className="h-6 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
        
        {/* Description placeholder - 3 lines */}
        <div className="space-y-2">
          <div className="h-4 bg-neutral-100 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-neutral-100 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-neutral-100 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>

      {/* Card Divider */}
      <div className="h-px bg-neutral-200 mx-6"></div>

      {/* Card Footer - Solution Section */}
      <div className="px-6 py-5 bg-neutral-50/50 space-y-4">
        {/* Answer Key placeholder */}
        <div className="h-10 bg-success-100 rounded-xl w-40 animate-pulse"></div>
        
        {/* Solution method placeholder */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning-200 rounded animate-pulse"></div>
            <div className="h-4 bg-neutral-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="ml-6 p-4 bg-white rounded-xl border border-neutral-200 space-y-2">
            <div className="h-3 bg-neutral-100 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-neutral-100 rounded w-5/6 animate-pulse"></div>
            <div className="h-3 bg-neutral-100 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading indicator overlay */}
      <div className="absolute bottom-4 left-6 right-6">
        <div className="p-3 bg-brand-50 rounded-xl border border-brand-100">
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
