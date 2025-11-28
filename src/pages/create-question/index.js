import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import users from '@/mock/users/index.json';
import { HiSparkles, HiArrowLeft, HiPencilSquare, HiCpuChip } from 'react-icons/hi2';

export default function CreateQuestion() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [user, setUser] = useState({ nama: '', nuptk: '' });
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' | 'manual'
  
  // Auto Form State
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    topic: '',
    grade: '',
    total: 1,
    difficulty: 'random',
    type: 'random',
    reference: ''
  });
  
  // Manual Form State
  const [manualData, setManualData] = useState({
    topic: '',
    grade: '',
    difficulty: 'c1',
    type: 'essay'
  });

  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const blurTimeoutRef = useRef(null);
  const gradeRef = useRef(null);

  const suggestionList = [
    { label: t('suggestions.algebra.label'), value: t('suggestions.algebra.value') },
    { label: t('suggestions.trigonometry.label'), value: t('suggestions.trigonometry.value') },
    { label: t('suggestions.calculus.label'), value: t('suggestions.calculus.value') },
    { label: t('suggestions.geometry.label'), value: t('suggestions.geometry.value') },
    { label: t('suggestions.statistics.label'), value: t('suggestions.statistics.value') },
    { label: t('suggestions.probability.label'), value: t('suggestions.probability.value') },
    { label: t('suggestions.numberTheory.label'), value: t('suggestions.numberTheory.value') },
    { label: t('suggestions.linearAlgebra.label'), value: t('suggestions.linearAlgebra.value') },
    { label: t('suggestions.discreteMath.label'), value: t('suggestions.discreteMath.value') },
    { label: t('suggestions.mathLogic.label'), value: t('suggestions.mathLogic.value') }
  ];

  useEffect(() => {
    const nupkt = localStorage.getItem('nupkt');
    if (!nupkt) {
      router.push('/');
      return;
    }
    const password = localStorage.getItem('password');
    const foundUser = users.find(u => u.NUPTK === nupkt && u.Password === password);
    
    if (foundUser) {
      setUser({ nama: foundUser.Nama, nuptk: foundUser.NUPTK });
    } else {
      setUser({ nama: 'User', nuptk: nupkt });
    }
  }, []);

  // Auto Form Handlers
  const handleChange = (field, value) => {
    // Ensure value is treated as raw string to preserve LaTeX characters
    setFormData({ ...formData, [field]: value });

    if (field === 'prompt') {
      if (value.trim() === "") {
        setFilteredSuggestions([]);
      } else {
        const filtered = suggestionList.filter(s =>
          s.value.toLowerCase().includes(value.toLowerCase()) ||
          s.label.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
      }
    }
  };

  const handleFocus = () => {
    setFilteredSuggestions(suggestionList);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFilteredSuggestions([]);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setFormData({ ...formData, prompt: suggestion });
    setFilteredSuggestions([]);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64File = btoa(e.target.result);
        setIsParsing(true);
        try {
          const response = await fetch('/api/pdf-parse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: base64File }),
          });
          const data = await response.json();
          handleChange('reference', data.text);
        } catch (error) {
          console.error('Error parsing PDF:', error);
          alert(t('streaming.failedToParsePdf'));
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Safety check: Ensure grade is captured even if onChange didn't fire (e.g. auto-fillers)
    let finalGrade = formData.grade;
    if (!finalGrade && gradeRef.current) {
      finalGrade = gradeRef.current.value;
    }

    if (!finalGrade) {
      alert("Mohon pilih Kelas terlebih dahulu.");
      return;
    }

    const config = {
      ...formData,
      grade: finalGrade
    };

    sessionStorage.setItem('auto_generate_config', JSON.stringify(config));
    router.push('/');
  };

  // Manual Form Handlers
  const handleManualChange = (field, value) => {
    setManualData({ ...manualData, [field]: value });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('manual_create_config', JSON.stringify(manualData));
    router.push('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar
        t={t}
        user={user}
        onLogout={handleLogout}
        onOpenModal={() => {}} 
        onAddQuestion={() => router.push('/')}
        onOpenReview={() => router.push('/')}
      />
      <main className="flex-1 pt-20 lg:pt-8 pb-12 px-4 lg:px-8 overflow-x-hidden h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 transition-colors mb-6"
            >
                <HiArrowLeft className="w-5 h-5" />
                <span>Kembali ke Beranda</span>
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-brand p-8 text-white">
                    <h1 className="text-3xl font-display font-bold mb-2">Buat Soal Baru</h1>
                    <p className="text-white/90">Pilih metode pembuatan soal yang Anda inginkan.</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200">
                    <button
                        onClick={() => setActiveTab('auto')}
                        className={`flex-1 py-4 px-6 text-center font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'auto'
                                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                        }`}
                    >
                        <HiCpuChip className="w-5 h-5" />
                        Otomatis (AI)
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-4 px-6 text-center font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'manual'
                                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                        }`}
                    >
                        <HiPencilSquare className="w-5 h-5" />
                        Manual
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'auto' ? (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 animate-fade-in">
                        {/* Prompt Input */}
                        <div className="relative">
                            <label htmlFor="prompt" className="block text-sm font-semibold text-neutral-700 mb-2">
                                {t('modal.prompt')} <span className="text-neutral-400 font-normal">(Opsional)</span>
                            </label>
                            <input
                                type="text"
                                id="prompt"
                                value={formData.prompt}
                                onChange={(e) => handleChange('prompt', e.target.value)}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                className="input"
                                placeholder="Contoh: Buat soal tentang hukum Newton..."
                                autoComplete="off"
                            />
                            {filteredSuggestions.length > 0 && (
                                <div className="absolute z-20 w-full mt-2 card max-h-60 overflow-auto animate-slide-down shadow-lg">
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="p-3 hover:bg-brand-50 cursor-pointer transition-colors duration-150 border-b border-neutral-100 last:border-0"
                                            onClick={() => handleSuggestionClick(suggestion.value)}
                                        >
                                            <div className="font-semibold text-brand-700 text-sm">{suggestion.label}</div>
                                            <div className="text-xs text-neutral-600 mt-1">{suggestion.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Topic & Grade */}
                        <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-brand-700 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-600 rounded-full"></span>
                                Informasi Soal <span className="text-danger-600">*</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-semibold text-neutral-700 mb-2">
                                        {t('modal.topic')} <span className="text-danger-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="topic"
                                        value={formData.topic}
                                        onChange={(e) => handleChange('topic', e.target.value)}
                                        className="input border-brand-300 focus:border-brand-500 focus:ring-brand-500"
                                        placeholder={t('modal.topicPlaceholder')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="grade" className="block text-sm font-semibold text-neutral-700 mb-2">
                                        {t('modal.grade')} <span className="text-danger-500">*</span>
                                    </label>
                                    <select
                                        id="grade"
                                        ref={gradeRef}
                                        value={formData.grade}
                                        onChange={(e) => handleChange('grade', e.target.value)}
                                        className="input border-brand-300 focus:border-brand-500 focus:ring-brand-500"
                                        required
                                    >
                                        <option value="">{t('modal.gradePlaceholder')}</option>
                                        <option value="X">Kelas X</option>
                                        <option value="XI">Kelas XI</option>
                                        <option value="XII">Kelas XII</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {t('modal.difficulty')}
                                </label>
                                <select
                                    id="difficulty"
                                    value={formData.difficulty}
                                    onChange={(e) => handleChange('difficulty', e.target.value)}
                                    className="input"
                                >
                                    <option value="random">{t('difficulties.random')}</option>
                                    <option value="c1">{t('main.cognitive.c1')}</option>
                                    <option value="c2">{t('main.cognitive.c2')}</option>
                                    <option value="c3">{t('main.cognitive.c3')}</option>
                                    <option value="c4">{t('main.cognitive.c4')}</option>
                                    <option value="c5">{t('main.cognitive.c5')}</option>
                                    <option value="c6">{t('main.cognitive.c6')}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {t('modal.type')}
                                </label>
                                <select
                                    id="type"
                                    value={formData.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    className="input"
                                >
                                    <option value="random">{t('types.random')}</option>
                                    <option value="multipleChoice">{t('types.multipleChoice')}</option>
                                    <option value="essay">{t('types.essay')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Total Questions */}
                        <div>
                            <label htmlFor="total" className="block text-sm font-semibold text-neutral-700 mb-2">
                                {t('modal.total')}
                            </label>
                            <input
                                type="number"
                                id="total"
                                min="1"
                                max="100"
                                value={formData.total}
                                onChange={(e) => handleChange('total', parseInt(e.target.value) || 1)}
                                className="input"
                            />
                            <p className="text-xs text-neutral-500 mt-1">Maksimal 100 soal per batch</p>
                        </div>

                        {/* Reference */}
                        <div>
                            <label htmlFor="reference" className="block text-sm font-semibold text-neutral-700 mb-2">
                                {t('modal.reference')} <span className="text-neutral-400 font-normal text-xs ml-1">(Opsional)</span>
                            </label>
                            <textarea
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => handleChange('reference', e.target.value)}
                                className="input min-h-[100px] resize-y"
                                placeholder="Tambahkan referensi materi atau konteks..."
                            />
                            <div className="mt-2">
                                <label className="btn btn-secondary text-sm gap-2 cursor-pointer inline-flex">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={isParsing}
                                    />
                                    {isParsing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                            {t('modal.uploading')}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            {t('modal.uploadPdf')}
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-neutral-200 flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg gap-2 group w-full md:w-auto"
                            >
                                <HiSparkles className="text-xl transition-transform duration-200 group-hover:rotate-12" />
                                {t('modal.generate')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleManualSubmit} className="p-8 space-y-6 animate-fade-in">
                        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-6">
                            <p className="text-neutral-600 text-sm">
                                Mode ini memungkinkan Anda untuk membuat soal secara manual. Anda akan diarahkan ke editor soal dengan template kosong yang sudah dikonfigurasi sesuai pilihan Anda.
                            </p>
                        </div>

                        {/* Topic & Grade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="manual-topic" className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {t('modal.topic')} <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="manual-topic"
                                    value={manualData.topic}
                                    onChange={(e) => handleManualChange('topic', e.target.value)}
                                    className="input"
                                    placeholder={t('modal.topicPlaceholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="manual-grade" className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {t('modal.grade')} <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    id="manual-grade"
                                    value={manualData.grade}
                                    onChange={(e) => handleManualChange('grade', e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="">{t('modal.gradePlaceholder')}</option>
                                    <option value="X">Kelas X</option>
                                    <option value="XI">Kelas XI</option>
                                    <option value="XII">Kelas XII</option>
                                </select>
                            </div>
                        </div>

                        {/* Difficulty & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="manual-difficulty" className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {t('modal.difficulty')}
                                </label>
                                <select
                                    id="manual-difficulty"
                                    value={manualData.difficulty}
                                    onChange={(e) => handleManualChange('difficulty', e.target.value)}
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
                            <div>
                                <label htmlFor="manual-type" className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {t('modal.type')}
                                </label>
                                <select
                                    id="manual-type"
                                    value={manualData.type}
                                    onChange={(e) => handleManualChange('type', e.target.value)}
                                    className="input"
                                >
                                    <option value="essay">{t('types.essay')}</option>
                                    <option value="multipleChoice">{t('types.multipleChoice')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-neutral-200 flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg gap-2 group w-full md:w-auto"
                            >
                                <HiPencilSquare className="text-xl" />
                                Mulai Menulis Soal
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
