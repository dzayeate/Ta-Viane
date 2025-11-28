import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import AuthGuard from '@/components/auth-guard';
import { useRouter } from 'next/router';
import { HiArrowLeft, HiUserGroup, HiClipboardDocumentCheck, HiAcademicCap } from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';

export default function ClassDetail() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  
  const [user, setUser] = useState({ nama: '', nuptk: '' });
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchClassData = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/classes?id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setClassData(data);
        } else {
          router.push('/classes');
        }
      } catch (error) {
        console.error('Error fetching class:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
  };

  const copyInviteLink = () => {
    if (!classData) return;
    const link = `${window.location.origin}/join/${classData.classCode}`;
    navigator.clipboard.writeText(link);
    Swal.fire({
      icon: 'success',
      title: 'Link Disalin!',
      text: 'Link undangan berhasil disalin ke clipboard.',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!classData) return null;

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/classes')}
              className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 transition-colors mb-4"
            >
              <HiArrowLeft className="w-5 h-5" />
              <span>Kembali ke Daftar Kelas</span>
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-display font-bold text-neutral-900">{classData.name}</h1>
                  <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Active
                  </span>
                </div>
                <p className="text-neutral-600 flex items-center gap-2 text-lg">
                  <HiAcademicCap className="w-5 h-5 text-neutral-400" />
                  {classData.grade} • {classData.school || 'Sekolah Tidak Diketahui'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Kode Kelas</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-bold text-neutral-900 tracking-widest">{classData.classCode}</span>
                  <button 
                    onClick={copyInviteLink}
                    className="btn btn-primary btn-sm"
                  >
                    <HiClipboardDocumentCheck className="w-5 h-5" />
                    Salin Link Undangan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <HiUserGroup className="w-6 h-6 text-brand-600" />
                Daftar Siswa ({classData.students?.length || 0})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-sm font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Lengkap</th>
                    <th className="px-6 py-4">NISN</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Bergabung Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {classData.students && classData.students.length > 0 ? (
                    classData.students.map((student, index) => (
                      <tr key={student.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-neutral-500">{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-neutral-900">{student.name}</td>
                        <td className="px-6 py-4 font-mono text-neutral-600">{student.nisn}</td>
                        <td className="px-6 py-4 text-neutral-600">{student.email || '-'}</td>
                        <td className="px-6 py-4 text-neutral-500 text-sm">
                          {new Date(student.joinedAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">
                        Belum ada siswa yang bergabung di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
