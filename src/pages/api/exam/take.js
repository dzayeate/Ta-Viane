import fs from 'fs';
import path from 'path';
import { normalizeQuestion } from '@/utils/questionAdapter';
import { extractAnswerKey, isAutoGradable } from '@/utils/gradingHelper';

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
 * Also normalizes legacy MC questions to include structured options array
 * 
 * SECURITY: Strips ALL answer-related fields to prevent students from
 * seeing them via browser DevTools/Network tab
 */
function sanitizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  
  return questions.map((q, index) => {
    // Step 1: Normalize the question to extract options from description if needed
    const normalized = normalizeQuestion(q) || q;
    
    // Step 2: Determine the question type (handle various formats)
    const rawType = (normalized.type || q.type || 'essay').toLowerCase();
    const isMultipleChoice = rawType === 'multiplechoice' || 
                             rawType === 'multiple-choice' || 
                             rawType === 'pg' || 
                             rawType === 'pilihan ganda' ||
                             (normalized.options && normalized.options.length > 0);
    
    // Step 3: Create sanitized question object
    const sanitized = {
      id: q.id || `q-${index}`,
      questionNumber: index + 1,
      type: isMultipleChoice ? 'multipleChoice' : 'essay',
      // Prefer 'content' from normalization, fallback to other fields
      question: normalized.content || normalized.question || q.question || q.description || q.prompt || '',
      title: q.title || '',
      topic: q.topic || '',
      difficulty: q.difficulty || '',
    };

    // Step 4: Include options for multiple choice questions
    if (isMultipleChoice) {
      // Use normalized options (structured array) or fallback to original
      sanitized.options = normalized.options || q.options || [];
    }

    // =========================================================
    // CRITICAL SECURITY: Do NOT include any of these fields!
    // =========================================================
    // - correctAnswer (the clean answer key, e.g., "B")
    // - answer (legacy field, may contain explanation + key)
    // - explanation (step-by-step solution)
    // - solution (alternative name for explanation)
    // - finalAnswer (alternative name for correctAnswer)
    // 
    // Students could see these in Network tab if included!
    // =========================================================
    
    return sanitized;
  });
}

/**
 * Calculate score by comparing student answers with correct answers
 * 
 * Grading Priority:
 * 1. Use `question.correctAnswer` if available (new clean format)
 * 2. Fall back to `extractAnswerKey(question.answer)` (legacy format)
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

    // For multiple choice: extract answer key and compare
    // For essay: we can't auto-grade, so mark as "pending review"
    let isCorrect = false;
    let needsReview = false;
    let correctKey = null;

    if (isAutoGradable(question.type)) {
      // ==============================================
      // GRADING PRIORITY for answer key extraction
      // ==============================================
      // Priority 1: Use `correctAnswer` field (new clean format)
      //             This is a simple key like "B" or "C"
      // Priority 2: Extract from `answer` field (legacy format)
      //             May contain verbose text like "Jawaban benar: C"
      // ==============================================
      
      if (question.correctAnswer && question.correctAnswer.trim()) {
        // New format: correctAnswer is clean (e.g., "B", "C", "10 m/s")
        correctKey = question.correctAnswer.trim().toUpperCase();
        
        // If it's a single letter, use as-is
        // If it's longer (e.g., numeric answer), keep for comparison
        if (correctKey.length === 1 && /[A-E]/.test(correctKey)) {
          // It's a letter answer - ready for comparison
        } else {
          // It might be a numeric or text answer, normalize it
          correctKey = question.correctAnswer.trim();
        }
      } else if (question.answer) {
        // Legacy format: extract key from verbose answer
        correctKey = extractAnswerKey(question.answer);
      }

      // Normalize student answer for comparison
      const studentKey = extractAnswerKey(studentAnswerText) || studentAnswerText.trim().toUpperCase();
      
      if (correctKey) {
        // Compare normalized keys (case-insensitive for letters)
        const normalizedCorrect = correctKey.toUpperCase();
        const normalizedStudent = studentKey.toUpperCase();
        isCorrect = normalizedStudent === normalizedCorrect;
      } else {
        // No key found - do direct comparison as fallback
        const legacyAnswer = question.answer || '';
        isCorrect = studentAnswerText.toLowerCase().trim() === legacyAnswer.toLowerCase().trim();
      }
      
      if (isCorrect) correctCount++;
    } else {
      // Essay questions need manual review
      needsReview = true;
    }

    // Store the correct answer for results (prefer clean format)
    const correctAnswerForResults = question.correctAnswer || question.answer || '';

    results.push({
      questionId: question.id,
      questionNumber: index + 1,
      type: question.type,
      studentAnswer: studentAnswerText,
      correctAnswer: correctAnswerForResults,
      correctKey: correctKey, // The extracted/normalized key used for grading
      isCorrect: isCorrect,
      needsReview: needsReview,
    });
  });

  // Calculate percentage score (only for auto-gradable questions)
  const autoGradableQuestions = originalQuestions.filter(q => 
    isAutoGradable(q.type)
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
