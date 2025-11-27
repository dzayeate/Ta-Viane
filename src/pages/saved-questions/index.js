import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import { HiArrowLeft, HiDocumentText } from 'react-icons/hi2';
import users from '@/mock/users/index.json';

export default function SavedQuestions() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [questions, setQuestions] = useState([]);
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
            // If user not found in mock but has token (shouldn't happen ideally), just show NUPTK
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
                // Sort by newest first
                setQuestions(data.reverse());
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('nupkt');
        localStorage.removeItem('password');
        router.push('/');
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
                questionCount={0} // No active generation session here
            />

            <main className="flex-1 pt-20 lg:pt-8 pb-12 px-4 lg:px-8 overflow-x-hidden h-screen overflow-y-auto">
                {/* Background Pattern */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-down">
                        <div>
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 transition-colors mb-4"
                            >
                                <HiArrowLeft className="w-5 h-5" />
                                <span>Kembali ke Beranda</span>
                            </button>
                            <h1 className="text-3xl font-display font-bold text-neutral-900">
                                Bank Soal Tersimpan
                            </h1>
                            <p className="text-neutral-600 mt-2">
                                Daftar soal yang telah dibuat dan disimpan oleh guru.
                            </p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-neutral-200 self-start md:self-center">
                            <span className="font-bold text-brand-600 text-xl">{questions.length}</span>
                            <span className="text-neutral-500 ml-2">Soal</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 shadow-sm animate-fade-in">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiDocumentText className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">Belum ada soal tersimpan</h3>
                            <p className="text-neutral-500 mb-6">Buat soal baru dengan AI untuk mulai mengisi bank soal.</p>
                            <button
                                onClick={() => router.push('/')}
                                className="btn btn-primary"
                            >
                                Buat Soal Baru
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 animate-fade-in">
                            {questions.map((q, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                    q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                                            'bg-neutral-100 text-neutral-700'
                                                }`}>
                                                {q.difficulty || 'Random'}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                                                {q.type || 'Essay'}
                                            </span>
                                            {q.grade && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                                    {q.grade}
                                                </span>
                                            )}
                                            {q.topic && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {q.topic}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-xs text-neutral-400">
                                                {new Date(q.savedAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                            {q.author && (
                                                <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                                                    Oleh: {q.author.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg text-neutral-900 mb-2">Soal:</h3>
                                        <div className="prose prose-sm max-w-none text-neutral-700 bg-neutral-50 p-4 rounded-lg">
                                            {q.prompt || q.description}
                                        </div>
                                    </div>

                                    {q.answer && (
                                        <div>
                                            <h3 className="font-bold text-sm text-neutral-900 mb-2">Jawaban/Pembahasan:</h3>
                                            <div className="prose prose-sm max-w-none text-neutral-600 border-l-4 border-brand-200 pl-4">
                                                {q.answer}
                                            </div>
                                        </div>
                                    )}
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
