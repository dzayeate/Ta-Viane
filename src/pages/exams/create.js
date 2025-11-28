import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import { HiArrowLeft, HiCheckCircle, HiDocumentText } from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';
import Preview from '@/components/preview';
import { normalizeQuestion } from '@/utils/questionAdapter';

export default function CreateExam() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nama: '', nuptk: '' });
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    class: '',
    duration: 60,
    status: 'active'
  });

  // Questions State
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  useEffect(() => {
    // Check login
    const nupkt = localStorage.getItem('nupkt');
    const password = localStorage.getItem('password');

    if (!nupkt) {
      router.push('/');
      return;
    }

    // Get user details
    const foundUser = users.find(u => u.NUPTK === nupkt && u.Password === password);
    if (foundUser) {
      setUser({ nama: foundUser.Nama, nuptk: foundUser.NUPTK });
      setIsLoggedIn(true);
    } else {
      setUser({ nama: 'User', nuptk: nupkt });
      setIsLoggedIn(true);
    }

    // Fetch questions
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        const normalizedData = data.reverse().map(normalizeQuestion);
        setAvailableQuestions(normalizedData);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleQuestionSelection = (id) => {
    setSelectedQuestionIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(qId => qId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedQuestionIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Soal',
        text: 'Mohon pilih minimal satu soal untuk ujian ini.',
        customClass: { popup: 'rounded-xl' }
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedQuestions = availableQuestions.filter(q => selectedQuestionIds.includes(q.id));
      
      const payload = {
        ...formData,
        questions: selectedQuestions,
        teacher_nuptk: user.nuptk,
        teacher_name: user.nama
      };

      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Always try to get response body for better error messages
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create exam (${response.status})`);
      }

      const createdExam = await response.json();
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Ujian "${createdExam.title}" berhasil dibuat dengan kode: ${createdExam.code}`,
        timer: 2500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl' }
      }).then(() => {
        router.push('/exams');
      });
    } catch (error) {
      console.error('Error creating exam:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Terjadi kesalahan saat membuat ujian.',
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar
        t={t}
        user={user}
        onLogout={handleLogout}
        onOpenModal={() => router.push('/')}
        onAddQuestion={() => router.push('/')}
        onOpenReview={() => router.push('/')}
        questionCount={0}
      />

      <main className="flex-1 pt-20 lg:pt-8 pb-12 px-4 lg:px-8 overflow-x-hidden h-screen overflow-y-auto">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/exams')}
              className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 transition-colors mb-4"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Kembali ke Daftar Ujian</span>
            </button>
            <h1 className="text-3xl font-display font-bold text-neutral-900">
              Buat Ujian Baru
            </h1>
            <p className="text-neutral-600 mt-1">
              Lengkapi informasi ujian dan pilih soal dari bank soal.
            </p>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600 font-bold' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-brand-600 bg-brand-50' : 'border-neutral-300'}`}>1</div>
              <span>Informasi Ujian</span>
            </div>
            <div className="w-12 h-0.5 bg-neutral-200"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600 font-bold' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-brand-600 bg-brand-50' : 'border-neutral-300'}`}>2</div>
              <span>Pilih Soal</span>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="animate-fade-in">
            {step === 1 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Judul Ujian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Contoh: Ujian Akhir Semester Fisika X"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Pilih Kelas</option>
                      <option value="X">Kelas X</option>
                      <option value="XI">Kelas XI</option>
                      <option value="XII">Kelas XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      Durasi (Menit) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="input"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.title || !formData.class) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Lengkapi Data',
                          text: 'Mohon isi Judul dan Kelas terlebih dahulu.',
                          customClass: { popup: 'rounded-xl' }
                        });
                        return;
                      }
                      setStep(2);
                    }}
                    className="btn btn-primary"
                  >
                    Lanjut: Pilih Soal
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex justify-between items-center sticky top-0 z-10">
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900">Pilih Soal</h3>
                    <p className="text-sm text-neutral-500">
                      {selectedQuestionIds.length} soal dipilih
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-ghost"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary gap-2"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <HiCheckCircle className="w-5 h-5" />
                      )}
                      Simpan Ujian
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {availableQuestions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                      <p className="text-neutral-500">Belum ada soal di Bank Soal.</p>
                      <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="text-brand-600 font-medium hover:underline mt-2"
                      >
                        Buat Soal Baru
                      </button>
                    </div>
                  ) : (
                    availableQuestions.map((q) => (
                      <div 
                        key={q.id} 
                        className={`card p-6 cursor-pointer transition-all border-2 ${
                          selectedQuestionIds.includes(q.id) 
                            ? 'border-brand-500 bg-brand-50/30' 
                            : 'border-transparent hover:border-neutral-200 bg-white'
                        }`}
                        onClick={() => toggleQuestionSelection(q.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selectedQuestionIds.includes(q.id)}
                              onChange={() => {}} // Handled by parent div click
                              className="w-5 h-5 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                              <span className="badge badge-neutral text-xs">{q.type}</span>
                              <span className="badge badge-primary text-xs">{q.difficulty}</span>
                            </div>
                            <h4 className="font-bold text-neutral-900 mb-2">{q.title || 'Soal Tanpa Judul'}</h4>
                            <div className="prose prose-sm max-w-none text-neutral-600 line-clamp-3">
                              <Preview>{q.content || q.prompt}</Preview>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </form>
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
