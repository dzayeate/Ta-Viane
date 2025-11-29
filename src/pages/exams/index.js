import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import { 
  HiPlus, 
  HiChartBar, 
  HiAcademicCap, 
  HiTrash,
  HiClock,
  HiUsers,
  HiDocumentText,
  HiPencilSquare,
  HiLink,
  HiCheckBadge,
  HiExclamationCircle
} from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';

export default function ExamDashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ nama: '', nuptk: '' });

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

    // Fetch exams
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      // Mock data fallback if API fails or is empty (optional, but good for dev)
      // setExams([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
  };

  const copyExamLink = (examId, examCode) => {
    const link = `${window.location.origin}/exam/${examId}/start`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: 'Link Disalin!',
      html: `<p class="text-neutral-600">Link ujian telah disalin ke clipboard.</p>
             <p class="mt-2 font-mono bg-neutral-100 p-2 rounded-lg text-sm break-all">${link}</p>`,
      timer: 2500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      published: {
        label: 'Dipublikasi',
        bgColor: 'bg-success-50',
        textColor: 'text-success-700',
        borderColor: 'border-success-200',
        icon: HiCheckBadge
      },
      active: {
        label: 'Aktif',
        bgColor: 'bg-success-50',
        textColor: 'text-success-700',
        borderColor: 'border-success-200',
        icon: HiCheckBadge
      },
      draft: {
        label: 'Draft',
        bgColor: 'bg-warning-50',
        textColor: 'text-warning-700',
        borderColor: 'border-warning-200',
        icon: HiExclamationCircle
      }
    };
    return configs[status] || configs.draft;
  };

  const handleDelete = async (examId) => {
      const result = await Swal.fire({
          title: 'Hapus Ujian?',
          text: "Ujian yang dihapus tidak dapat dikembalikan!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Ya, Hapus',
          cancelButtonText: 'Batal',
          customClass: {
              popup: 'rounded-xl',
              confirmButton: 'px-4 py-2 rounded-lg font-medium',
              cancelButton: 'px-4 py-2 rounded-lg font-medium'
          }
      });

      if (result.isConfirmed) {
          try {
              const response = await fetch(`/api/exams?id=${examId}`, {
                  method: 'DELETE',
              });

              if (response.ok) {
                  setExams(prev => prev.filter(e => e.id !== examId));
                  Swal.fire({
                      title: 'Terhapus!',
                      text: 'Ujian berhasil dihapus.',
                      icon: 'success',
                      confirmButtonColor: '#0ea5e9',
                      customClass: { popup: 'rounded-xl' }
                  });
              } else {
                  throw new Error('Failed to delete');
              }
          } catch (error) {
              Swal.fire({
                  title: 'Gagal!',
                  text: 'Gagal menghapus ujian.',
                  icon: 'error',
                  customClass: { popup: 'rounded-xl' }
              });
          }
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

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900">
                Daftar Ujian
              </h1>
              <p className="text-neutral-600 mt-1">
                Kelola ujian dan pantau hasil siswa.
              </p>
            </div>
            <button
              onClick={() => router.push('/exams/create')}
              className="btn btn-primary gap-2 shadow-lg shadow-brand-500/20"
            >
              <HiPlus className="w-5 h-5" />
              Buat Ujian Baru
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 shadow-sm animate-fade-in">
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HiAcademicCap className="w-10 h-10 text-brand-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Belum ada ujian</h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Buat ujian pertama Anda untuk mulai menguji pemahaman siswa secara digital.
              </p>
              <button
                onClick={() => router.push('/exams/create')}
                className="btn btn-primary btn-lg gap-2"
              >
                <HiPlus className="w-5 h-5" />
                Buat Ujian Sekarang
              </button>
            </div>
          ) : (
            <div className="grid gap-6 animate-fade-in">
              {exams.map((exam) => {
                const statusConfig = getStatusConfig(exam.status);
                const StatusIcon = statusConfig.icon;
                const questionCount = exam.questions?.length || 0;
                
                return (
                  <div 
                    key={exam.id} 
                    className="card overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Card Header */}
                    <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Status Badge */}
                          <span className={`badge ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor} gap-1`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          
                          {/* Subject Badge */}
                          {exam.subject && (
                            <span className="badge badge-primary">
                              {exam.subject}
                            </span>
                          )}
                          
                          {/* Class Badge */}
                          {(exam.class || exam.classId) && (
                            <span className="badge badge-neutral">
                              {exam.class || exam.classId}
                            </span>
                          )}
                        </div>
                        
                        {/* Exam Code */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Kode:</span>
                          <span className="font-mono font-bold text-sm text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-100">
                            {exam.code || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-5">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-neutral-900 mb-4 group-hover:text-brand-600 transition-colors">
                        {exam.title}
                      </h3>
                      
                      {/* Description */}
                      {exam.description && (
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                          {exam.description}
                        </p>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Duration */}
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HiClock className="w-5 h-5 text-brand-600" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Durasi</p>
                            <p className="font-bold text-neutral-900">{exam.duration || 60} menit</p>
                          </div>
                        </div>

                        {/* Question Count */}
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                          <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HiDocumentText className="w-5 h-5 text-success-600" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Soal</p>
                            <p className="font-bold text-neutral-900">{questionCount} soal</p>
                          </div>
                        </div>

                        {/* Grade/Class */}
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                          <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HiUsers className="w-5 h-5 text-warning-600" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Kelas</p>
                            <p className="font-bold text-neutral-900">{exam.grade || exam.class || 'Umum'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/30">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Left: Created Date */}
                        <p className="text-xs text-neutral-400">
                          Dibuat: {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </p>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Copy Link */}
                          <button
                            onClick={() => copyExamLink(exam.id, exam.code)}
                            className="btn btn-sm btn-ghost gap-1.5 text-brand-600 hover:bg-brand-50"
                            title="Salin Link Ujian"
                          >
                            <HiLink className="w-4 h-4" />
                            <span className="hidden sm:inline">Salin Link</span>
                          </button>

                          {/* View Results */}
                          <button
                            onClick={() => router.push(`/exams/${exam.id}/results`)}
                            className="btn btn-sm btn-secondary gap-1.5"
                            title="Lihat Hasil"
                          >
                            <HiChartBar className="w-4 h-4" />
                            <span className="hidden sm:inline">Hasil</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => router.push(`/exams/${exam.id}/edit`)}
                            className="btn btn-sm btn-secondary gap-1.5"
                            title="Edit Ujian"
                          >
                            <HiPencilSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="btn btn-sm btn-ghost text-danger-600 hover:bg-danger-50"
                            title="Hapus Ujian"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
