import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HiClock, HiUser, HiAcademicCap, HiCheckCircle, HiExclamationTriangle } from 'react-icons/hi2';
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

  // Exam data from API
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answers: { questionId: answer }
  const [answers, setAnswers] = useState({});

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
    } catch (err) {
      console.error('Fetch exam error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
  const handleStudentLogin = (e) => {
    e.preventDefault();

    if (!studentData.name.trim() || !studentData.nisn.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Mohon isi Nama dan NISN Anda.',
        customClass: { popup: 'rounded-xl' }
      });
      return;
    }

    // Save to sessionStorage
    sessionStorage.setItem('exam_student', JSON.stringify(studentData));

    // Move to exam step
    setStep('exam');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
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
  // Step 1: Login View
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
              {examData?.subject} • {examData?.totalQuestions} Soal • {examData?.duration} Menit
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Masukkan nama lengkap"
                value={studentData.name}
                onChange={(e) => setStudentData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Masukkan NISN"
                value={studentData.nisn}
                onChange={(e) => setStudentData((prev) => ({ ...prev, nisn: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Kelas (Opsional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Contoh: XII IPA 1"
                value={studentData.class}
                onChange={(e) => setStudentData((prev) => ({ ...prev, class: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6">
              Mulai Ujian
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Perhatian:</strong> Setelah memulai, waktu akan berjalan dan tidak dapat dihentikan.
            </p>
          </div>
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

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Head>
        <title>{examData?.title} - Ujian</title>
      </Head>

      {/* Fixed Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Exam Info */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-neutral-600">
                <HiUser className="w-5 h-5" />
                <span className="font-medium">{studentData.name}</span>
              </div>
              <div className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-900">{examData?.title}</span>
              </div>
            </div>

            {/* Right: Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                isTimeWarning
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-brand-50 text-brand-600'
              }`}
            >
              <HiClock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 bg-neutral-200 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-neutral-600 whitespace-nowrap">
              {getAnsweredCount()}/{questions.length} terjawab
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Question Navigation Pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  idx === currentIndex
                    ? 'bg-brand-600 text-white shadow-md'
                    : answers[q.id]
                    ? 'bg-success-100 text-success-700 border border-success-300'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-brand-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="card p-6 md:p-8 animate-fade-in">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge badge-primary mb-2">
                    Soal {currentIndex + 1}
                  </span>
                  <span className="badge badge-neutral ml-2">
                    {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'pg' || currentQuestion.type === 'Pilihan Ganda'
                      ? 'Pilihan Ganda'
                      : 'Essay'}
                  </span>
                </div>
              </div>

              {/* Question Content */}
              <div className="prose prose-neutral max-w-none mb-6">
                {currentQuestion.title && (
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {currentQuestion.title}
                  </h3>
                )}
                <div className="text-neutral-700">
                  <Preview>{currentQuestion.question}</Preview>
                </div>
              </div>

              {/* Answer Input */}
              <div className="mt-6">
                {currentQuestion.type === 'multiple-choice' ||
                currentQuestion.type === 'pg' ||
                currentQuestion.type === 'Pilihan Ganda' ? (
                  <div className="space-y-3">
                    {(currentQuestion.options || []).map((option, idx) => {
                      const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D...
                      const isSelected = answers[currentQuestion.id] === option;

                      return (
                        <label
                          key={idx}
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-neutral-200 hover:border-brand-200 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${currentQuestion.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(currentQuestion.id, option)}
                            className="w-5 h-5 text-brand-600 border-neutral-300 focus:ring-brand-500"
                          />
                          <span className="ml-3 font-medium text-neutral-700">
                            {optionLabel}. {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    className="input resize-none"
                    placeholder="Tulis jawaban Anda di sini..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="btn btn-ghost disabled:opacity-50"
                >
                  ← Sebelumnya
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="btn btn-primary"
                  >
                    Selanjutnya →
                  </button>
                ) : (
                  <button
                    onClick={handleManualSubmit}
                    disabled={submitting}
                    className="btn btn-primary bg-success-600 hover:bg-success-700"
                  >
                    {submitting ? 'Mengirim...' : 'Kumpulkan Ujian'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Bar (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-40">
        <button
          onClick={handleManualSubmit}
          disabled={submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Mengirim...' : `Kumpulkan (${getAnsweredCount()}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}
