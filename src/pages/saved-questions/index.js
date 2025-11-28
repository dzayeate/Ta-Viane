import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import { HiArrowLeft, HiDocumentText, HiTrash, HiChartBar, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import { normalizeQuestion } from '@/utils/questionAdapter';
import Preview from '@/components/preview';
import Swal from 'sweetalert2';

export default function SavedQuestions() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ nama: '', nuptk: '' });

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');

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
                setQuestions(normalizedData);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        const result = await Swal.fire({
            title: 'Hapus Soal?',
            text: "Soal yang dihapus tidak dapat dikembalikan!",
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
                const response = await fetch('/api/questions', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questionId, userNuptk: user.nuptk }),
                });

                if (response.ok) {
                    setQuestions(prev => prev.filter(q => q.id !== questionId));
                    Swal.fire({
                        title: 'Terhapus!',
                        text: 'Soal berhasil dihapus.',
                        icon: 'success',
                        confirmButtonColor: '#0ea5e9',
                        customClass: { popup: 'rounded-xl' }
                    });
                } else {
                    const data = await response.json();
                    Swal.fire({
                        title: 'Gagal!',
                        text: data.message || 'Gagal menghapus soal.',
                        icon: 'error',
                        customClass: { popup: 'rounded-xl' }
                    });
                }
            } catch (error) {
                console.error('Error deleting question:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Terjadi kesalahan saat menghapus soal.',
                    icon: 'error',
                    customClass: { popup: 'rounded-xl' }
                });
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('nupkt');
        localStorage.removeItem('password');
        router.push('/');
    };

    // Derived State: Stats
    const stats = useMemo(() => {
        const topics = questions.map(q => q.topic).filter(Boolean);
        const topicCounts = topics.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
        const mostCommonTopic = Object.keys(topicCounts).reduce((a, b) => topicCounts[a] > topicCounts[b] ? a : b, '-') || '-';

        const grades = questions.map(q => q.grade).filter(Boolean);
        const gradeCounts = grades.reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
        const gradeDistribution = Object.entries(gradeCounts)
            .map(([g, c]) => `${g}: ${c}`)
            .join(', ') || '-';

        return {
            total: questions.length,
            mostCommonTopic,
            gradeDistribution
        };
    }, [questions]);

    // Derived State: Filtered Questions
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = (q.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (q.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (q.prompt || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGrade = filterGrade ? q.grade === filterGrade : true;
            const matchesDifficulty = filterDifficulty ? (q.difficulty || '').toLowerCase() === filterDifficulty.toLowerCase() : true;
            
            return matchesSearch && matchesGrade && matchesDifficulty;
        });
    }, [questions, searchQuery, filterGrade, filterDifficulty]);

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
                    <div className="mb-8">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-neutral-600 hover:text-brand-600 transition-colors mb-4"
                        >
                            <HiArrowLeft className="w-5 h-5" />
                            <span>Kembali ke Beranda</span>
                        </button>
                        <h1 className="text-4xl font-display font-bold text-neutral-900">
                            Bank Soal Tersimpan
                        </h1>
                        <p className="text-neutral-700 mt-2 text-lg">
                            Kelola dan cari soal yang telah Anda buat.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                                <HiDocumentText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Total Soal</p>
                                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <HiChartBar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Topik Terbanyak</p>
                                <p className="text-lg font-bold text-neutral-900 truncate max-w-[200px]" title={stats.mostCommonTopic}>
                                    {stats.mostCommonTopic}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <HiFunnel className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Sebaran Kelas</p>
                                <p className="text-lg font-bold text-neutral-900">{stats.gradeDistribution}</p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">
                        <div className="relative w-full md:w-96">
                            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari judul atau isi soal..."
                                className="input pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <select 
                                className="input min-w-[140px]"
                                value={filterGrade} 
                                onChange={(e) => setFilterGrade(e.target.value)}
                            >
                                <option value="">Semua Kelas</option>
                                <option value="X">Kelas X</option>
                                <option value="XI">Kelas XI</option>
                                <option value="XII">Kelas XII</option>
                            </select>
                            <select 
                                className="input min-w-[140px]"
                                value={filterDifficulty} 
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                            >
                                <option value="">Semua Level</option>
                                <option value="easy">Mudah (C1-C2)</option>
                                <option value="medium">Sedang (C3-C4)</option>
                                <option value="hard">Sulit (C5-C6)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 shadow-sm animate-fade-in">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiDocumentText className="w-8 h-8 text-neutral-500" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">Tidak ada soal ditemukan</h3>
                            <p className="text-neutral-600 mb-6 text-lg">Coba ubah filter pencarian Anda atau buat soal baru.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterGrade('');
                                    setFilterDifficulty('');
                                }}
                                className="text-brand-600 font-medium hover:underline"
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 animate-fade-in">
                            {filteredQuestions.map((q, index) => (
                                <div key={index} className="card bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
                                    {/* Card Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                    q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                    q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    q.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                                                    'bg-neutral-100 text-neutral-800'
                                                }`}>
                                                    {q.difficulty || 'Random'}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-brand-50 text-brand-800">
                                                    {q.type || 'Essay'}
                                                </span>
                                                {q.grade && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-purple-50 text-purple-800">
                                                        Kelas {q.grade}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-neutral-900 leading-tight">
                                                {q.title || 'Soal Tanpa Judul'}
                                            </h3>
                                            <p className="text-sm text-neutral-500 mt-1">
                                                Topik: <span className="font-medium text-neutral-700">{q.topic || '-'}</span>
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 self-end md:self-start">
                                            <div className="text-right">
                                                <div className="text-xs text-neutral-500">
                                                    {new Date(q.savedAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                                {q.author && (
                                                    <div className="text-xs font-medium text-neutral-500">
                                                        {q.author.name}
                                                    </div>
                                                )}
                                            </div>
                                            {q.author?.nupkt === user.nuptk && (
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="btn btn-icon text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    title="Hapus Soal"
                                                >
                                                    <HiTrash className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-100 mb-4">
                                        <div className="prose prose-lg max-w-none text-neutral-800">
                                            <Preview>{q.content || q.prompt || q.description}</Preview>
                                        </div>
                                        
                                        {q.options && q.options.length > 0 && (
                                            <div className="mt-4 grid gap-2">
                                                {q.options.map((opt, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-neutral-700">
                                                        <span className="font-bold text-brand-600 w-6">{opt.label}.</span>
                                                        <span><Preview>{opt.text}</Preview></span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer (Answer) */}
                                    {q.answer && (
                                        <details className="group">
                                            <summary className="flex items-center gap-2 cursor-pointer text-brand-600 font-medium hover:text-brand-700 select-none">
                                                <span>Lihat Pembahasan</span>
                                                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </summary>
                                            <div className="mt-3 pt-3 border-t border-neutral-100 prose prose-neutral max-w-none text-neutral-600">
                                                <Preview>{q.answer}</Preview>
                                            </div>
                                        </details>
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
