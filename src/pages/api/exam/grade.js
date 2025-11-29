import fs from 'fs';
import path from 'path';

// File paths
const resultsDir = path.join(process.cwd(), 'src', 'mock', 'results');
const resultsFilePath = path.join(resultsDir, 'index.json');
const examsDir = path.join(process.cwd(), 'src', 'mock', 'exams');
const examsFilePath = path.join(examsDir, 'index.json');

/**
 * Read JSON file safely
 */
function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

/**
 * Write JSON file safely
 */
function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Check if question type is Essay
 */
function isEssayType(type) {
  if (!type) return true; // Default to Essay if no type
  const t = type.toLowerCase();
  return t === 'essay' || t === 'uraian';
}

export default function handler(req, res) {
  // ============================================
  // PUT: Update student scores (Manual Grading)
  // ============================================
  if (req.method === 'PUT') {
    try {
      const { examId, nisn, gradedAnswers } = req.body;

      // Validate required fields
      if (!examId) {
        return res.status(400).json({
          success: false,
          message: 'examId is required'
        });
      }

      if (!nisn) {
        return res.status(400).json({
          success: false,
          message: 'nisn is required'
        });
      }

      if (!gradedAnswers || typeof gradedAnswers !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'gradedAnswers object is required'
        });
      }

      // Check if results file exists
      if (!fs.existsSync(resultsFilePath)) {
        return res.status(404).json({
          success: false,
          message: 'Results file not found'
        });
      }

      // Read all results
      const results = readJsonFile(resultsFilePath, []);

      // Find the specific submission by examId and studentIdentity.nisn
      const resultIndex = results.findIndex(
        r => r.examId === examId && r.studentIdentity?.nisn === nisn
      );

      if (resultIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found for this examId and NISN'
        });
      }

      const result = results[resultIndex];

      // Read exam data to get question types for accurate scoring
      const exams = readJsonFile(examsFilePath, []);
      const exam = exams.find(e => e.id === examId);
      
      // Create a map of questionId to question data
      const questionMap = {};
      if (exam?.questions) {
        exam.questions.forEach(q => {
          questionMap[q.id] = q;
        });
      }

      // IMPORTANT: Preserve existing answers, only update graded ones
      // Copy existing arrays to preserve all data
      const updatedAnswers = [...(result.answers || [])];
      const updatedDetails = [...(result.details || [])];

      // Only update the specific questions that are being graded
      Object.entries(gradedAnswers).forEach(([indexStr, score]) => {
        const index = parseInt(indexStr, 10);
        const scoreValue = parseFloat(score) || 0;

        // Get question type from details or exam data
        const detail = updatedDetails[index];
        const answer = updatedAnswers[index];
        const questionId = detail?.questionId || answer?.questionId;
        const questionData = questionMap[questionId];
        const questionType = detail?.type || questionData?.type || 'Essay';

        // Only update if it's an Essay type (manual grading)
        // Skip MCQ - they should keep their auto-graded scores
        if (isEssayType(questionType)) {
          // Update in answers array
          if (updatedAnswers[index]) {
            updatedAnswers[index] = {
              ...updatedAnswers[index],
              points: scoreValue,
              isCorrect: scoreValue > 0,
              isGraded: true
            };
          }

          // Update in details array if exists
          if (updatedDetails[index]) {
            updatedDetails[index] = {
              ...updatedDetails[index],
              points: scoreValue,
              isCorrect: scoreValue > 0,
              needsReview: false,
              isGraded: true
            };
          }
        }
        // For MCQ: Keep existing points (don't overwrite auto-graded score)
      });

      // Recalculate total score from ALL answers (both MCQ and Essay)
      // First, make sure MCQ answers have their points set correctly
      updatedDetails.forEach((detail, idx) => {
        if (detail && !isEssayType(detail.type)) {
          // MCQ: Ensure points are set based on correctness
          const isCorrect = detail.isCorrect;
          const existingPoints = detail.points;
          
          // If MCQ has no points set, calculate from correctness
          if (existingPoints === undefined || existingPoints === null) {
            // Default MCQ scoring: 100 per correct answer (or use exam weight if available)
            const mcqPoints = isCorrect ? 100 : 0;
            updatedDetails[idx] = {
              ...detail,
              points: mcqPoints
            };
            if (updatedAnswers[idx]) {
              updatedAnswers[idx] = {
                ...updatedAnswers[idx],
                points: mcqPoints
              };
            }
          }
        }
      });

      // Calculate total score from all answers
      const totalScore = updatedDetails.reduce((sum, detail, idx) => {
        // Prefer detail.points, fallback to answer.points
        const points = detail?.points ?? updatedAnswers[idx]?.points ?? 0;
        return sum + points;
      }, 0);

      // Count correct answers
      const correctCount = updatedDetails.filter(d => d?.isCorrect).length;

      // Check if all Essay questions have been graded
      const needsManualReview = updatedDetails.some(d => 
        isEssayType(d?.type) && d?.needsReview === true
      );

      // Update the result object
      results[resultIndex] = {
        ...result,
        answers: updatedAnswers,
        details: updatedDetails,
        score: totalScore,
        correctCount,
        needsManualReview,
        status: needsManualReview ? 'needs_grading' : 'graded',
        gradedAt: new Date().toISOString()
      };

      // Write back to file
      writeJsonFile(resultsFilePath, results);

      return res.status(200).json({
        success: true,
        message: 'Scores updated successfully',
        newScore: totalScore,
        correctCount,
        needsManualReview,
        gradedAt: results[resultIndex].gradedAt
      });

    } catch (error) {
      console.error('Grade API Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    message: 'Method not allowed. Use PUT to grade submissions.'
  });
}
