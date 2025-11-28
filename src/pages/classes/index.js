import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import AuthGuard from '@/components/auth-guard';
import { useRouter } from 'next/router';
import { HiPlus, HiAcademicCap } from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import ClassCard from '@/modules/classroom/components/ClassCard';
import CreateClassModal from '@/modules/classroom/components/CreateClassModal';

export default function Classes() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [user, setUser] = useState({ nama: '', nuptk: '' });
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Get user details
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
  }, []);

  const fetchClasses = async () => {
    if (!user.nuptk) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes?teacher_nuptk=${user.nuptk}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.nuptk) {
      fetchClasses();
    }
  }, [user.nuptk]);

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
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

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900">Manajemen Kelas</h1>
              <p className="text-neutral-600 mt-1">Kelola kelas dan siswa Anda di sini.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary btn-lg shadow-lg shadow-brand-500/20"
            >
              <HiPlus className="w-5 h-5" />
              Buat Kelas Baru
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm animate-fade-in">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiAcademicCap className="w-10 h-10 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Belum Ada Kelas</h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Anda belum memiliki kelas. Buat kelas baru untuk mulai mengelola siswa dan membagikan soal.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-outline"
              >
                Buat Kelas Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {classes.map((cls) => (
                <ClassCard key={cls.id} data={cls} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchClasses}
        userNuptk={user.nuptk}
      />
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
