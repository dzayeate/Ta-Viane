import { IoIosArrowDown } from 'react-icons/io';
import { IoClose, IoInformationCircle } from 'react-icons/io5';
import { 
  HiSparkles, 
  HiDocumentText, 
  HiAcademicCap, 
  HiTag, 
  HiCheckCircle,
  HiLightBulb,
  HiCog6Tooth,
  HiPencilSquare,
  HiKey
} from 'react-icons/hi2';
import Editor from '@/components/editor';

/**
 * QuestionEditor - Redesigned UX with clear sections
 * 
 * Layout:
 * 1. Header: Question number, badges, collapse/remove actions
 * 2. Section 1: Konten Soal (Prompt & Description)
 * 3. Section 2: Tipe & Metadata (Dropdowns)
 * 4. Section 3: Kunci & Pembahasan (CRITICAL for auto-grading)
 */
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
  const isMultipleChoice = question.type === 'multipleChoice';

  // Difficulty badge styling
  const getDifficultyStyle = (difficulty) => {
    const styles = {
      c1: 'bg-blue-100 text-blue-700 ring-blue-200',
      c2: 'bg-teal-100 text-teal-700 ring-teal-200',
      c3: 'bg-amber-100 text-amber-700 ring-amber-200',
      c4: 'bg-orange-100 text-orange-700 ring-orange-200',
      c5: 'bg-red-100 text-red-700 ring-red-200',
      c6: 'bg-purple-100 text-purple-700 ring-purple-200',
    };
    return styles[difficulty] || styles.c1;
  };

  // Answer key options for radio buttons
  const answerOptions = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="card animate-fade-in overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════════
          HEADER: Question Number + Badges + Actions
      ══════════════════════════════════════════════════════════════════ */}
      <div className="px-4 py-3 md:px-5 md:py-4 bg-gradient-to-r from-brand-50 to-white border-b border-neutral-100">
        <div className="flex items-center justify-between">
          {/* Left: Number + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold font-display text-lg shadow-sm">
              {index + 1}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                {t('main.question')} {index + 1}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getDifficultyStyle(question.difficulty)}`}>
                  {t(`main.cognitive.${question.difficulty}`)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${isMultipleChoice ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                  {isMultipleChoice ? 'Pilihan Ganda' : 'Essay'}
                </span>
                {isMultipleChoice && question.correctAnswer && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-100 text-success-700">
                    <HiKey className="w-3 h-3" />
                    {question.correctAnswer}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleVisibility(index)}
              className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              title={isExpanded ? "Sembunyikan detail" : "Tampilkan detail"}
            >
              <IoIosArrowDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? '-rotate-180' : ''}`} />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                title="Hapus soal"
              >
                <IoClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: KONTEN SOAL (Prompt & Generate)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="p-4 md:p-5 bg-white border-b border-neutral-100">
        <form onSubmit={(e) => onGenerate(e, index)}>
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-brand-50">
              <HiLightBulb className="w-4 h-4 text-brand-600" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800">Konten Soal</h4>
            <span className="text-xs text-neutral-400">— Masukkan perintah untuk AI</span>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-2">
            <label htmlFor={`prompt-${index}`} className="sr-only">
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
                className="input min-h-[100px] resize-y text-sm leading-relaxed pr-20"
                placeholder={t('main.commandPlaceholder')}
                required
                autoComplete="off"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-neutral-400 pointer-events-none">
                <HiSparkles className="w-3.5 h-3.5" />
                AI Prompt
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-4">
            <button
              type="submit"
              disabled={isGenerating[index]}
              className={`btn w-full gap-2 group relative overflow-hidden ${isGenerating[index] ? 'btn-secondary cursor-wait' : 'btn-primary'}`}
            >
              {isGenerating[index] ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-600 border-t-transparent" />
                  <span className="text-brand-600">{t('main.creating')}</span>
                </>
              ) : (
                <>
                  <HiSparkles className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="font-semibold">{t('main.createQuestion')}</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          EXPANDABLE SECTIONS (Details)
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* ────────────────────────────────────────────────────────────────
            SECTION 2: TIPE & METADATA
        ──────────────────────────────────────────────────────────────── */}
        <div className="p-4 md:p-5 bg-slate-50/50 border-b border-neutral-100">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-slate-100">
              <HiCog6Tooth className="w-4 h-4 text-slate-600" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800">Tipe & Metadata</h4>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Grade */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {t('modal.grade')}
              </label>
              <select
                value={question.grade || ""}
                onChange={(e) => onInputChange(index, 'grade', e.target.value)}
                className="input input-sm bg-white"
              >
                <option value="">Pilih</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Level Kognitif
              </label>
              <select
                value={question.difficulty}
                onChange={(e) => onInputChange(index, 'difficulty', e.target.value)}
                className="input input-sm bg-white"
              >
                <option value="c1">{t('main.cognitive.c1')}</option>
                <option value="c2">{t('main.cognitive.c2')}</option>
                <option value="c3">{t('main.cognitive.c3')}</option>
                <option value="c4">{t('main.cognitive.c4')}</option>
                <option value="c5">{t('main.cognitive.c5')}</option>
                <option value="c6">{t('main.cognitive.c6')}</option>
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Tipe Soal
              </label>
              <select
                value={question.type}
                onChange={(e) => onInputChange(index, 'type', e.target.value)}
                className="input input-sm bg-white"
              >
                <option value="essay">{t('types.essay')}</option>
                <option value="multipleChoice">{t('types.multipleChoice')}</option>
              </select>
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {t('main.branch')}
              </label>
              <input
                type="text"
                value={question.topic}
                onChange={(e) => onInputChange(index, 'topic', e.target.value)}
                className="input input-sm bg-white"
                placeholder="Kinematika, Dinamika..."
              />
            </div>
          </div>

          {/* Title Field - Full Width */}
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {t('main.title_field')}
            </label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => onInputChange(index, 'title', e.target.value)}
              className="input bg-white"
              placeholder="Judul singkat untuk identifikasi soal..."
            />
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 3: KONTEN SOAL (Description Editor)
        ──────────────────────────────────────────────────────────────── */}
        <div className="p-4 md:p-5 bg-white border-b border-neutral-100">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-indigo-50">
              <HiPencilSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-sm font-bold text-neutral-800">Teks Soal</h4>
            <span className="text-xs text-neutral-400">— Edit konten yang dihasilkan AI</span>
          </div>

          {/* Description Editor */}
          <div className="card border border-neutral-200 overflow-hidden">
            <Editor
              label={t('main.description')}
              id="description"
              index={index}
              value={question.description}
              onChange={onInputChange}
            />
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            SECTION 4: KUNCI JAWABAN & PEMBAHASAN (CRITICAL)
        ──────────────────────────────────────────────────────────────── */}
        <div className={`p-4 md:p-5 ${isMultipleChoice ? 'bg-gradient-to-br from-green-50 to-emerald-50/50' : 'bg-amber-50/30'}`}>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isMultipleChoice ? 'bg-success-100' : 'bg-amber-100'}`}>
                <HiKey className={`w-4 h-4 ${isMultipleChoice ? 'text-success-600' : 'text-amber-600'}`} />
              </div>
              <h4 className="text-sm font-bold text-neutral-800">
                Kunci Jawaban & Pembahasan
              </h4>
            </div>
            {isMultipleChoice && (
              <div className="flex items-center gap-1.5 text-xs text-success-700 bg-success-100 px-2.5 py-1 rounded-full">
                <IoInformationCircle className="w-3.5 h-3.5" />
                <span className="font-medium">Wajib untuk Auto-Grading</span>
              </div>
            )}
          </div>

          {/* Multiple Choice: Radio Button Group */}
          {isMultipleChoice && (
            <div className="mb-5">
              {/* Answer Key Selection */}
              <div className="card bg-white border-2 border-success-200 p-4">
                <div className="flex items-start gap-3">
                  <HiCheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800 mb-1">
                      Pilih Kunci Jawaban yang Benar
                    </p>
                    <p className="text-xs text-neutral-500 mb-4">
                      Pilih jawaban yang benar agar penilaian otomatis berfungsi dengan tepat.
                    </p>

                    {/* Radio Button Group */}
                    <div className="flex flex-wrap gap-2">
                      {answerOptions.map((option) => {
                        const isSelected = question.correctAnswer === option;
                        return (
                          <label
                            key={option}
                            className={`
                              relative flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer
                              font-bold text-lg transition-all duration-200
                              ${isSelected 
                                ? 'bg-success-500 text-white ring-4 ring-success-200 shadow-lg scale-105' 
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:scale-102'
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name={`correctAnswer-${index}`}
                              value={option}
                              checked={isSelected}
                              onChange={(e) => onInputChange(index, 'correctAnswer', e.target.value)}
                              className="sr-only"
                            />
                            {option}
                            {isSelected && (
                              <HiCheckCircle className="absolute -top-1 -right-1 w-5 h-5 text-white bg-success-600 rounded-full" />
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* Status Indicator */}
                    <div className="mt-4 flex items-center gap-2">
                      {question.correctAnswer ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-100 text-success-700 font-semibold">
                            <HiCheckCircle className="w-4 h-4" />
                            Kunci Jawaban: {question.correctAnswer}
                          </span>
                          <span className="text-success-600 text-xs">✓ Siap untuk auto-grading</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-warning-600">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning-100 font-medium">
                            ⚠️ Belum dipilih
                          </span>
                          <span className="text-xs">Pilih kunci jawaban untuk mengaktifkan auto-grading</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pembahasan / Cara Pengerjaan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HiDocumentText className={`w-4 h-4 ${isMultipleChoice ? 'text-success-600' : 'text-amber-600'}`} />
              <label className="text-sm font-semibold text-neutral-700">
                Pembahasan / Cara Pengerjaan
              </label>
            </div>
            <p className="text-xs text-neutral-500 -mt-1">
              Jelaskan langkah-langkah penyelesaian soal untuk referensi guru dan siswa.
            </p>
            <div className="card bg-white border border-neutral-200 overflow-hidden">
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
