import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Sidebar from '@/components/sidebar';
import AuthGuard from '@/components/auth-guard';
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
    HiChevronUp,
    HiChevronLeft,
    HiChevronRight,
    HiEye,
    HiListBullet
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
        multiplechoice: { label: 'Pilihan Ganda', icon: HiListBullet },
    };
    return map[type?.toLowerCase()] || { label: type || 'Essay', icon: HiDocumentText };
};

// Items per page for pagination
const ITEMS_PER_PAGE = 9;

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
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    
    // Expanded state for each question card
    const [expandedCards, setExpandedCards] = useState({});
    
    // View state for question detail modal
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    
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
                                  (q.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (q.prompt || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGrade = filterGrade ? q.grade === filterGrade : true;
            const matchesDifficulty = filterDifficulty ? (q.difficulty || '').toLowerCase() === filterDifficulty.toLowerCase() : true;
            const matchesType = filterType ? (q.type || '').toLowerCase() === filterType.toLowerCase() : true;
            
            return matchesSearch && matchesGrade && matchesDifficulty && matchesType;
        });
    }, [questions, searchQuery, filterGrade, filterDifficulty, filterType]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterGrade, filterDifficulty, filterType]);

    // Derived State: Paginated Questions
    const paginatedQuestions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredQuestions, currentPage]);

    // Pagination Info
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredQuestions.length);

    if (!isLoggedIn) return null;

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
                        <>
                        {/* Question Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                            {paginatedQuestions.map((q, index) => {
                                const difficultyInfo = getDifficultyInfo(q.difficulty);
                                const typeInfo = getTypeInfo(q.type);
                                const TypeIcon = typeInfo.icon;
                                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                                const isExpanded = expandedCards[globalIndex];
                                const questionContent = q.content || q.prompt || q.description || '';
                                const isLongContent = questionContent.length > 150;
                                
                                return (
                                    <div key={q.id || index} className="card card-hover flex flex-col h-full">
                                        {/* Card Header */}
                                        <div className="p-4 border-b border-neutral-100">
                                            {/* Title Row */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-base font-bold text-neutral-900 line-clamp-2 flex-1">
                                                    {q.title || 'Soal Tanpa Judul'}
                                                </h3>
                                                {q.author?.nupkt === user.nuptk && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                                                        className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-500 hover:bg-danger-50 transition-colors flex-shrink-0"
                                                        title="Hapus Soal"
                                                    >
                                                        <HiTrash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Badges */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {q.grade && (
                                                    <span className="badge badge-primary text-xs">
                                                        Kelas {q.grade}
                                                    </span>
                                                )}
                                                <span className={`badge text-xs ${difficultyInfo.color}`}>
                                                    {difficultyInfo.label}
                                                </span>
                                                <span className="badge badge-neutral text-xs flex items-center gap-1">
                                                    <TypeIcon className="w-3 h-3" />
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Card Body - Question Content */}
                                        <div className="p-4 flex-1 flex flex-col">
                                            {/* Topic Badge */}
                                            {q.topic && (
                                                <div className="mb-2">
                                                    <span className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-md">
                                                        <HiBookOpen className="w-3 h-3" />
                                                        {q.topic}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Question Preview */}
                                            <div className={`bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600 flex-1 ${!isExpanded && isLongContent ? 'max-h-28 overflow-hidden relative' : ''}`}>
                                                <div className="prose prose-sm max-w-none">
                                                    <Preview>{questionContent}</Preview>
                                                </div>
                                                
                                                {/* Options for MC - Only when expanded */}
                                                {isExpanded && q.options && q.options.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-xs">
                                                                <span className="font-bold text-brand-600 min-w-[16px]">
                                                                    {opt.label}.
                                                                </span>
                                                                <span className="text-neutral-600 line-clamp-2">
                                                                    {typeof opt.text === 'string' ? opt.text : opt.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Fade for truncated */}
                                                {!isExpanded && isLongContent && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-neutral-50 to-transparent"></div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Card Footer */}
                                        <div className="p-4 pt-0 mt-auto">
                                            <div className="flex items-center justify-between">
                                                {/* Expand Toggle */}
                                                {(isLongContent || (q.options && q.options.length > 0)) ? (
                                                    <button
                                                        onClick={() => toggleCardExpand(globalIndex)}
                                                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <HiChevronUp className="w-3 h-3" />
                                                                Sembunyikan
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HiChevronDown className="w-3 h-3" />
                                                                Selengkapnya
                                                            </>
                                                        )}
                                                    </button>
                                                ) : <span />}
                                                
                                                {/* Date */}
                                                <span className="text-xs text-neutral-400">
                                                    {q.savedAt ? new Date(q.savedAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    }) : '-'}
                                                </span>
                                            </div>
                                            
                                            {/* Answer/Solution Toggle */}
                                            {q.answer && (
                                                <details className="mt-3 group">
                                                    <summary className="flex items-center gap-1 cursor-pointer text-xs text-success-600 hover:text-success-700 font-medium select-none">
                                                        <HiEye className="w-3 h-3" />
                                                        <span>Lihat Pembahasan</span>
                                                    </summary>
                                                    <div className="mt-2 p-3 bg-success-50 rounded-lg border border-success-100 text-xs prose prose-sm max-w-none text-neutral-600">
                                                        <Preview>{q.answer}</Preview>
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                                {/* Info */}
                                <p className="text-sm text-neutral-500">
                                    Menampilkan <span className="font-semibold text-neutral-700">{startItem}-{endItem}</span> dari <span className="font-semibold text-neutral-700">{filteredQuestions.length}</span> soal
                                </p>
                                
                                {/* Pagination Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <HiChevronLeft className="w-4 h-4" />
                                        Sebelumnya
                                    </button>
                                    
                                    {/* Page Numbers */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                        currentPage === pageNum
                                                            ? 'bg-brand-600 text-white'
                                                            : 'bg-neutral-100 text-neutral-600 hover:bg-brand-50 hover:text-brand-600'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Mobile Page Indicator */}
                                    <span className="sm:hidden text-sm font-medium text-neutral-600">
                                        {currentPage} / {totalPages}
                                    </span>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Selanjutnya
                                        <HiChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                        </>
                    )}
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
