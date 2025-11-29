import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { HiCheckCircle, HiPencil, HiXCircle, HiEye, HiEyeSlash, HiAcademicCap, HiLightBulb } from 'react-icons/hi2';
import Preview from '@/components/preview';

/**
 * Badge component for difficulty/type tags
 */
const QuestionBadge = ({ type, children }) => {
    const variants = {
        difficulty: 'badge-primary',
        type: 'badge-neutral',
        topic: 'badge-success',
    };
    return (
        <span className={`badge ${variants[type] || 'badge-neutral'} text-xs`}>
            {children}
        </span>
    );
};

/**
 * Answer Key Display - prominent badge for final answer
 */
const AnswerKeyBadge = ({ answer }) => {
    if (!answer) return null;
    
    // Check if it's a simple letter answer (A-E)
    const isLetterAnswer = /^[A-E]$/i.test(answer.trim());
    
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-50 border border-success-200 rounded-xl">
            <HiCheckCircle className="w-5 h-5 text-success-600" />
            <span className="text-sm font-medium text-success-700">Jawaban:</span>
            <span className={`font-bold text-success-800 ${isLetterAnswer ? 'text-lg' : 'text-base'}`}>
                {answer}
            </span>
        </div>
    );
};

const QuestionReview = ({ questions = [], onSave, onModify, onCancel, metadata }) => {
    const { t } = useTranslation('common');
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState(
        (questions || []).map(() => true)
    );

    React.useEffect(() => {
        if (questions && questions.length > 0) {
            setSelectedQuestions(questions.map(() => true));
        }
    }, [questions]);

    const toggleSelection = (index) => {
        setSelectedQuestions(prev => {
            const newSelection = [...prev];
            newSelection[index] = !newSelection[index];
            return newSelection;
        });
    };

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const selectedCount = selectedQuestions.filter(Boolean).length;

    const handleSave = () => {
        const filteredQuestions = questions.filter((_, index) => selectedQuestions[index]);
        onSave(filteredQuestions, metadata);
    };

    const handleModify = () => {
        const filteredQuestions = questions.filter((_, index) => selectedQuestions[index]);
        onModify(filteredQuestions, metadata);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-brand px-8 py-6 rounded-t-3xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-display font-bold mb-1">Review Soal yang Dihasilkan</h2>
                            <p className="text-white/90 text-sm">
                                Review soal sebelum menyimpan atau memodifikasi. Anda dapat memilih soal yang ingin disimpan.
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            title="Tutup"
                        >
                            <HiXCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Metadata Summary */}
                {metadata && (
                    <div className="px-8 py-4 bg-neutral-50 border-b border-neutral-200">
                        <div className="flex items-center gap-6 text-sm">
                            <div>
                                <span className="text-neutral-500">Topik:</span>
                                <span className="font-semibold text-neutral-900 ml-2">{metadata.topic || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500">Kelas:</span>
                                <span className="font-semibold text-neutral-900 ml-2">{metadata.grade || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500">Kesulitan:</span>
                                <span className="font-semibold text-neutral-900 ml-2">{metadata.difficulty || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500">Total:</span>
                                <span className="font-semibold text-neutral-900 ml-2">{questions.length} soal</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                    {questions && questions.length > 0 ? (
                        questions.map((question, index) => (
                            <div
                                key={index}
                                className={`card transition-all duration-200 ${selectedQuestions[index]
                                    ? 'border-brand-300 bg-white'
                                    : 'border-neutral-200 opacity-60 bg-neutral-50'
                                    }`}
                            >
                                {/* Card Header */}
                                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions[index]}
                                                onChange={() => toggleSelection(index)}
                                                className="w-5 h-5 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-lg text-neutral-900">
                                                        Soal #{index + 1}
                                                    </span>
                                                    {question.difficulty && (
                                                        <QuestionBadge type="difficulty">
                                                            {t(`main.cognitive.${question.difficulty}`)}
                                                        </QuestionBadge>
                                                    )}
                                                    {question.type && (
                                                        <QuestionBadge type="type">
                                                            {question.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                                                        </QuestionBadge>
                                                    )}
                                                    {question.topic && (
                                                        <QuestionBadge type="topic">
                                                            {question.topic}
                                                        </QuestionBadge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            {expandedIndex === index ? (
                                                <>
                                                    <HiEyeSlash className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Sembunyikan</span>
                                                </>
                                            ) : (
                                                <>
                                                    <HiEye className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Detail</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Card Body - Question Content */}
                                <div className="px-6 py-5">
                                    {/* Question Title */}
                                    {(question.title || question.prompt) && (
                                        <h3 className="font-semibold text-lg text-neutral-900 mb-3">
                                            {question.title || question.prompt}
                                        </h3>
                                    )}

                                    {/* Question Description */}
                                    {(question.description || question.prompt) && (
                                        <div className="prose prose-sm max-w-none text-neutral-700">
                                            {expandedIndex === index ? (
                                                <Preview className="h-auto min-h-[80px] max-h-[400px]">
                                                    {question.description || question.prompt || "Tidak ada deskripsi."}
                                                </Preview>
                                            ) : (
                                                <div
                                                    className="line-clamp-3"
                                                    dangerouslySetInnerHTML={{
                                                        __html: (question.description || question.prompt || '').substring(0, 250) + ((question.description || question.prompt || '').length > 250 ? '...' : '')
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Card Divider */}
                                {expandedIndex === index && <div className="divider mx-6" />}

                                {/* Card Footer - Solution Section (Expanded) */}
                                {expandedIndex === index && (
                                    <div className="px-6 py-5 bg-neutral-50/50 space-y-5 animate-slide-down">
                                        {/* Answer Key - Prominent Display */}
                                        {(question.correctAnswer || question.finalAnswer) && (
                                            <div>
                                                <AnswerKeyBadge answer={question.correctAnswer || question.finalAnswer} />
                                            </div>
                                        )}

                                        {/* Solution Method / Explanation */}
                                        {(question.explanation || question.answer) && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <HiLightBulb className="w-4 h-4 text-warning-500" />
                                                    <span className="text-sm font-semibold text-neutral-600">
                                                        Metode Penyelesaian
                                                    </span>
                                                </div>
                                                <div className="pl-6 prose prose-sm max-w-none text-neutral-600 bg-white rounded-xl p-4 border border-neutral-200">
                                                    <Preview className="h-auto min-h-[60px] max-h-[300px]">
                                                        {question.explanation || question.answer}
                                                    </Preview>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))) : (
                        <div className="text-center py-12">
                            <HiAcademicCap className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                            <p className="text-neutral-500">Tidak ada soal untuk direview.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-neutral-200 bg-neutral-50 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-neutral-600">
                            <span className="font-semibold text-brand-600">{selectedCount}</span> dari {questions.length} soal dipilih
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onCancel}
                                className="btn btn-ghost"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleModify}
                                className="btn btn-secondary gap-2"
                                disabled={selectedCount === 0}
                            >
                                <HiPencil className="w-5 h-5" />
                                Modifikasi ({selectedCount})
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary gap-2"
                                disabled={selectedCount === 0}
                            >
                                <HiCheckCircle className="w-5 h-5" />
                                Simpan ({selectedCount})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionReview;
