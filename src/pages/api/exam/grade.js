import fs from 'fs';
import path from 'path';

// File paths
const resultsDir = path.join(process.cwd(), 'src', 'mock', 'results');
const resultsFilePath = path.join(resultsDir, 'index.json');

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

      // Update scores for specific questions based on gradedAnswers
      // gradedAnswers format: { "0": 10, "2": 15 } where key is question index
      const updatedAnswers = [...(result.answers || [])];
      const updatedDetails = [...(result.details || [])];

      Object.entries(gradedAnswers).forEach(([indexStr, score]) => {
        const index = parseInt(indexStr, 10);
        const scoreValue = parseFloat(score) || 0;

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
      });

      // Recalculate total score
      const totalScore = updatedAnswers.reduce((sum, ans) => {
        return sum + (ans.points || 0);
      }, 0);

      // Count correct answers
      const correctCount = updatedAnswers.filter(ans => ans.isCorrect).length;

      // Check if all questions needing review have been graded
      const needsManualReview = updatedDetails.some(d => d.needsReview === true);

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
