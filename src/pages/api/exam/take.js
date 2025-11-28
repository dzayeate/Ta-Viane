import fs from 'fs';
import path from 'path';

// File paths
const examsFilePath = path.join(process.cwd(), 'src', 'mock', 'exams', 'index.json');
const resultsDir = path.join(process.cwd(), 'src', 'mock', 'results');
const resultsFilePath = path.join(resultsDir, 'index.json');

/**
 * Ensure a directory and file exist
 */
function ensureFileExists(dirPath, filePath, defaultContent = '[]') {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf8');
  }
}

/**
 * Sanitize questions to remove answers (prevent cheating)
 */
function sanitizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  
  return questions.map((q, index) => {
    // Create a copy without sensitive fields
    const sanitized = {
      id: q.id || `q-${index}`,
      questionNumber: index + 1,
      type: q.type || 'essay',
      // Use 'question' field if available, otherwise fall back to other content fields
      question: q.question || q.description || q.content || q.prompt || '',
      title: q.title || '',
      topic: q.topic || '',
      difficulty: q.difficulty || '',
    };

    // Include options for multiple choice questions
    if (q.type === 'multiple-choice' || q.type === 'pg' || q.type === 'Pilihan Ganda') {
      sanitized.options = q.options || [];
    }

    // CRITICAL: Do NOT include these fields
    // - correctAnswer
    // - answer
    // - solution
    // - explanation (if it reveals the answer)
    
    return sanitized;
  });
}

/**
 * Calculate score by comparing student answers with correct answers
 */
function calculateScore(studentAnswers, originalQuestions) {
  if (!Array.isArray(studentAnswers) || !Array.isArray(originalQuestions)) {
    return { score: 0, totalPoints: 0, correctCount: 0, totalQuestions: 0 };
  }

  let correctCount = 0;
  const totalQuestions = originalQuestions.length;
  const results = [];

  originalQuestions.forEach((question, index) => {
    const studentAnswer = studentAnswers.find(a => a.questionId === question.id || a.questionIndex === index);
    const studentAnswerText = studentAnswer?.answer || '';
    const correctAnswer = question.correctAnswer || question.answer || '';

    // For multiple choice: exact match (case insensitive)
    // For essay: we can't auto-grade, so mark as "pending review"
    let isCorrect = false;
    let needsReview = false;

    if (question.type === 'multiple-choice' || question.type === 'pg' || question.type === 'Pilihan Ganda') {
      // Case-insensitive comparison for multiple choice
      isCorrect = studentAnswerText.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      if (isCorrect) correctCount++;
    } else {
      // Essay questions need manual review
      needsReview = true;
    }

    results.push({
      questionId: question.id,
      questionNumber: index + 1,
      type: question.type,
      studentAnswer: studentAnswerText,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      needsReview: needsReview,
    });
  });

  // Calculate percentage score (only for auto-gradable questions)
  const autoGradableQuestions = originalQuestions.filter(q => 
    q.type === 'multiple-choice' || q.type === 'pg' || q.type === 'Pilihan Ganda'
  ).length;

  const score = autoGradableQuestions > 0 
    ? Math.round((correctCount / autoGradableQuestions) * 100) 
    : 0;

  return {
    score,
    correctCount,
    totalQuestions,
    autoGradableQuestions,
    needsManualReview: totalQuestions > autoGradableQuestions,
    details: results,
  };
}

export default function handler(req, res) {
  try {
    // Ensure exams file exists
    const examsDir = path.dirname(examsFilePath);
    ensureFileExists(examsDir, examsFilePath, '[]');

    // ============================================
    // GET: Fetch exam data for student (sanitized)
    // ============================================
    if (req.method === 'GET') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Exam ID is required' 
        });
      }

      // Read exams
      const fileData = fs.readFileSync(examsFilePath, 'utf8');
      const exams = JSON.parse(fileData);

      // Find exam by ID
      const exam = exams.find(e => e.id === id);

      if (!exam) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exam not found' 
        });
      }

      // Check if exam is published/active
      if (exam.status !== 'published' && exam.status !== 'active') {
        return res.status(403).json({ 
          success: false, 
          message: 'This exam is not available for taking' 
        });
      }

      // Sanitize questions (remove answers)
      const sanitizedQuestions = sanitizeQuestions(exam.questions);

      // Return sanitized exam data
      return res.status(200).json({
        success: true,
        exam: {
          id: exam.id,
          code: exam.code,
          title: exam.title,
          description: exam.description || '',
          subject: exam.subject || 'Fisika',
          classId: exam.classId || exam.class || '',
          grade: exam.grade || '',
          duration: exam.duration || 60,
          totalQuestions: sanitizedQuestions.length,
          questions: sanitizedQuestions,
        }
      });
    }

    // ============================================
    // POST: Submit exam answers
    // ============================================
    if (req.method === 'POST') {
      const { examId, studentIdentity, answers, timeSpent } = req.body;

      // Validate required fields
      if (!examId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Exam ID is required' 
        });
      }

      if (!studentIdentity || !studentIdentity.name || !studentIdentity.nisn) {
        return res.status(400).json({ 
          success: false, 
          message: 'Student identity (name and NISN) is required' 
        });
      }

      if (!Array.isArray(answers)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Answers must be an array' 
        });
      }

      // Read exams to get correct answers
      const examsData = fs.readFileSync(examsFilePath, 'utf8');
      const exams = JSON.parse(examsData);
      const exam = exams.find(e => e.id === examId);

      if (!exam) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exam not found' 
        });
      }

      // Calculate score
      const scoreResult = calculateScore(answers, exam.questions);

      // Ensure results file exists
      ensureFileExists(resultsDir, resultsFilePath, '[]');

      // Read existing results
      const resultsData = fs.readFileSync(resultsFilePath, 'utf8');
      const results = JSON.parse(resultsData);

      // Check for duplicate submission
      const existingResult = results.find(r => 
        r.examId === examId && 
        r.studentIdentity.nisn === studentIdentity.nisn
      );

      if (existingResult) {
        return res.status(409).json({ 
          success: false, 
          message: 'You have already submitted this exam',
          existingScore: existingResult.score
        });
      }

      // Create new result
      const newResult = {
        id: `result-${Date.now()}`,
        examId: examId,
        examTitle: exam.title,
        studentIdentity: {
          name: studentIdentity.name,
          nisn: studentIdentity.nisn,
          class: studentIdentity.class || '',
        },
        answers: answers,
        score: scoreResult.score,
        correctCount: scoreResult.correctCount,
        totalQuestions: scoreResult.totalQuestions,
        autoGradableQuestions: scoreResult.autoGradableQuestions,
        needsManualReview: scoreResult.needsManualReview,
        details: scoreResult.details,
        timeSpent: timeSpent || 0,
        submittedAt: new Date().toISOString(),
      };

      // Save result
      results.push(newResult);
      fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2), 'utf8');

      // Return success with score
      return res.status(201).json({
        success: true,
        message: 'Exam submitted successfully',
        resultId: newResult.id,
        score: scoreResult.score,
        correctCount: scoreResult.correctCount,
        totalQuestions: scoreResult.totalQuestions,
        needsManualReview: scoreResult.needsManualReview,
      });
    }

    // Method not allowed
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });

  } catch (error) {
    console.error('Exam Take API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
