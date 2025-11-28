import fs from 'fs';
import path from 'path';

const examsFilePath = path.join(process.cwd(), 'src', 'mock', 'exams', 'index.json');

export default function handler(req, res) {
  try {
    // Ensure file exists
    if (!fs.existsSync(examsFilePath)) {
      fs.mkdirSync(path.dirname(examsFilePath), { recursive: true });
      fs.writeFileSync(examsFilePath, '[]');
    }

    const fileData = fs.readFileSync(examsFilePath, 'utf8');
    let exams = JSON.parse(fileData);

    // GET: List exams
    if (req.method === 'GET') {
      const { teacher_nuptk, classId, id } = req.query;

      if (id) {
        const exam = exams.find(e => e.id === id);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        return res.status(200).json(exam);
      }

      let filteredExams = exams;

      if (teacher_nuptk) {
        filteredExams = filteredExams.filter(e => e.teacher_nuptk === teacher_nuptk);
      }

      if (classId) {
        filteredExams = filteredExams.filter(e => e.classId === classId);
      }

      // Sort by newest first
      filteredExams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(filteredExams);
    }

    // POST: Create new exam
    if (req.method === 'POST') {
      // Accept both 'class' and 'classId' for flexibility
      const { title, classId, duration, questions, teacher_nuptk, description, status } = req.body;
      const examClass = classId || req.body.class; // Support both field names

      if (!title || !examClass || !teacher_nuptk) {
        return res.status(400).json({ message: 'Missing required fields: title, class/classId, teacher_nuptk' });
      }

      if (!Array.isArray(questions)) {
        return res.status(400).json({ message: 'Questions must be an array' });
      }

      // Generate a human-readable exam code
      const examCode = `EX-${examClass}-${Date.now().toString(36).toUpperCase()}`;

      const newExam = {
        id: Date.now().toString(),
        code: examCode,
        title,
        description: description || '',
        classId: examClass,
        class: examClass, // Keep both for compatibility
        teacher_nuptk,
        duration: parseInt(duration) || 60, // Default 60 minutes
        questions: questions, // Snapshot of questions
        status: status || 'active', // Default to active
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      exams.push(newExam);
      fs.writeFileSync(examsFilePath, JSON.stringify(exams, null, 2));
      return res.status(201).json(newExam);
    }

    // PUT: Update exam
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Exam ID is required' });
      }

      const examIndex = exams.findIndex(e => e.id === id);
      if (examIndex === -1) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      // Prevent updating immutable fields if necessary, or just merge
      // Ensure questions are still an array if updated
      if (updates.questions && !Array.isArray(updates.questions)) {
        return res.status(400).json({ message: 'Questions must be an array' });
      }

      exams[examIndex] = {
        ...exams[examIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(examsFilePath, JSON.stringify(exams, null, 2));
      return res.status(200).json(exams[examIndex]);
    }

    // DELETE: Remove exam
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Exam ID is required' });
      }

      const initialLength = exams.length;
      exams = exams.filter(e => e.id !== id);

      if (exams.length === initialLength) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      fs.writeFileSync(examsFilePath, JSON.stringify(exams, null, 2));
      return res.status(200).json({ message: 'Exam deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
