import fs from 'fs';
import path from 'path';

// File paths
const resultsDir = path.join(process.cwd(), 'src', 'mock', 'results');
const resultsFilePath = path.join(resultsDir, 'index.json');
const examsFilePath = path.join(process.cwd(), 'src', 'mock', 'exams', 'index.json');

/**
 * Ensure directory and file exist
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

export default function handler(req, res) {
  try {
    // ============================================
    // GET: Retrieve exam results
    // ============================================
    if (req.method === 'GET') {
      const { examId, sortBy = 'submittedAt', sortOrder = 'desc', teacherNuptk } = req.query;

      // Validate examId
      if (!examId) {
        return res.status(400).json({
          success: false,
          message: 'Exam ID is required'
        });
      }

      // Optional: Verify teacher ownership
      if (teacherNuptk) {
        const exams = readJsonFile(examsFilePath, []);
        const exam = exams.find(e => e.id === examId);
        
        if (exam && exam.teacher_nuptk !== teacherNuptk) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to view these results'
          });
        }
      }

      // Ensure results file exists
      ensureFileExists(resultsDir, resultsFilePath, '[]');

      // Read all results
      const allResults = readJsonFile(resultsFilePath, []);

      // Filter by examId
      let filteredResults = allResults.filter(r => r.examId === examId);

      // Sort results
      filteredResults.sort((a, b) => {
        let valueA, valueB;

        if (sortBy === 'score') {
          valueA = a.score || 0;
          valueB = b.score || 0;
        } else if (sortBy === 'name') {
          valueA = a.studentIdentity?.name?.toLowerCase() || '';
          valueB = b.studentIdentity?.name?.toLowerCase() || '';
          // String comparison
          if (sortOrder === 'asc') {
            return valueA.localeCompare(valueB);
          }
          return valueB.localeCompare(valueA);
        } else {
          // Default: submittedAt
          valueA = new Date(a.submittedAt || 0).getTime();
          valueB = new Date(b.submittedAt || 0).getTime();
        }

        // Numeric comparison
        if (sortOrder === 'asc') {
          return valueA - valueB;
        }
        return valueB - valueA;
      });

      // Calculate statistics
      const totalSubmissions = filteredResults.length;
      const scores = filteredResults.map(r => r.score || 0);
      const averageScore = totalSubmissions > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / totalSubmissions) 
        : 0;
      const highestScore = totalSubmissions > 0 ? Math.max(...scores) : 0;
      const lowestScore = totalSubmissions > 0 ? Math.min(...scores) : 0;
      const passCount = filteredResults.filter(r => (r.score || 0) >= 70).length;
      const passRate = totalSubmissions > 0 
        ? Math.round((passCount / totalSubmissions) * 100) 
        : 0;

      return res.status(200).json({
        success: true,
        examId,
        statistics: {
          totalSubmissions,
          averageScore,
          highestScore,
          lowestScore,
          passCount,
          passRate
        },
        results: filteredResults.map(r => ({
          id: r.id,
          studentName: r.studentIdentity?.name || 'Unknown',
          studentNisn: r.studentIdentity?.nisn || '',
          studentClass: r.studentIdentity?.class || '',
          score: r.score || 0,
          correctCount: r.correctCount || 0,
          totalQuestions: r.totalQuestions || 0,
          needsManualReview: r.needsManualReview || false,
          timeSpent: r.timeSpent || 0,
          submittedAt: r.submittedAt
        }))
      });
    }

    // ============================================
    // GET single result detail (with answers)
    // ============================================
    if (req.method === 'POST' && req.body?.action === 'getDetail') {
      const { resultId } = req.body;

      if (!resultId) {
        return res.status(400).json({
          success: false,
          message: 'Result ID is required'
        });
      }

      const allResults = readJsonFile(resultsFilePath, []);
      const result = allResults.find(r => r.id === resultId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Result not found'
        });
      }

      return res.status(200).json({
        success: true,
        result
      });
    }

    // ============================================
    // DELETE: Remove a result (admin only)
    // ============================================
    if (req.method === 'DELETE') {
      const { resultId } = req.query;

      if (!resultId) {
        return res.status(400).json({
          success: false,
          message: 'Result ID is required'
        });
      }

      ensureFileExists(resultsDir, resultsFilePath, '[]');
      let results = readJsonFile(resultsFilePath, []);
      
      const initialLength = results.length;
      results = results.filter(r => r.id !== resultId);

      if (results.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: 'Result not found'
        });
      }

      fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2), 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Result deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Exam Results API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
