import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/router';
import { 
    HiArrowLeft, 
    HiDocumentText, 
    HiTrash, 
    HiChartBar, 
    HiMagnifyingGlass, 
    HiFunnel,
    HiAcademicCap,
    HiBookOpen,
    HiSparkles,
    HiFolder
} from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import { normalizeQuestion } from '@/utils/questionAdapter';
import Preview from '@/components/preview';
import Swal from 'sweetalert2';

// Helper: Map difficulty to display info
const getDifficultyInfo = (difficulty) => {
    const map = {
        easy: { label: 'Mudah', color: 'badge-success' },
        medium: { label: 'Sedang', color: 'badge-warning' },
        hard: { label: 'Sulit', color: 'badge-danger' },
        c1: { label: 'C1', color: 'badge-success' },
        c2: { label: 'C2', color: 'badge-success' },
        c3: { label: 'C3', color: 'badge-warning' },
        c4: { label: 'C4', color: 'badge-warning' },
        c5: { label: 'C5', color: 'badge-danger' },
        c6: { label: 'C6', color: 'badge-danger' },
    };
    return map[difficulty?.toLowerCase()] || { label: difficulty || 'Random', color: 'badge-neutral' };
};

// Helper: Map type to display info
const getTypeInfo = (type) => {
    const map = {
        essay: { label: 'Essay', icon: HiDocumentText },
        multiplechoice: { label: 'Pilihan Ganda', icon: HiSparkles },
    };
    return map[type?.toLowerCase()] || { label: type || 'Essay', icon: HiDocumentText };
};

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

                    {/* Toolbar - Filters */}
                    <div className="card mb-8 sticky top-0 z-10">
                        <div className="card-body flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari judul atau isi soal..."
                                    className="input input-lg pl-12"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {/* Filter Dropdowns */}
                            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                <select 
                                    className="input input-lg min-w-[160px] cursor-pointer"
                                    value={filterGrade} 
                                    onChange={(e) => setFilterGrade(e.target.value)}
                                >
                                    <option value="">Semua Kelas</option>
                                    <option value="X">Kelas X</option>
                                    <option value="XI">Kelas XI</option>
                                    <option value="XII">Kelas XII</option>
                                </select>
                                <select 
                                    className="input input-lg min-w-[160px] cursor-pointer"
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
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        /* Empty State - Improved */
                        <div className="card animate-fade-in">
                            <div className="card-body py-16 text-center">
                                {/* Illustration */}
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-purple-100 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                        <HiFolder className="w-14 h-14 text-brand-300" />
                                    </div>
                                    {/* Decorative elements */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                                        <HiMagnifyingGlass className="w-4 h-4 text-accent-500" />
                                    </div>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-success-100 rounded-full"></div>
                                </div>
                                
                                <h3 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                                    Tidak ada soal ditemukan
                                </h3>
                                <p className="text-neutral-500 mb-8 text-lg max-w-md mx-auto">
                                    {questions.length === 0 
                                        ? 'Bank soal masih kosong. Mulai buat soal pertama Anda!'
                                        : 'Coba ubah filter pencarian atau gunakan kata kunci lain.'}
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    {(searchQuery || filterGrade || filterDifficulty) && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterGrade('');
                                                setFilterDifficulty('');
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            <HiFunnel className="w-4 h-4" />
                                            Reset Filter
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push('/')}
                                        className="btn btn-primary"
                                    >
                                        <HiSparkles className="w-4 h-4" />
                                        Buat Soal Baru
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 animate-fade-in">
                            {filteredQuestions.map((q, index) => {
                                const difficultyInfo = getDifficultyInfo(q.difficulty);
                                const typeInfo = getTypeInfo(q.type);
                                const TypeIcon = typeInfo.icon;
                                
                                return (
                                    <div key={index} className="card card-hover">
                                        {/* Card Header - Metadata Row */}
                                        <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            {/* Metadata Badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {q.grade && (
                                                    <span className="badge badge-primary badge-lg">
                                                        <HiAcademicCap className="w-3.5 h-3.5" />
                                                        Kelas {q.grade}
                                                    </span>
                                                )}
                                                {q.topic && (
                                                    <span className="badge badge-neutral badge-lg">
                                                        <HiBookOpen className="w-3.5 h-3.5" />
                                                        {q.topic}
                                                    </span>
                                                )}
                                                <span className={`badge badge-lg ${difficultyInfo.color}`}>
                                                    {difficultyInfo.label}
                                                </span>
                                                <span className="badge badge-neutral badge-lg">
                                                    <TypeIcon className="w-3.5 h-3.5" />
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            
                                            {/* Date & Actions */}
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-meta">
                                                        {new Date(q.savedAt).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </div>
                                                    {q.author && (
                                                        <div className="text-caption font-medium">
                                                            {q.author.name}
                                                        </div>
                                                    )}
                                                </div>
                                                {q.author?.nupkt === user.nuptk && (
                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        className="btn btn-icon btn-ghost text-danger-500 hover:bg-danger-50 hover:text-danger-600"
                                                        title="Hapus Soal"
                                                    >
                                                        <HiTrash className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body - Question Content */}
                                        <div className="card-body">
                                            {/* Question Title */}
                                            {q.title && (
                                                <h3 className="text-title text-xl mb-3">
                                                    {q.title}
                                                </h3>
                                            )}
                                            
                                            {/* Question Text - Prominent */}
                                            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                                                <div className="prose prose-lg max-w-none text-neutral-800">
                                                    <Preview>{q.content || q.prompt || q.description}</Preview>
                                                </div>
                                                
                                                {/* Options for Multiple Choice */}
                                                {q.options && q.options.length > 0 && (
                                                    <div className="mt-5 pt-5 border-t border-neutral-200 space-y-2">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors">
                                                                <span className="badge badge-primary font-bold min-w-[28px] justify-center">
                                                                    {opt.label}
                                                                </span>
                                                                <span className="text-body flex-1">
                                                                    <Preview>{opt.text}</Preview>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer - Answer/Discussion */}
                                        {q.answer && (
                                            <div className="card-footer border-t border-neutral-100">
                                                <details className="group">
                                                    <summary className="flex items-center gap-2 cursor-pointer text-brand-600 font-semibold hover:text-brand-700 select-none py-1">
                                                        <span>Lihat Pembahasan</span>
                                                        <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </summary>
                                                    <div className="mt-4 prose prose-neutral max-w-none text-neutral-600 bg-success-50/50 rounded-lg p-4 border border-success-100">
                                                        <Preview>{q.answer}</Preview>
                                                    </div>
                                                </details>
                                            </div>
                                        )}
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
