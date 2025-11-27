import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { HiCheckCircle, HiPencil, HiXCircle, HiDocumentDownload, HiEye, HiEyeSlash } from 'react-icons/hi2';
import Preview from '../../common/preview';

const QuestionReview = ({ questions, onSave, onModify, onCancel, metadata }) => {
    const { t } = useTranslation('common');
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState(
        questions?.map(() => true) || [] // Default semua terpilih
    );

    // Initialize selectedQuestions when questions change
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

    if (!questions || questions.length === 0) {
        return null;
    }

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
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                    {questions && questions.length > 0 ? (
                        questions.map((question, index) => (
                            <div
                                key={index}
                                className={`card transition-all duration-200 ${selectedQuestions[index]
                                    ? 'border-brand-300 bg-brand-50/30'
                                    : 'border-neutral-200 opacity-60'
                                    }`}
                            >
                                <div className="p-6">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions[index]}
                                                onChange={() => toggleSelection(index)}
                                                className="w-5 h-5 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-neutral-900">Soal #{index + 1}</span>
                                                    {question.difficulty && (
                                                        <span className={`badge badge-primary text-xs`}>
                                                            {t(`main.cognitive.${question.difficulty}`)}
                                                        </span>
                                                    )}
                                                    {question.type && (
                                                        <span className="badge badge-neutral text-xs">
                                                            {question.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                                                    {question.topic && (
                                                        <span>Topik: {question.topic}</span>
                                                    )}
                                                    {question.grade && (
                                                        <>
                                                            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                                            <span>Kelas: {question.grade}</span>
                                                        </>
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

                                    {/* Question Title */}
                                    {question.title && (
                                        <h3 className="font-semibold text-lg text-neutral-900 mb-3">{question.title}</h3>
                                    )}

                                    {/* Question Description Preview */}
                                    {question.description && (
                                        <div className="mb-4">
                                            <div className="prose prose-sm max-w-none">
                                                {expandedIndex === index ? (
                                                    <div className="prose prose-sm max-w-none">
                                                        <Preview content={question.description} />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="line-clamp-3 text-neutral-700"
                                                        dangerouslySetInnerHTML={{
                                                            __html: (question.description || '').substring(0, 200) + ((question.description || '').length > 200 ? '...' : '')
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Expanded Details */}
                                    {expandedIndex === index && (
                                        <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 animate-slide-down">
                                            {question.answer && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                                        Jawaban & Pembahasan:
                                                    </label>
                                                    <div className="prose prose-sm max-w-none">
                                                        <Preview content={question.answer} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))) : (
                        <div className="text-center py-12">
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
