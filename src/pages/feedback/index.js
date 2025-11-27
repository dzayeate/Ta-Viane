import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import users from '@/mock/users/index.json';

export default function Feedback() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [user, setUser] = useState({ nama: '', nuptk: '' });

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

    // Load Tally
    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
        onOpenModal={() => router.push('/create-question')}
        onAddQuestion={() => router.push('/')}
        onOpenReview={() => router.push('/')}
      />
      <main className="flex-1 pt-20 lg:pt-8 pb-12 px-4 lg:px-8 overflow-x-hidden h-screen overflow-y-auto">
         <div className="max-w-5xl mx-auto h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">Feedback</h1>
                <p className="text-neutral-600">Masukan Anda sangat berharga untuk pengembangan aplikasi ini.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 min-h-[600px]">
                <iframe 
                    data-tally-src={`https://tally.so/embed/m61EBN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&nuptk=${user.nuptk}&nama=${user.nama}`}
                    loading="lazy" 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    marginHeight="0" 
                    marginWidth="0" 
                    title="Feedback Form"
                    className="w-full h-full min-h-[600px]"
                ></iframe>
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
