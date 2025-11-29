import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Sidebar from '@/components/sidebar';
import AuthGuard from '@/components/auth-guard';
import { useTranslation } from 'next-i18next';
import { HiChartBar, HiTrophy, HiUsers, HiXMark, HiCheck, HiXCircle, HiPencilSquare } from 'react-icons/hi2';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';

export default function ExamResults() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id: examId } = router.query;

  const [user, setUser] = useState({ nama: '', nuptk: '' });
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ avg: 0, high: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  
  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradedScores, setGradedScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Get user from localStorage (auth already handled by AuthGuard)
  useEffect(() => {
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

  // Fetch data when examId is available
  useEffect(() => {
    if (examId) {
      fetchData();
    }
  }, [examId]);

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

  // Helper: Get question type by ID
  const getQuestionType = (qId) => {
    const q = exam?.questions?.find(question => question.id === qId);
    return q?.type || 'Essay';
  };

  // Helper: Check if question is essay type
  const isEssayQuestion = (qId) => {
    const type = getQuestionType(qId);
    return type?.toLowerCase() === 'essay' || type?.toLowerCase() === 'uraian';
  };

  // Open grading modal with selected submission
  const handleOpenGrading = async (result) => {
    // Ensure exam data is loaded before opening modal
    if (!exam || !exam.questions || exam.questions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Siap',
        text: 'Data ujian masih dimuat. Silakan coba lagi.',
        customClass: { popup: 'rounded-xl' }
      });
      return;
    }

    try {
      // Fetch full submission details including answers
      const res = await fetch('/api/exam/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getDetail', resultId: result.id })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedSubmission(data.result);
        
        // Initialize graded scores - ONLY for Essay questions
        // MCQ scores are auto-graded and should not be modified
        const initialScores = {};
        (data.result.details || data.result.answers || []).forEach((item, idx) => {
          const questionType = item.type || 'Essay';
          const isEssay = questionType.toLowerCase() === 'essay' || questionType.toLowerCase() === 'uraian';
          
          // Only include Essay questions in gradedScores
          if (isEssay) {
            initialScores[idx] = item.points || 0;
          }
        });
        setGradedScores(initialScores);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal memuat data jawaban siswa.',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  // Handle score change for a question
  const handleScoreChange = (index, value) => {
    const score = Math.max(0, Math.min(100, parseInt(value) || 0));
    setGradedScores(prev => ({ ...prev, [index]: score }));
  };

  // Save graded scores
  const handleSaveGrades = async () => {
    if (!selectedSubmission) return;

    setIsSaving(true);
    try {
      const nisn = selectedSubmission.studentIdentity?.nisn;
      
      const res = await fetch('/api/exam/grade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          nisn,
          gradedAnswers: gradedScores
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Nilai berhasil diperbarui. Skor baru: ${data.newScore}`,
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-xl' }
        });

        // Close modal and refresh data
        setIsModalOpen(false);
        setSelectedSubmission(null);
        fetchData();
      } else {
        throw new Error(data.message || 'Gagal menyimpan nilai');
      }
    } catch (error) {
      console.error('Error saving grades:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.message || 'Gagal menyimpan nilai.',
        customClass: { popup: 'rounded-xl' }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setGradedScores({});
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

  return (
    <AuthGuard>
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

            {/* Loading State - inside layout */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
              </div>
            ) : (
              <>
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
                              onClick={() => handleOpenGrading(result)}
                            >
                              <td className="px-6 py-4 font-medium text-neutral-500">{index + 1}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-neutral-900">{getStudentName(result)}</span>
                                  {result.needsManualReview && (
                                    <span className="badge badge-warning text-xs">Perlu Dinilai</span>
                                  )}
                                </div>
                              </td>
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
                                <HiPencilSquare className="w-5 h-5" />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Grading Modal */}
        {isModalOpen && selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {selectedSubmission.studentIdentity?.name || 'Siswa'}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    NISN: {selectedSubmission.studentIdentity?.nisn || '-'} • 
                    Kelas: {selectedSubmission.studentIdentity?.class || '-'} • 
                    Skor Saat Ini: <span className="font-bold text-brand-600">{selectedSubmission.score ?? 0}</span>
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <HiXMark className="text-xl text-neutral-500" />
                </button>
              </div>

              {/* Modal Body - Questions List */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {(selectedSubmission.details || selectedSubmission.answers || []).map((item, idx) => {
                  // Get question info - prefer data from details, fallback to exam lookup
                  const questionId = item.questionId;
                  const questionType = item.type || getQuestionType(questionId);
                  const isEssay = questionType?.toLowerCase() === 'essay' || questionType?.toLowerCase() === 'uraian';
                  
                  // Student answer - prioritize from details
                  const studentAnswer = item.studentAnswer || item.answer || '(Tidak dijawab)';
                  
                  // Correct answer - prioritize from details (already stored during submission)
                  const correctAnswer = item.correctAnswer || getCorrectAnswer(questionId);
                  
                  // Question text - try to find from exam, fallback to placeholder
                  const examQuestion = exam?.questions?.find(q => q.id === questionId);
                  const questionText = examQuestion?.question || 
                                       examQuestion?.content || 
                                       examQuestion?.description || 
                                       `Soal #${item.questionNumber || idx + 1}`;

                  // Safety check - if question not found, show warning
                  if (!examQuestion) {
                    return (
                      <div key={idx} className="card p-4 border-l-4 border-l-warning-400">
                        <div className="flex items-start gap-3">
                          <span className="badge badge-warning">Soal {item.questionNumber || idx + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm text-warning-700 mb-2">
                              ⚠️ Data soal tidak ditemukan dalam ujian.
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="p-2 bg-neutral-50 rounded-lg">
                                <span className="font-semibold text-neutral-500">Jawaban Siswa:</span>
                                <p className="text-neutral-700 mt-1">{studentAnswer}</p>
                              </div>
                              <div className="p-2 bg-brand-50 rounded-lg">
                                <span className="font-semibold text-neutral-500">Kunci:</span>
                                <p className="text-brand-700 mt-1">{correctAnswer}</p>
                              </div>
                            </div>
                            {isEssay && (
                              <div className="mt-3 flex items-center gap-2">
                                <label className="text-sm font-medium text-neutral-600">Nilai:</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={gradedScores[idx] || 0}
                                  onChange={(e) => handleScoreChange(idx, e.target.value)}
                                  className="input w-20 text-center font-bold"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className="card p-4">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="badge badge-neutral text-xs">Soal {item.questionNumber || idx + 1}</span>
                            <span className={`badge text-xs ${isEssay ? 'badge-primary' : 'badge-neutral'}`}>
                              {questionType}
                            </span>
                            {!isEssay && (
                              <span className={`badge text-xs ${item.isCorrect ? 'badge-success' : 'badge-danger'}`}>
                                {item.isCorrect ? 'Benar' : 'Salah'}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-neutral-800 text-sm leading-relaxed">
                            {questionText}
                          </p>
                        </div>
                      </div>

                      {/* Answers Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        {/* Student Answer */}
                        <div className={`p-3 rounded-xl border ${
                          isEssay 
                            ? 'bg-neutral-50 border-neutral-200' 
                            : item.isCorrect 
                              ? 'bg-success-50 border-success-200' 
                              : 'bg-danger-50 border-danger-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {!isEssay && (
                              item.isCorrect 
                                ? <HiCheck className="w-4 h-4 text-success-600" />
                                : <HiXCircle className="w-4 h-4 text-danger-600" />
                            )}
                            <span className="text-xs font-semibold text-neutral-500">Jawaban Siswa:</span>
                          </div>
                          <p className={`text-sm font-medium whitespace-pre-wrap ${
                            isEssay 
                              ? 'text-neutral-700' 
                              : item.isCorrect 
                                ? 'text-success-700' 
                                : 'text-danger-700'
                          }`}>
                            {studentAnswer}
                          </p>
                        </div>

                        {/* Reference Answer */}
                        <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
                          <span className="block text-xs font-semibold text-neutral-500 mb-1">Kunci Jawaban:</span>
                          <p className="text-sm text-brand-700 font-medium whitespace-pre-wrap line-clamp-6">
                            {correctAnswer.length > 300 ? correctAnswer.substring(0, 300) + '...' : correctAnswer}
                          </p>
                        </div>
                      </div>

                      {/* Score Input Section */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        {isEssay ? (
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-neutral-600">Nilai:</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradedScores[idx] || 0}
                              onChange={(e) => handleScoreChange(idx, e.target.value)}
                              className="input w-24 text-center font-bold"
                              placeholder="0"
                            />
                            <span className="text-sm text-neutral-400">/ 100</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-600">Nilai:</span>
                            <span className={`font-bold ${item.isCorrect ? 'text-success-600' : 'text-danger-600'}`}>
                              {item.points ?? (item.isCorrect ? 100 : 0)}
                            </span>
                            <span className="text-sm text-neutral-400">(Otomatis)</span>
                          </div>
                        )}
                        
                        {item.isGraded && (
                          <span className="badge badge-success text-xs">Sudah Dinilai</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(!selectedSubmission.details?.length && !selectedSubmission.answers?.length) && (
                  <p className="text-center text-neutral-500 py-8">Tidak ada data jawaban.</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl flex items-center justify-between">
                <div className="text-sm text-neutral-500">
                  Total Nilai Baru: <span className="font-bold text-lg text-brand-600">
                    {(() => {
                      // Calculate total: MCQ points (from existing data) + Essay points (from gradedScores)
                      let total = 0;
                      (selectedSubmission?.details || selectedSubmission?.answers || []).forEach((item, idx) => {
                        const questionType = item.type || 'Essay';
                        const isEssay = questionType.toLowerCase() === 'essay' || questionType.toLowerCase() === 'uraian';
                        
                        if (isEssay) {
                          // Use graded score for Essay
                          total += gradedScores[idx] || 0;
                        } else {
                          // Use existing points for MCQ (auto-graded)
                          total += item.points ?? (item.isCorrect ? 100 : 0);
                        }
                      });
                      return total;
                    })()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="btn btn-secondary"
                    disabled={isSaving}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveGrades}
                    className="btn btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan & Update Nilai'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
