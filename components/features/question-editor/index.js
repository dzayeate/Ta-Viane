import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { HiSparkles, HiDocumentText, HiAcademicCap, HiTag } from 'react-icons/hi2';
import { HiLightBulb } from 'react-icons/hi';
import Editor from '../../common/editor';

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
      c1: 'bg-blue-100 text-blue-700 border-blue-200',
      c2: 'bg-green-100 text-green-700 border-green-200',
      c3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      c4: 'bg-orange-100 text-orange-700 border-orange-200',
      c5: 'bg-red-100 text-red-700 border-red-200',
      c6: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colors[difficulty] || colors.c1;
  };

  return (
    <div key={index} className="card card-hover animate-fade-in">
      {/* Header Section */}
      <div className="p-5 md:p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-100 rounded-xl shadow-sm">
                <HiDocumentText className="text-brand-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-neutral-900">
                  {t('main.question')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge badge-primary text-xs`}>
                    {t(`main.cognitive.${question.difficulty}`)}
                  </span>
                  <span className="badge badge-neutral text-xs">
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleVisibility(index)}
              className="btn btn-ghost p-2 group"
              title={isExpanded ? "Sembunyikan detail" : "Tampilkan detail"}
            >
              <IoIosArrowDown className={`text-xl transition-all duration-300 group-hover:text-primary-600 ${isExpanded ? '-rotate-180' : ''}`} />
            </button>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="btn btn-ghost p-2 text-danger-600 hover:bg-danger-50 group"
                title="Hapus soal"
              >
                <IoClose className="text-xl transition-transform duration-200 group-hover:scale-110" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="p-5 md:p-6">
        <form onSubmit={(e) => onGenerate(e, index)}>
          <div className="space-y-5">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label htmlFor={`prompt-${index}`} className="block text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <HiLightBulb className="text-brand-600" />
                {t('main.command')}
              </label>
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
                className="input min-h-[120px] resize-y"
                placeholder={t('main.commandPlaceholder')}
                required
                autoComplete="off"
              />
              <p className="text-xs text-neutral-500">
                Jelaskan instruksi soal yang ingin Anda buat dengan jelas dan spesifik
              </p>
            </div>

            {/* Topic & Grade Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <HiTag className="text-brand-600" />
                  {t('main.branch')}
                </label>
                <input
                  type="text"
                  value={question.topic}
                  onChange={(e) => onInputChange(index, 'topic', e.target.value)}
                  className="input"
                  placeholder="Contoh: Dinamika, Optik, Listrik..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <HiAcademicCap className="text-brand-600" />
                  {t('modal.grade')}
                </label>
                <select
                  value={question.grade || ""}
                  onChange={(e) => onInputChange(index, 'grade', e.target.value)}
                  className="input"
                >
                  <option value="">Pilih Kelas</option>
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <HiAcademicCap className="text-brand-600" />
                  {t('main.cognitiveLevel')}
                </label>
                <select
                  value={question.difficulty}
                  onChange={(e) => onInputChange(index, 'difficulty', e.target.value)}
                  className="input"
                >
                  <option value="c1">{t('main.cognitive.c1')}</option>
                  <option value="c2">{t('main.cognitive.c2')}</option>
                  <option value="c3">{t('main.cognitive.c3')}</option>
                  <option value="c4">{t('main.cognitive.c4')}</option>
                  <option value="c5">{t('main.cognitive.c5')}</option>
                  <option value="c6">{t('main.cognitive.c6')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t('main.questionType')}
                </label>
                <select
                  value={question.type}
                  onChange={(e) => onInputChange(index, 'type', e.target.value)}
                  className="input"
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
                className={`btn w-full gap-2 group ${isGenerating[index] ? 'btn-secondary' : 'btn-success'}`}
              >
                {isGenerating[index] ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('main.creating')}</span>
                  </>
                ) : (
                  <>
                    <HiSparkles className="text-lg transition-transform duration-200 group-hover:rotate-12" />
                    <span>{t('main.createQuestion')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Expanded Details Section */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-neutral-200 bg-neutral-50/50">
          <div className="p-5 md:p-6 space-y-6 animate-slide-down">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-700">
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
            <div>
              <Editor
                label={t('main.description')}
                id="description"
                index={index}
                value={question.description}
                onChange={onInputChange}
              />
            </div>

            {/* Answer Editor */}
            <div>
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
    </div>
  );
}
