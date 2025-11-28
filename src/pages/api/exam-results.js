import fs from 'fs';
import path from 'path';

const resultsFilePath = path.join(process.cwd(), 'src', 'mock', 'results', 'index.json');

export default function handler(req, res) {
  try {
    // Ensure file exists
    if (!fs.existsSync(resultsFilePath)) {
      fs.mkdirSync(path.dirname(resultsFilePath), { recursive: true });
      fs.writeFileSync(resultsFilePath, '[]');
    }

    const fileData = fs.readFileSync(resultsFilePath, 'utf8');
    let results = JSON.parse(fileData);

    // GET: List results
    if (req.method === 'GET') {
      const { examId, studentId } = req.query;
      
      let filteredResults = results;

      if (examId) {
        filteredResults = filteredResults.filter(r => r.examId === examId);
      }

      if (studentId) {
        filteredResults = filteredResults.filter(r => r.studentId === studentId);
      }

      // Sort by newest
      filteredResults.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      return res.status(200).json(filteredResults);
    }

    // POST: Submit new result
    if (req.method === 'POST') {
      const { examId, studentId, studentName, answers, score, totalQuestions } = req.body;

      if (!examId || !studentId || !answers) {
        return res.status(400).json({ message: 'Missing required fields: examId, studentId, answers' });
      }

      // Check if already submitted (optional, but good for integrity)
      const existingSubmission = results.find(r => r.examId === examId && r.studentId === studentId);
      if (existingSubmission) {
        return res.status(409).json({ message: 'Student has already submitted this exam' });
      }

      const newResult = {
        id: Date.now().toString(),
        examId,
        studentId,
        studentName: studentName || 'Unknown',
        answers, // Array of { questionId, selectedOption }
        score: score || 0,
        totalQuestions: totalQuestions || 0,
        submittedAt: new Date().toISOString()
      };

      results.push(newResult);
      fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));
      return res.status(201).json(newResult);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
