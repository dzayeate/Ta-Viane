import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Sidebar from '@/components/sidebar';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { HiChartBar, HiTrophy, HiUsers, HiChevronRight, HiXMark } from 'react-icons/hi2';
import users from '@/mock/users/index.json';

export default function ExamResults() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id: examId } = router.query;

  const [user, setUser] = useState(null);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ avg: 0, high: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  // Auth check
  useEffect(() => {
    const nupkt = localStorage.getItem('nupkt');
    const password = localStorage.getItem('password');

    if (!nupkt) {
      router.push('/');
      return;
    }

    const foundUser = users.find(u => u.NUPTK === nupkt && u.Password === password);
    if (foundUser) {
      setUser({ nama: foundUser.Nama, nuptk: foundUser.NUPTK });
    } else {
      router.push('/');
    }
  }, [router]);

  // Fetch data when examId is available
  useEffect(() => {
    if (examId && user) {
      fetchData();
    }
  }, [examId, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch all exams and filter client-side for exam details
      const examsRes = await fetch('/api/exams');
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        const foundExam = examsData.find(e => e.id === examId);
        if (foundExam) {
          setExam(foundExam);
        }
      }

      // 2. Fetch results for this exam
      const resultsRes = await fetch(`/api/exam/results?examId=${examId}`);
      if (resultsRes.ok) {
        const data = await resultsRes.json();
        setResults(data.results || []);
        setStats({
          avg: data.statistics?.averageScore?.toFixed(1) || 0,
          high: data.statistics?.highestScore || 0,
          total: data.statistics?.totalSubmissions || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get student name safely from studentIdentity
  const getStudentName = (result) => {
    if (result.studentIdentity?.name) return result.studentIdentity.name;
    if (result.studentName) return result.studentName;
    return 'Siswa Anonim';
  };

  // Helper: Get student NISN safely from studentIdentity
  const getStudentNISN = (result) => {
    if (result.studentIdentity?.nisn) return result.studentIdentity.nisn;
    if (result.studentNisn) return result.studentNisn;
    return '-';
  };

  // Helper: Get question text by ID
  const getQuestionText = (qId) => {
    const q = exam?.questions?.find(question => question.id === qId);
    return q?.question || 'Soal tidak ditemukan';
  };

  // Helper: Get correct answer by ID
  const getCorrectAnswer = (qId) => {
    const q = exam?.questions?.find(question => question.id === qId);
    return q?.correctAnswer || '-';
  };

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    router.push('/');
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Head>
        <title>Hasil Ujian: {exam?.title || 'Loading'} - TAVIANEU</title>
      </Head>

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
              onClick={() => router.push('/exams')}
              className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 flex items-center gap-1 transition-colors"
            >
              ← Kembali ke Daftar Ujian
            </button>
            <h1 className="text-2xl font-display font-bold text-neutral-900">
              {exam?.title || 'Hasil Ujian'}
            </h1>
            <p className="text-neutral-600">
              Kelas: {exam?.class || '-'} • Dibuat: {formatDate(exam?.createdAt)}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Rata-rata Nilai */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                  <HiChartBar className="text-xl" />
                </div>
                <span className="text-sm font-medium text-neutral-500">Rata-rata Nilai</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{stats.avg}</p>
            </div>

            {/* Nilai Tertinggi */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success-50 rounded-lg text-success-600">
                  <HiTrophy className="text-xl" />
                </div>
                <span className="text-sm font-medium text-neutral-500">Nilai Tertinggi</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{stats.high}</p>
            </div>

            {/* Total Responden */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent-50 rounded-lg text-accent-600">
                  <HiUsers className="text-xl" />
                </div>
                <span className="text-sm font-medium text-neutral-500">Total Responden</span>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{stats.total} <span className="text-base font-normal text-neutral-500">siswa</span></p>
            </div>
          </div>

          {/* Results Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="font-semibold text-neutral-800">Daftar Nilai Siswa</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600 font-medium border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 w-16">No</th>
                    <th className="px-6 py-3">Nama Siswa</th>
                    <th className="px-6 py-3">NISN</th>
                    <th className="px-6 py-3 text-center">Nilai Akhir</th>
                    <th className="px-6 py-3">Waktu Submit</th>
                    <th className="px-6 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <HiUsers className="w-12 h-12 text-neutral-300" />
                          <p className="text-neutral-500 font-medium">Belum ada siswa yang mengumpulkan jawaban.</p>
                          <p className="text-neutral-400 text-sm">Bagikan link ujian kepada siswa untuk memulai.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results.map((result, index) => (
                      <tr
                        key={result.id}
                        className="hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedResult(result)}
                      >
                        <td className="px-6 py-4 font-medium text-neutral-500">{index + 1}</td>
                        <td className="px-6 py-4 font-semibold text-neutral-900">{getStudentName(result)}</td>
                        <td className="px-6 py-4 text-neutral-600 font-mono">{getStudentNISN(result)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge ${
                            result.score >= 80 ? 'badge-success' :
                            result.score >= 60 ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {result.score ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{formatDate(result.submittedAt)}</td>
                        <td className="px-6 py-4 text-neutral-400">
                          <HiChevronRight className="w-5 h-5" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{getStudentName(selectedResult)}</h3>
                <p className="text-sm text-neutral-500">NISN: {getStudentNISN(selectedResult)} • Nilai: <span className="font-bold">{selectedResult.score ?? 0}</span></p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <HiXMark className="text-xl text-neutral-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedResult.answers?.length > 0 ? (
                selectedResult.answers.map((ans, idx) => (
                  <div key={idx} className="border-b border-neutral-100 pb-4 last:border-0">
                    <p className="font-medium text-neutral-800 mb-2">
                      {idx + 1}. {getQuestionText(ans.questionId)}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className={`p-3 rounded-xl border ${ans.isCorrect ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200'}`}>
                        <span className="block text-xs font-semibold text-neutral-500 mb-1">Jawaban Siswa:</span>
                        <p className={ans.isCorrect ? 'text-success-700 font-medium' : 'text-danger-700 font-medium'}>
                          {ans.answer || '(Tidak dijawab)'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                        <span className="block text-xs font-semibold text-neutral-500 mb-1">Kunci Jawaban:</span>
                        <p className="text-neutral-700 font-medium">{getCorrectAnswer(ans.questionId)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-500">Tidak ada data jawaban.</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedResult(null)}
                className="btn btn-secondary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
