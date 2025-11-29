import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import AuthGuard from '@/components/auth-guard';
import { useRouter } from 'next/router';
import { HiArrowLeft, HiCheckCircle, HiUserGroup, HiExclamationTriangle } from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';
import Preview from '@/components/preview';
import { normalizeQuestion } from '@/utils/questionAdapter';

export default function CreateExam() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({ nama: '', nuptk: '' });
  
  // Classes State
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    classId: '',    // Changed from 'class' to 'classId' for clarity
    duration: 60,
    status: 'active'
  });

  // Questions State
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  useEffect(() => {
    // Get user details from localStorage
    const nupkt = localStorage.getItem('nupkt');
    const password = localStorage.getItem('password');

    if (nupkt) {
      const foundUser = users.find(u => u.NUPTK === nupkt && u.Password === password);
      if (foundUser) {
        setUser({ nama: foundUser.Nama, nuptk: foundUser.NUPTK });
      } else {
        setUser({ nama: 'User', nuptk: nupkt });
      }
    }

    // Fetch data
    fetchQuestions();
  }, []);

  // Fetch classes when user is available
  useEffect(() => {
    if (user.nuptk) {
      fetchClasses();
    }
  }, [user.nuptk]);

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const response = await fetch(`/api/classes?teacher_nuptk=${user.nuptk}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

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

  // Get selected class details for display
  const selectedClass = classes.find(c => c.id === formData.classId);

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
        title: formData.title,
        classId: formData.classId,           // Send classId
        className: selectedClass?.name || '', // Also send class name for display
        classGrade: selectedClass?.grade || '',
        duration: formData.duration,
        status: formData.status,
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
        html: `Ujian "<b>${createdExam.title}</b>" berhasil dibuat.<br/>Kode Ujian: <code class="bg-neutral-100 px-2 py-1 rounded font-mono">${createdExam.code}</code>`,
        timer: 3000,
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

  return (
    <AuthGuard>
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
                {/* Title */}
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

                {/* Class Selection - CRITICAL */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Pilih Kelas <span className="text-red-500">*</span>
                  </label>
                  
                  {isLoadingClasses ? (
                    <div className="input flex items-center gap-2 text-neutral-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-600 border-t-transparent"></div>
                      Memuat daftar kelas...
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <HiExclamationTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-warning-800">
                            Anda belum memiliki kelas
                          </p>
                          <p className="text-sm text-warning-700 mt-1">
                            Buat kelas terlebih dahulu untuk dapat membuat ujian.
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push('/classes')}
                            className="btn btn-sm bg-warning-600 hover:bg-warning-700 text-white mt-3"
                          >
                            Buat Kelas Baru
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleInputChange}
                        className="input"
                        required
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.grade}) - {cls.students?.length || 0} siswa
                          </option>
                        ))}
                      </select>
                      
                      {/* Selected Class Info */}
                      {selectedClass && (
                        <div className="mt-3 bg-brand-50 border border-brand-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                              <HiUserGroup className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-neutral-900">{selectedClass.name}</p>
                              <p className="text-sm text-neutral-600">
                                Kelas {selectedClass.grade} • {selectedClass.students?.length || 0} siswa terdaftar
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-brand-700 mt-3 bg-brand-100 px-3 py-1.5 rounded-lg inline-block">
                            💡 Hanya siswa yang terdaftar di kelas ini yang dapat mengikuti ujian
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Durasi Ujian (Menit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="input"
                    min="1"
                    max="300"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Waktu yang diberikan kepada siswa untuk menyelesaikan ujian
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.title) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Judul Wajib Diisi',
                          text: 'Mohon isi judul ujian terlebih dahulu.',
                          customClass: { popup: 'rounded-xl' }
                        });
                        return;
                      }
                      if (!formData.classId) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Pilih Kelas',
                          text: 'Mohon pilih kelas untuk ujian ini.',
                          customClass: { popup: 'rounded-xl' }
                        });
                        return;
                      }
                      setStep(2);
                    }}
                    className="btn btn-primary"
                    disabled={classes.length === 0}
                  >
                    Lanjut: Pilih Soal
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10">
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900">Pilih Soal</h3>
                    <p className="text-sm text-neutral-500">
                      {selectedQuestionIds.length} soal dipilih untuk <span className="font-medium text-brand-600">{selectedClass?.name}</span>
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
    </AuthGuard>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
