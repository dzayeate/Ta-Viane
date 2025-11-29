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
    HiFolder,
    HiChevronDown,
    HiChevronUp
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
    const [filterType, setFilterType] = useState('');
    
    // Expanded state for each question card
    const [expandedCards, setExpandedCards] = useState({});
    
    const toggleCardExpand = (index) => {
        setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }));
    };

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
            const matchesType = filterType ? (q.type || '').toLowerCase() === filterType.toLowerCase() : true;
            
            return matchesSearch && matchesGrade && matchesDifficulty && matchesType;
        });
    }, [questions, searchQuery, filterGrade, filterDifficulty, filterType]);

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

            <main className="flex-1 pt-20 lg:pt-0 pb-6 overflow-x-hidden h-screen overflow-y-auto">
                {/* Background Pattern */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                </div>

                {/* Sticky Toolbar */}
                <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
                    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3">
                        {/* Top Row: Back + Title + Stats */}
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.push('/')}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                    title="Kembali"
                                >
                                    <HiArrowLeft className="w-5 h-5 text-neutral-600" />
                                </button>
                                <h1 className="text-xl font-display font-bold text-neutral-900">
                                    Bank Soal
                                </h1>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-neutral-500">
                                    <span className="font-bold text-neutral-900">{stats.total}</span> soal
                                </span>
                                <span className="text-neutral-500">
                                    <span className="font-bold text-brand-600">{filteredQuestions.length}</span> ditampilkan
                                </span>
                            </div>
                        </div>
                        
                        {/* Search & Filters Row */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari soal..."
                                    className="input pl-10 py-2 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {/* Filter Badges/Selects */}
                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                <select 
                                    className="input py-2 text-sm min-w-[100px] cursor-pointer"
                                    value={filterGrade} 
                                    onChange={(e) => setFilterGrade(e.target.value)}
                                >
                                    <option value="">Kelas</option>
                                    <option value="X">X</option>
                                    <option value="XI">XI</option>
                                    <option value="XII">XII</option>
                                </select>
                                <select 
                                    className="input py-2 text-sm min-w-[100px] cursor-pointer"
                                    value={filterDifficulty} 
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                >
                                    <option value="">Level</option>
                                    <option value="easy">Mudah</option>
                                    <option value="medium">Sedang</option>
                                    <option value="hard">Sulit</option>
                                </select>
                                <select 
                                    className="input py-2 text-sm min-w-[100px] cursor-pointer"
                                    value={filterType} 
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="">Tipe</option>
                                    <option value="essay">Essay</option>
                                    <option value="multiplechoice">PG</option>
                                </select>
                                {(searchQuery || filterGrade || filterDifficulty || filterType) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterGrade('');
                                            setFilterDifficulty('');
                                            setFilterType('');
                                        }}
                                        className="btn btn-sm btn-ghost text-neutral-500 px-2"
                                        title="Reset Filter"
                                    >
                                        <HiFunnel className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4">
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
                                    {(searchQuery || filterGrade || filterDifficulty || filterType) && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterGrade('');
                                                setFilterDifficulty('');
                                                setFilterType('');
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
                        <div className="grid gap-3 animate-fade-in">
                            {filteredQuestions.map((q, index) => {
                                const difficultyInfo = getDifficultyInfo(q.difficulty);
                                const typeInfo = getTypeInfo(q.type);
                                const TypeIcon = typeInfo.icon;
                                const isExpanded = expandedCards[index];
                                const questionContent = q.content || q.prompt || q.description || '';
                                const isLongContent = questionContent.length > 200;
                                
                                return (
                                    <div key={index} className="card card-hover">
                                        {/* Compact Card Layout */}
                                        <div className="p-4">
                                            {/* Header Row: Title + Badges + Delete */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    {/* Title */}
                                                    <h3 className="text-lg font-bold text-neutral-900 truncate">
                                                        {q.title || 'Soal Tanpa Judul'}
                                                    </h3>
                                                    {/* Badges Row */}
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        {q.grade && (
                                                            <span className="badge badge-primary text-xs">
                                                                {q.grade}
                                                            </span>
                                                        )}
                                                        <span className={`badge text-xs ${difficultyInfo.color}`}>
                                                            {difficultyInfo.label}
                                                        </span>
                                                        <span className="badge badge-neutral text-xs">
                                                            {typeInfo.label}
                                                        </span>
                                                        {q.topic && (
                                                            <span className="badge badge-neutral text-xs max-w-[120px] truncate">
                                                                {q.topic}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Delete Button - Top Right */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs text-neutral-400">
                                                        {new Date(q.savedAt).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short'
                                                        })}
                                                    </span>
                                                    {q.author?.nupkt === user.nuptk && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                                                            title="Hapus Soal"
                                                        >
                                                            <HiTrash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Question Content - Collapsible */}
                                            <div className={`mt-3 bg-neutral-50 rounded-lg p-3 border border-neutral-100 ${!isExpanded && isLongContent ? 'max-h-24 overflow-hidden relative' : ''}`}>
                                                <div className="prose prose-sm max-w-none text-neutral-700">
                                                    <Preview>{questionContent}</Preview>
                                                </div>
                                                
                                                {/* Options for Multiple Choice - Compact */}
                                                {isExpanded && q.options && q.options.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1.5">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                                <span className="font-bold text-brand-600 min-w-[20px]">
                                                                    {opt.label}.
                                                                </span>
                                                                <span className="text-neutral-600">
                                                                    <Preview>{opt.text}</Preview>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Fade overlay for truncated content */}
                                                {!isExpanded && isLongContent && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none"></div>
                                                )}
                                            </div>
                                            
                                            {/* Show More/Less Toggle + Answer */}
                                            <div className="flex items-center justify-between mt-2">
                                                {isLongContent || (q.options && q.options.length > 0) ? (
                                                    <button
                                                        onClick={() => toggleCardExpand(index)}
                                                        className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <HiChevronUp className="w-4 h-4" />
                                                                Tampilkan Lebih Sedikit
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HiChevronDown className="w-4 h-4" />
                                                                Tampilkan Selengkapnya
                                                            </>
                                                        )}
                                                    </button>
                                                ) : <span />}
                                                
                                                {q.answer && (
                                                    <details className="group">
                                                        <summary className="flex items-center gap-1 cursor-pointer text-sm text-success-600 hover:text-success-700 font-medium select-none">
                                                            <span>Pembahasan</span>
                                                            <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </summary>
                                                        <div className="mt-2 p-3 bg-success-50 rounded-lg border border-success-100 text-sm prose prose-sm max-w-none text-neutral-600">
                                                            <Preview>{q.answer}</Preview>
                                                        </div>
                                                    </details>
                                                )}
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
