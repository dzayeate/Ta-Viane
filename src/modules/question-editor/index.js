import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { HiSparkles, HiDocumentText, HiAcademicCap, HiTag } from 'react-icons/hi2';
import { HiLightBulb } from 'react-icons/hi';
import Editor from '@/components/editor';

export default function QuestionEditor({
  index,
  question,
  isGenerating,
  isShow,
  onRemove,
  onInputChange,
  onGenerate,
  onToggleVisibility,
  onTextareaFocus,
  activeSuggestionIndex,
  t
}) {
  const isExpanded = isShow.includes(index);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      c1: 'bg-blue-50 text-blue-700 border-blue-100',
      c2: 'bg-teal-50 text-teal-700 border-teal-100',
      c3: 'bg-amber-50 text-amber-700 border-amber-100',
      c4: 'bg-orange-50 text-orange-700 border-orange-100',
      c5: 'bg-red-50 text-red-700 border-red-100',
      c6: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return colors[difficulty] || colors.c1;
  };

  return (
    <div key={index} className="card card-hover animate-fade-in group border-l-4 border-l-brand-500">
      {/* Header Section */}
      <div className="p-4 md:p-5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-neutral-200 shadow-sm text-brand-600 font-bold font-display text-lg">
            {index + 1}
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {t('main.question')} {index + 1}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${getDifficultyColor(question.difficulty)} uppercase tracking-wider text-[10px]`}>
                {t(`main.cognitive.${question.difficulty}`)}
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {question.type === 'essay' ? t('types.essay') : t('types.multipleChoice')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleVisibility(index)}
            className="btn btn-ghost btn-icon text-neutral-400 hover:text-brand-600"
            title={isExpanded ? "Sembunyikan detail" : "Tampilkan detail"}
          >
            <IoIosArrowDown className={`text-lg transition-transform duration-300 ${isExpanded ? '-rotate-180' : ''}`} />
          </button>

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="btn btn-ghost btn-icon text-neutral-400 hover:text-danger-600 hover:bg-danger-50"
              title="Hapus soal"
            >
              <IoClose className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="p-4 md:p-6 bg-white">
        <form onSubmit={(e) => onGenerate(e, index)}>
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label htmlFor={`prompt-${index}`} className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <HiLightBulb className="text-brand-500" />
                {t('main.command')}
              </label>
              <div className="relative">
                <textarea
                  id={`prompt-${index}`}
                  value={question.prompt}
                  onChange={(e) => onInputChange(index, 'prompt', e.target.value)}
                  onFocus={(e) => onTextareaFocus(index, e)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (activeSuggestionIndex === index) {
                        onTextareaFocus(null, {});
                      }
                    }, 200);
                  }}
                  className="input min-h-[100px] resize-y text-sm leading-relaxed"
                  placeholder={t('main.commandPlaceholder')}
                  required
                  autoComplete="off"
                />
                <div className="absolute bottom-3 right-3 text-xs text-neutral-400 pointer-events-none">
                  AI Prompt
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HiTag className="text-brand-400" />
                  {t('main.branch')}
                </label>
                <input
                  type="text"
                  value={question.topic}
                  onChange={(e) => onInputChange(index, 'topic', e.target.value)}
                  className="input input-sm"
                  placeholder="Topik..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HiAcademicCap className="text-brand-400" />
                  {t('modal.grade')}
                </label>
                <select
                  value={question.grade || ""}
                  onChange={(e) => onInputChange(index, 'grade', e.target.value)}
                  className="input input-sm"
                >
                  <option value="">Pilih Kelas</option>
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <HiAcademicCap className="text-brand-400" />
                  Level
                </label>
                <select
                  value={question.difficulty}
                  onChange={(e) => onInputChange(index, 'difficulty', e.target.value)}
                  className="input input-sm"
                >
                  <option value="c1">{t('main.cognitive.c1')}</option>
                  <option value="c2">{t('main.cognitive.c2')}</option>
                  <option value="c3">{t('main.cognitive.c3')}</option>
                  <option value="c4">{t('main.cognitive.c4')}</option>
                  <option value="c5">{t('main.cognitive.c5')}</option>
                  <option value="c6">{t('main.cognitive.c6')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  Tipe
                </label>
                <select
                  value={question.type}
                  onChange={(e) => onInputChange(index, 'type', e.target.value)}
                  className="input input-sm"
                >
                  <option value="essay">{t('types.essay')}</option>
                  <option value="multipleChoice">{t('types.multipleChoice')}</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating[index]}
                className={`btn w-full gap-2 group relative overflow-hidden ${isGenerating[index] ? 'btn-secondary cursor-wait' : 'btn-primary'}`}
              >
                {isGenerating[index] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-600 border-t-transparent"></div>
                    <span className="text-brand-600">{t('main.creating')}</span>
                  </>
                ) : (
                  <>
                    <HiSparkles className="text-lg transition-transform duration-300 group-hover:rotate-12" />
                    <span>{t('main.createQuestion')}</span>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Expanded Details Section */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-neutral-50/30 ${isExpanded ? 'max-h-[2000px] opacity-100 border-t border-neutral-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 md:p-6 space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              {t('main.title_field')}
            </label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => onInputChange(index, 'title', e.target.value)}
              className="input"
              placeholder="Judul singkat soal..."
              required
            />
          </div>

          {/* Description Editor */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <Editor
              label={t('main.description')}
              id="description"
              index={index}
              value={question.description}
              onChange={onInputChange}
            />
          </div>

          {/* Answer Editor */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <Editor
              label={t('main.answer')}
              id="answer"
              index={index}
              value={question.answer}
              onChange={onInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
