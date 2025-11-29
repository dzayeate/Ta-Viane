import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  HiClock, 
  HiUser, 
  HiAcademicCap, 
  HiCheckCircle, 
  HiExclamationTriangle,
  HiChevronLeft,
  HiChevronRight,
  HiFlag,
  HiPaperAirplane,
  HiIdentification,
  HiUserGroup
} from 'react-icons/hi2';
import Swal from 'sweetalert2';
import Preview from '@/components/preview';

/**
 * Student Exam Page
 * Steps: 'login' -> 'exam' -> 'result'
 */
export default function StartExam() {
  const router = useRouter();
  const { id } = router.query;

  // Step management
  const [step, setStep] = useState('login'); // 'login' | 'exam' | 'result'

  // Student data (persisted in sessionStorage)
  const [studentData, setStudentData] = useState({ name: '', nisn: '', class: '' });
  
  // NISN input for validation
  const [nisnInput, setNisnInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Class roster data (fetched based on exam.classId)
  const [classRoster, setClassRoster] = useState(null);

  // Exam data from API
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answers: { questionId: answer }
  const [answers, setAnswers] = useState({});
  
  // Flagged questions for review
  const [flagged, setFlagged] = useState({});

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Current question index for navigation
  const [currentIndex, setCurrentIndex] = useState(0);

  // ============================================
  // Initialize student data from sessionStorage
  // ============================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('exam_student');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setStudentData(parsed);
          setNisnInput(parsed.nisn || '');
        } catch (e) {
          console.error('Failed to parse stored student data');
        }
      }
    }
  }, []);

  // ============================================
  // Fetch exam data when ID is ready
  // ============================================
  useEffect(() => {
    if (id) {
      fetchExamData();
    }
  }, [id]);

  const fetchExamData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/exam/take?id=${id}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load exam');
      }

      setExamData(data.exam);
      setTimeLeft(data.exam.duration * 60); // Convert minutes to seconds
      
      // Fetch class roster for NISN validation
      if (data.exam.classId) {
        fetchClassRoster(data.exam.classId);
      }
    } catch (err) {
      console.error('Fetch exam error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Fetch class roster for NISN validation
  // ============================================
  const fetchClassRoster = async (classId) => {
    try {
      const res = await fetch(`/api/classes?id=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassRoster(data);
      }
    } catch (err) {
      console.error('Failed to fetch class roster:', err);
    }
  };

  // ============================================
  // Timer countdown (only when in exam step)
  // ============================================
  useEffect(() => {
    if (step === 'exam' && timeLeft > 0 && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [step, timeLeft, submitting]);

  // ============================================
  // Prevent accidental navigation (back button)
  // ============================================
  useEffect(() => {
    if (step === 'exam') {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Ujian sedang berlangsung. Yakin ingin keluar?';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [step]);

  // ============================================
  // Handlers
  // ============================================
  const handleStudentLogin = async (e) => {
    e.preventDefault();

    if (!nisnInput.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'NISN Diperlukan',
        text: 'Mohon masukkan NISN Anda.',
        customClass: { popup: 'rounded-xl' }
      });
      return;
    }

    setIsValidating(true);

    // Validate NISN against class roster
    if (classRoster && classRoster.students) {
      const foundStudent = classRoster.students.find(
        s => s.nisn === nisnInput.trim()
      );

      if (!foundStudent) {
        setIsValidating(false);
        Swal.fire({
          icon: 'error',
          title: 'NISN Tidak Terdaftar',
          html: `NISN <b>${nisnInput}</b> tidak terdaftar di kelas <b>${classRoster.name || 'ini'}</b>.<br/><br/>Hubungi guru Anda jika Anda yakin ini adalah kesalahan.`,
          customClass: { popup: 'rounded-xl' }
        });
        return;
      }

      // Found! Auto-fill student data
      const validatedData = {
        name: foundStudent.name,
        nisn: foundStudent.nisn,
        class: classRoster.name || ''
      };

      setStudentData(validatedData);
      sessionStorage.setItem('exam_student', JSON.stringify(validatedData));

      // Show welcome message
      await Swal.fire({
        icon: 'success',
        title: 'Selamat Datang!',
        html: `Halo, <b>${foundStudent.name}</b>!<br/>Anda akan memulai ujian.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl' }
      });

      setIsValidating(false);
      setStep('exam');
    } else {
      // No class roster available - fallback to manual entry (shouldn't happen normally)
      setIsValidating(false);
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Gagal',
        text: 'Tidak dapat memvalidasi NISN. Hubungi guru Anda.',
        customClass: { popup: 'rounded-xl' }
      });
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleToggleFlag = (questionId) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleAutoSubmit = useCallback(() => {
    Swal.fire({
      icon: 'warning',
      title: 'Waktu Habis!',
      text: 'Ujian akan dikumpulkan secara otomatis.',
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: 'rounded-xl' }
    }).then(() => {
      submitExam();
    });
  }, []);

  const handleManualSubmit = async () => {
    const result = await Swal.fire({
      title: 'Kumpulkan Ujian?',
      text: 'Pastikan semua jawaban sudah terisi dengan benar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Kumpulkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0ea5e9',
      customClass: { popup: 'rounded-xl' }
    });

    if (result.isConfirmed) {
      submitExam();
    }
  };

  const submitExam = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const payload = {
        examId: examData.id,
        studentIdentity: {
          name: studentData.name,
          nisn: studentData.nisn,
          class: studentData.class || ''
        },
        answers: formattedAnswers,
        timeSpent: (examData.duration * 60) - timeLeft
      };

      const res = await fetch('/api/exam/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit exam');
      }

      setResult(data);
      setStep('result');

      // Clear session storage after successful submission
      sessionStorage.removeItem('exam_student');

    } catch (err) {
      console.error('Submit error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim',
        text: err.message || 'Terjadi kesalahan saat mengirim jawaban.',
        customClass: { popup: 'rounded-xl' }
      });
      setSubmitting(false);
    }
  };

  // ============================================
  // Utility functions
  // ============================================
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter((k) => answers[k] && answers[k].trim()).length;
  };

  const getFlaggedCount = () => {
    return Object.keys(flagged).filter((k) => flagged[k]).length;
  };

  const isMultipleChoice = (question) => {
    const type = (question?.type || '').toLowerCase();
    return type === 'multiplechoice' || 
           type === 'multiple-choice' || 
           type === 'pg' || 
           type === 'pilihan ganda' ||
           (question?.options && question.options.length > 0);
  };

  // ============================================
  // Loading State
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg">Memuat ujian...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Error State
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Ujian Tidak Ditemukan</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // Step 1: Login View - NISN Only Validation
  // ============================================
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center p-4">
        <Head>
          <title>{examData?.title || 'Ujian'} - Masuk</title>
        </Head>

        <div className="card max-w-md w-full p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiAcademicCap className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
              {examData?.title}
            </h1>
            <p className="text-neutral-500">
              {examData?.totalQuestions} Soal • {examData?.duration} Menit
            </p>
            
            {/* Class Info Badge */}
            {classRoster && (
              <div className="mt-4 inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-xl">
                <HiUserGroup className="w-5 h-5" />
                <span className="font-medium">{classRoster.name}</span>
                <span className="text-brand-500">•</span>
                <span className="text-sm">{classRoster.students?.length || 0} siswa</span>
              </div>
            )}
          </div>

          {/* Form - NISN Only */}
          <form onSubmit={handleStudentLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                <HiIdentification className="w-4 h-4 inline mr-1" />
                Masukkan NISN Anda
              </label>
              <input
                type="text"
                className="input text-center text-lg font-mono tracking-wider"
                placeholder="Contoh: 0012345678"
                value={nisnInput}
                onChange={(e) => setNisnInput(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-2 text-center">
                NISN akan divalidasi dengan daftar siswa di kelas ini
              </p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full btn-lg gap-2"
              disabled={isValidating || !nisnInput.trim()}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Memvalidasi...
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-5 h-5" />
                  Validasi & Mulai Ujian
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Perhatian:</strong> Pastikan NISN Anda sudah terdaftar di kelas. 
              Hubungi guru jika mengalami kendala.
            </p>
          </div>

          {/* Teacher Info (if available) */}
          {examData?.teacher_name && (
            <div className="mt-4 text-center text-sm text-neutral-500">
              <span>Dibuat oleh: </span>
              <span className="font-medium text-neutral-700">{examData.teacher_name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // Step 3: Result View
  // ============================================
  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gradient-brand flex items-center justify-center p-4">
        <Head>
          <title>Ujian Selesai</title>
        </Head>

        <div className="card max-w-md w-full p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-10 h-10 text-success-600" />
          </div>

          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
            Ujian Selesai!
          </h1>
          <p className="text-neutral-600 mb-6">
            Terima kasih, {studentData.name}. Jawaban Anda telah tersimpan.
          </p>

          {result && (
            <div className="bg-neutral-50 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-brand-600 mb-2">
                {result.score}%
              </div>
              <p className="text-sm text-neutral-500">
                {result.correctCount} dari {result.totalQuestions} soal terjawab benar
                {result.needsManualReview && ' (soal essay memerlukan penilaian manual)'}
              </p>
            </div>
          )}

          <button
            onClick={() => window.close()}
            className="btn btn-secondary w-full"
          >
            Tutup Halaman
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // Step 2: Exam View
  // ============================================
  const questions = examData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const isTimeWarning = timeLeft < 300; // Less than 5 minutes
  const isTimeCritical = timeLeft < 60; // Less than 1 minute

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Head>
        <title>{examData?.title} - Ujian</title>
      </Head>

      {/* Sticky Header with Timer */}
      <header className="bg-white shadow-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Top Row: Title and Timer */}
          <div className="flex items-center justify-between mb-4">
            {/* Left: Exam Title */}
            <div>
              <h1 className="font-bold text-lg text-neutral-900 line-clamp-1">
                {examData?.title}
              </h1>
              <p className="text-sm text-neutral-500">
                <HiUser className="w-4 h-4 inline mr-1" />
                {studentData.name}
              </p>
            </div>

            {/* Right: Large Timer */}
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-mono transition-all ${
                isTimeCritical
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                  : isTimeWarning
                  ? 'bg-warning-100 text-warning-700 border-2 border-warning-300'
                  : 'bg-brand-50 text-brand-700 border-2 border-brand-200'
              }`}
            >
              <HiClock className={`w-6 h-6 ${isTimeCritical ? 'animate-bounce' : ''}`} />
              <span className="text-2xl font-bold tracking-wide">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">
                Soal <span className="font-bold text-brand-600">{currentIndex + 1}</span> dari {questions.length}
              </span>
              <span className="text-neutral-600">
                <span className="font-bold text-success-600">{getAnsweredCount()}</span> terjawab
                {getFlaggedCount() > 0 && (
                  <span className="ml-2 text-warning-600">
                    • <HiFlag className="w-4 h-4 inline" /> {getFlaggedCount()} ditandai
                  </span>
                )}
              </span>
            </div>
            <div className="relative bg-neutral-200 rounded-full h-3 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
              />
              {/* Current position indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-600 rounded-full shadow-md transition-all duration-300"
                style={{ left: `calc(${((currentIndex) / questions.length) * 100}% - 8px)` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Question Navigation Pills */}
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-neutral-200">
            <p className="text-sm font-medium text-neutral-500 mb-3">Navigasi Soal:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] && answers[q.id].trim();
                const isFlagged = flagged[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-11 h-11 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isCurrent
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-110'
                        : isAnswered
                        ? 'bg-success-100 text-success-700 border-2 border-success-300 hover:bg-success-200'
                        : 'bg-white text-neutral-600 border-2 border-neutral-200 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-warning-400 rounded-full flex items-center justify-center">
                        <HiFlag className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="card shadow-lg animate-fade-in">
              {/* Card Header */}
              <div className="px-6 py-4 md:px-8 md:py-5 border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 bg-brand-100 text-brand-700 font-bold rounded-xl">
                      {currentIndex + 1}
                    </span>
                    <div>
                      <span className="badge badge-primary">
                        {isMultipleChoice(currentQuestion) ? 'Pilihan Ganda' : 'Essay'}
                      </span>
                      {currentQuestion.topic && (
                        <span className="badge badge-neutral ml-2">{currentQuestion.topic}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Flag Button */}
                  <button
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    className={`btn btn-sm transition-all ${
                      flagged[currentQuestion.id]
                        ? 'bg-warning-100 text-warning-700 border-warning-300 hover:bg-warning-200'
                        : 'btn-ghost'
                    }`}
                    title={flagged[currentQuestion.id] ? 'Hapus tanda' : 'Tandai untuk review'}
                  >
                    <HiFlag className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {flagged[currentQuestion.id] ? 'Ditandai' : 'Ragu-ragu'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Card Body - Question Content */}
              <div className="px-6 py-6 md:px-8 md:py-8">
                {/* Question Title */}
                {currentQuestion.title && (
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    {currentQuestion.title}
                  </h2>
                )}

                {/* Question Text - Using Preview for LaTeX/Markdown */}
                <div className="prose prose-lg max-w-none text-neutral-800 mb-8">
                  <Preview className="min-h-[60px]">
                    {currentQuestion.question || currentQuestion.description || 'Tidak ada pertanyaan.'}
                  </Preview>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {isMultipleChoice(currentQuestion) ? (
                    // Multiple Choice - Card Style Options
                    (currentQuestion.options || []).map((option, idx) => {
                      const optionLabel = typeof option === 'object' ? option.label : String.fromCharCode(65 + idx);
                      const optionText = typeof option === 'object' ? option.text : option;
                      const optionValue = optionLabel;
                      const isSelected = answers[currentQuestion.id] === optionValue;

                      return (
                        <label
                          key={idx}
                          className={`group flex items-start p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                              : 'border-neutral-200 hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-sm'
                          }`}
                        >
                          {/* Custom Radio */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-500'
                              : 'border-neutral-300 group-hover:border-brand-400'
                          }`}>
                            {isSelected ? (
                              <HiCheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-sm font-bold text-neutral-400 group-hover:text-brand-500">
                                {optionLabel}
                              </span>
                            )}
                          </div>
                          <input
                            type="radio"
                            name={`q-${currentQuestion.id}`}
                            value={optionValue}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(currentQuestion.id, optionValue)}
                            className="sr-only"
                          />
                          <span className={`flex-1 text-base md:text-lg transition-colors ${
                            isSelected ? 'text-brand-800 font-medium' : 'text-neutral-700'
                          }`}>
                            <Preview className="inline">{optionText}</Preview>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    // Essay - Text Area
                    <div>
                      <label className="block text-sm font-semibold text-neutral-600 mb-2">
                        Jawaban Anda:
                      </label>
                      <textarea
                        rows={10}
                        className="input resize-none text-base"
                        placeholder="Tulis jawaban Anda di sini dengan lengkap..."
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                      <p className="text-sm text-neutral-400 mt-2">
                        {(answers[currentQuestion.id] || '').length} karakter
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer - Navigation */}
              <div className="px-6 py-5 md:px-8 md:py-6 border-t border-neutral-200 bg-neutral-50/50">
                <div className="flex items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="btn btn-secondary btn-lg gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {/* Question Counter (Mobile) */}
                  <div className="sm:hidden text-sm font-medium text-neutral-500">
                    {currentIndex + 1} / {questions.length}
                  </div>

                  {/* Next / Submit Button */}
                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="btn btn-primary btn-lg gap-2"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleManualSubmit}
                      disabled={submitting}
                      className="btn btn-lg gap-2 bg-success-600 hover:bg-success-700 text-white shadow-lg shadow-success-200"
                    >
                      <HiPaperAirplane className="w-5 h-5" />
                      <span>{submitting ? 'Mengirim...' : 'Kumpulkan'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Summary Card */}
          <div className="mt-6 card p-5 bg-neutral-50 border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-700">
                  Siap mengumpulkan?
                </p>
                <p className="text-sm text-neutral-500">
                  {getAnsweredCount()} dari {questions.length} soal terjawab
                  {getFlaggedCount() > 0 && ` • ${getFlaggedCount()} ditandai ragu-ragu`}
                </p>
              </div>
              <button
                onClick={handleManualSubmit}
                disabled={submitting}
                className="btn btn-primary gap-2"
              >
                <HiPaperAirplane className="w-4 h-4" />
                Kumpulkan
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Bar (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn btn-secondary flex-1 disabled:opacity-40"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleManualSubmit}
            disabled={submitting}
            className="btn btn-primary flex-[2] gap-2"
          >
            <HiPaperAirplane className="w-4 h-4" />
            {submitting ? 'Mengirim...' : `Kumpulkan (${getAnsweredCount()}/${questions.length})`}
          </button>
          
          {currentIndex < questions.length - 1 && (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="btn btn-secondary flex-1"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Bottom padding for mobile fixed bar */}
      <div className="md:hidden h-20"></div>
    </div>
  );
}
