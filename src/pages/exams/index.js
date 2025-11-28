import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import { HiPlus, HiClipboard, HiChartBar, HiAcademicCap, HiTrash } from 'react-icons/hi2';
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

  const copyExamLink = (examId) => {
    const link = `${window.location.origin}/exam/${examId}/start`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: 'Link Disalin!',
      text: 'Link ujian telah disalin ke clipboard.',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
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
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiAcademicCap className="w-8 h-8 text-brand-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Belum ada ujian</h3>
              <p className="text-neutral-600 mb-6">Buat ujian pertama Anda untuk mulai menguji siswa.</p>
              <button
                onClick={() => router.push('/exams/create')}
                className="text-brand-600 font-medium hover:underline"
              >
                Buat Ujian Sekarang
              </button>
            </div>
          ) : (
            <div className="grid gap-6 animate-fade-in">
              {exams.map((exam) => (
                <div key={exam.id} className="card bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-brand-50 text-brand-800">
                          {exam.class || 'Umum'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-neutral-100 text-neutral-600">
                          {exam.duration} Menit
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            exam.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {exam.status === 'active' ? 'Aktif' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-neutral-500 mt-1">
                        Kode Ujian: <span className="font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">{exam.code}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => copyExamLink(exam.id)}
                        className="btn btn-secondary flex-1 md:flex-none justify-center gap-2 text-sm"
                        title="Salin Link Ujian"
                      >
                        <HiClipboard className="w-4 h-4" />
                        <span className="md:hidden">Salin Link</span>
                      </button>
                      <button
                        onClick={() => router.push(`/exams/${exam.id}/results`)}
                        className="btn btn-secondary flex-1 md:flex-none justify-center gap-2 text-sm"
                        title="Lihat Hasil"
                      >
                        <HiChartBar className="w-4 h-4" />
                        <span className="md:hidden">Hasil</span>
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="btn btn-icon text-red-500 hover:bg-red-50 hover:text-red-600"
                        title="Hapus Ujian"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
