import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'mock', 'classes', 'index.json');

const generateClassCode = () => {
  // Generate 6 char random string (uppercase + numbers)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function handler(req, res) {
  try {
    // Ensure file exists
    if (!fs.existsSync(dataFilePath)) {
      fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
      fs.writeFileSync(dataFilePath, '[]');
    }

    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    let classes = JSON.parse(fileData);

    // GET: List classes
    if (req.method === 'GET') {
      const { teacher_nuptk, id, classCode } = req.query;

      if (id) {
        const foundClass = classes.find(c => c.id === id);
        if (!foundClass) return res.status(404).json({ message: 'Class not found' });
        return res.status(200).json(foundClass);
      }

      if (classCode) {
        const foundClass = classes.find(c => c.classCode === classCode);
        if (!foundClass) return res.status(404).json({ message: 'Class not found' });
        return res.status(200).json(foundClass);
      }

      if (teacher_nuptk) {
        const filtered = classes.filter(c => c.teacher_nuptk === teacher_nuptk);
        return res.status(200).json(filtered);
      }
      return res.status(200).json(classes);
    }

    // POST: Create Class
    if (req.method === 'POST') {
      const { name, grade, school, teacher_nuptk } = req.body;
      
      if (!name || !grade || !teacher_nuptk) {
        return res.status(400).json({ message: 'Missing required fields: name, grade, teacher_nuptk' });
      }

      // Ensure unique class code
      let classCode = generateClassCode();
      while (classes.some(c => c.classCode === classCode)) {
        classCode = generateClassCode();
      }

      const newClass = {
        id: Date.now().toString(),
        name,
        grade,
        school: school || '',
        teacher_nuptk,
        classCode,
        students: [],
        createdAt: new Date().toISOString()
      };

      classes.push(newClass);
      fs.writeFileSync(dataFilePath, JSON.stringify(classes, null, 2));
      return res.status(201).json(newClass);
    }

    // PUT: Add Student
    if (req.method === 'PUT') {
      const { classId, student } = req.body;

      if (!classId || !student) {
         return res.status(400).json({ message: 'Missing classId or student data' });
      }

      const classIndex = classes.findIndex(c => c.id === classId);
      if (classIndex === -1) {
        return res.status(404).json({ message: 'Class not found' });
      }

      const currentClass = classes[classIndex];
      
      // Validate student data
      if (!student.name || !student.nisn) {
        return res.status(400).json({ message: 'Student name and NISN are required' });
      }

      // Check for duplicate NISN in the same class
      if (currentClass.students.some(s => s.nisn === student.nisn)) {
        return res.status(400).json({ message: 'Student with this NISN already exists in the class' });
      }

      const newStudent = {
        id: Date.now().toString(), // Generate a unique ID for the student record
        name: student.name,
        nisn: student.nisn,
        email: student.email || '',
        joinedAt: new Date().toISOString()
      };

      classes[classIndex].students.push(newStudent);
      fs.writeFileSync(dataFilePath, JSON.stringify(classes, null, 2));
      
      return res.status(200).json(classes[classIndex]);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
