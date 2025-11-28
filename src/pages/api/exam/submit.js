import fs from 'fs';
import path from 'path';

const examsFilePath = path.join(process.cwd(), 'src', 'mock', 'exams', 'index.json');
const resultsFilePath = path.join(process.cwd(), 'src', 'mock', 'results', 'index.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { examId, studentNuptk, studentName, answers } = req.body;

    if (!examId || !studentNuptk || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 1. Load Exam Data
    if (!fs.existsSync(examsFilePath)) {
      return res.status(404).json({ message: 'Exam database not found' });
    }
    const examsData = fs.readFileSync(examsFilePath, 'utf8');
    const exams = JSON.parse(examsData);
    const exam = exams.find(e => e.id === examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // 2. Auto-Grading Logic
    let score = 0;
    let totalScore = 0;
    let gradedCount = 0;
    
    const gradedAnswers = exam.questions.map(q => {
      const studentAnswer = answers[q.id];
      let isCorrect = false;
      let points = 0;

      // Default point per question is 10, or calculate based on total questions
      // For simplicity, let's say each question is worth 1 point for raw score
      const maxPoints = 1; 

      if (q.type === 'multiple-choice') {
        // Compare answers (assuming correctAnswer is stored in question)
        // Note: In a real app, ensure types match (string vs number)
        if (studentAnswer === q.correctAnswer) {
          isCorrect = true;
          points = maxPoints;
          score += points;
        }
        gradedCount++;
      } else {
        // Essay questions need manual grading
        // We mark them as 0 points for now, but status 'needs_grading'
        isCorrect = null; // Null implies manual grading needed
      }
      
      totalScore += maxPoints;

      return {
        questionId: q.id,
        answer: studentAnswer,
        isCorrect,
        points
      };
    });

    // Calculate final score (0-100 scale) only for auto-graded parts? 
    // Or just store raw score. Let's store raw score and max score.
    
    // 3. Save Result
    if (!fs.existsSync(resultsFilePath)) {
      fs.mkdirSync(path.dirname(resultsFilePath), { recursive: true });
      fs.writeFileSync(resultsFilePath, '[]');
    }
    const resultsData = fs.readFileSync(resultsFilePath, 'utf8');
    const results = JSON.parse(resultsData);

    // Check for existing submission
    const existingIndex = results.findIndex(r => r.examId === examId && r.studentNuptk === studentNuptk);
    
    const newResult = {
      id: existingIndex !== -1 ? results[existingIndex].id : Date.now().toString(),
      examId,
      examTitle: exam.title,
      studentNuptk,
      studentName: studentName || 'Student',
      submittedAt: new Date().toISOString(),
      answers: gradedAnswers,
      score, // Raw score from auto-grading
      totalQuestions: exam.questions.length,
      status: exam.questions.some(q => q.type !== 'multiple-choice') ? 'needs_grading' : 'graded'
    };

    if (existingIndex !== -1) {
      // Update existing (if retakes allowed, logic would be here. For now, overwrite)
      results[existingIndex] = newResult;
    } else {
      results.push(newResult);
    }

    fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));

    return res.status(200).json({ 
      message: 'Exam submitted successfully', 
      resultId: newResult.id,
      score: newResult.score,
      status: newResult.status
    });

  } catch (error) {
    console.error('Submit Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
