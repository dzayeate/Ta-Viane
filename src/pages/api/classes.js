import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'mock', 'classes', 'index.json');

/**
 * Generate unique 6-character class code
 */
const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Ensure data file exists
 */
const ensureFileExists = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
    fs.writeFileSync(dataFilePath, '[]');
  }
};

/**
 * Read classes from file
 */
const readClasses = () => {
  ensureFileExists();
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileData);
};

/**
 * Write classes to file
 */
const writeClasses = (classes) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(classes, null, 2));
};

/**
 * Class Management API
 * 
 * GET    /api/classes                    - List all classes (with filters)
 * GET    /api/classes?id=xxx             - Get single class
 * GET    /api/classes?classCode=xxx      - Get class by code
 * POST   /api/classes                    - Create new class
 * PUT    /api/classes                    - Update class info
 * DELETE /api/classes?id=xxx             - Delete class
 * 
 * Student Management (via action parameter):
 * PUT    /api/classes { action: 'addStudent', classId, student }
 * PUT    /api/classes { action: 'removeStudent', classId, studentId }
 * PUT    /api/classes { action: 'updateStudent', classId, studentId, student }
 * PUT    /api/classes { action: 'bulkAddStudents', classId, students }
 */
export default function handler(req, res) {
  try {
    let classes = readClasses();

    // ════════════════════════════════════════════════════════════════════
    // GET: List or Get Single Class
    // ════════════════════════════════════════════════════════════════════
    if (req.method === 'GET') {
      const { teacher_nuptk, id, classCode } = req.query;

      // Get single class by ID
      if (id) {
        const foundClass = classes.find(c => c.id === id);
        if (!foundClass) {
          return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
        return res.status(200).json(foundClass);
      }

      // Get class by code (for join page)
      if (classCode) {
        const foundClass = classes.find(c => c.classCode === classCode);
        if (!foundClass) {
          return res.status(404).json({ message: 'Kelas tidak ditemukan' });
        }
        return res.status(200).json(foundClass);
      }

      // Filter by teacher
      if (teacher_nuptk) {
        const filtered = classes.filter(c => c.teacher_nuptk === teacher_nuptk);
        return res.status(200).json(filtered);
      }

      // Return all classes
      return res.status(200).json(classes);
    }

    // ════════════════════════════════════════════════════════════════════
    // POST: Create New Class
    // ════════════════════════════════════════════════════════════════════
    if (req.method === 'POST') {
      const { name, grade, school, teacher_nuptk } = req.body;

      if (!name || !grade || !teacher_nuptk) {
        return res.status(400).json({ 
          message: 'Field wajib: name, grade, teacher_nuptk' 
        });
      }

      // Generate unique class code
      let classCode = generateClassCode();
      while (classes.some(c => c.classCode === classCode)) {
        classCode = generateClassCode();
      }

      const newClass = {
        id: Date.now().toString(),
        name: name.trim(),
        grade,
        school: school?.trim() || '',
        teacher_nuptk,
        classCode,
        students: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      classes.push(newClass);
      writeClasses(classes);

      return res.status(201).json(newClass);
    }

    // ════════════════════════════════════════════════════════════════════
    // PUT: Update Class or Manage Students
    // ════════════════════════════════════════════════════════════════════
    if (req.method === 'PUT') {
      const { action, classId, student, studentId, students, name, grade, school } = req.body;

      // Find class
      const classIndex = classes.findIndex(c => c.id === classId);
      if (classIndex === -1) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan' });
      }

      const currentClass = classes[classIndex];

      // ──────────────────────────────────────────────────────────────────
      // Action: Add Single Student
      // ──────────────────────────────────────────────────────────────────
      if (action === 'addStudent') {
        if (!student || !student.name || !student.nisn) {
          return res.status(400).json({ message: 'Nama dan NISN siswa wajib diisi' });
        }

        // Check duplicate NISN
        if (currentClass.students.some(s => s.nisn === student.nisn)) {
          return res.status(400).json({ message: 'Siswa dengan NISN ini sudah ada di kelas' });
        }

        const newStudent = {
          id: `student-${Date.now()}`,
          name: student.name.trim(),
          nisn: student.nisn.trim(),
          email: student.email?.trim() || '',
          joinedAt: new Date().toISOString()
        };

        classes[classIndex].students.push(newStudent);
        classes[classIndex].updatedAt = new Date().toISOString();
        writeClasses(classes);

        return res.status(200).json({ 
          message: 'Siswa berhasil ditambahkan',
          student: newStudent,
          class: classes[classIndex]
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // Action: Remove Student
      // ──────────────────────────────────────────────────────────────────
      if (action === 'removeStudent') {
        if (!studentId) {
          return res.status(400).json({ message: 'Student ID wajib' });
        }

        const studentIndex = currentClass.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) {
          return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }

        const removedStudent = currentClass.students[studentIndex];
        classes[classIndex].students.splice(studentIndex, 1);
        classes[classIndex].updatedAt = new Date().toISOString();
        writeClasses(classes);

        return res.status(200).json({ 
          message: 'Siswa berhasil dihapus',
          student: removedStudent,
          class: classes[classIndex]
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // Action: Update Student
      // ──────────────────────────────────────────────────────────────────
      if (action === 'updateStudent') {
        if (!studentId || !student) {
          return res.status(400).json({ message: 'Student ID dan data wajib' });
        }

        const studentIndex = currentClass.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) {
          return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }

        // Check duplicate NISN (exclude current student)
        if (student.nisn && student.nisn !== currentClass.students[studentIndex].nisn) {
          if (currentClass.students.some(s => s.id !== studentId && s.nisn === student.nisn)) {
            return res.status(400).json({ message: 'NISN sudah digunakan siswa lain' });
          }
        }

        classes[classIndex].students[studentIndex] = {
          ...currentClass.students[studentIndex],
          name: student.name?.trim() || currentClass.students[studentIndex].name,
          nisn: student.nisn?.trim() || currentClass.students[studentIndex].nisn,
          email: student.email?.trim() || currentClass.students[studentIndex].email
        };
        classes[classIndex].updatedAt = new Date().toISOString();
        writeClasses(classes);

        return res.status(200).json({ 
          message: 'Data siswa berhasil diperbarui',
          student: classes[classIndex].students[studentIndex],
          class: classes[classIndex]
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // Action: Bulk Add Students (CSV Import)
      // ──────────────────────────────────────────────────────────────────
      if (action === 'bulkAddStudents') {
        if (!students || !Array.isArray(students) || students.length === 0) {
          return res.status(400).json({ message: 'Data siswa tidak valid' });
        }

        const addedStudents = [];
        const skippedStudents = [];

        for (const student of students) {
          // Validate
          if (!student.name || !student.nisn) {
            skippedStudents.push({ ...student, reason: 'Nama/NISN kosong' });
            continue;
          }

          // Check duplicate
          if (currentClass.students.some(s => s.nisn === student.nisn)) {
            skippedStudents.push({ ...student, reason: 'NISN sudah ada' });
            continue;
          }

          const newStudent = {
            id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: student.name.trim(),
            nisn: student.nisn.trim(),
            email: student.email?.trim() || '',
            joinedAt: new Date().toISOString()
          };

          classes[classIndex].students.push(newStudent);
          addedStudents.push(newStudent);
        }

        classes[classIndex].updatedAt = new Date().toISOString();
        writeClasses(classes);

        return res.status(200).json({
          message: `${addedStudents.length} siswa ditambahkan, ${skippedStudents.length} dilewati`,
          added: addedStudents,
          skipped: skippedStudents,
          class: classes[classIndex]
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // Default PUT: Update Class Info
      // ──────────────────────────────────────────────────────────────────
      if (name) classes[classIndex].name = name.trim();
      if (grade) classes[classIndex].grade = grade;
      if (school !== undefined) classes[classIndex].school = school.trim();
      classes[classIndex].updatedAt = new Date().toISOString();
      
      writeClasses(classes);

      return res.status(200).json({
        message: 'Kelas berhasil diperbarui',
        class: classes[classIndex]
      });
    }

    // ════════════════════════════════════════════════════════════════════
    // DELETE: Delete Class
    // ════════════════════════════════════════════════════════════════════
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Class ID wajib' });
      }

      const classIndex = classes.findIndex(c => c.id === id);
      if (classIndex === -1) {
        return res.status(404).json({ message: 'Kelas tidak ditemukan' });
      }

      const deletedClass = classes[classIndex];
      classes.splice(classIndex, 1);
      writeClasses(classes);

      return res.status(200).json({
        message: 'Kelas berhasil dihapus',
        class: deletedClass
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
