import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'src', 'mock', 'questions', 'index.json');

    if (req.method === 'GET') {
        try {
            // Ensure directory exists
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '[]', 'utf8');
                return res.status(200).json([]);
            }

            const fileData = fs.readFileSync(filePath, 'utf8');
            let questions = [];
            try {
                questions = fileData ? JSON.parse(fileData) : [];
            } catch (e) {
                console.error('Error parsing JSON, resetting file:', e);
                questions = [];
                fs.writeFileSync(filePath, '[]', 'utf8');
            }

            res.status(200).json(questions);
        } catch (error) {
            console.error('API Error (GET):', error);
            res.status(500).json({ message: 'Error reading questions data', error: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const newQuestions = req.body;

            // Ensure directory exists
            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            let currentQuestions = [];
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                try {
                    currentQuestions = fileData ? JSON.parse(fileData) : [];
                } catch (e) {
                    console.error('Error parsing JSON during POST, resetting:', e);
                    currentQuestions = [];
                }
            }

            const questionsToAdd = Array.isArray(newQuestions) ? newQuestions : [newQuestions];

            // Add ID and timestamp if not present
            const processedQuestions = questionsToAdd.map(q => ({
                ...q,
                id: q.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                savedAt: q.savedAt || new Date().toISOString()
            }));

            const updatedQuestions = [...currentQuestions, ...processedQuestions];

            fs.writeFileSync(filePath, JSON.stringify(updatedQuestions, null, 2), 'utf8');

            res.status(200).json({ message: 'Questions saved successfully', count: updatedQuestions.length });
        } catch (error) {
            console.error('API Error (POST):', error);
            res.status(500).json({ message: 'Error saving questions', error: error.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { questionId, userNuptk } = req.body;

            if (!questionId || !userNuptk) {
                return res.status(400).json({ message: 'Missing questionId or userNuptk' });
            }

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Questions file not found' });
            }

            const fileData = fs.readFileSync(filePath, 'utf8');
            let questions = [];
            try {
                questions = fileData ? JSON.parse(fileData) : [];
            } catch (e) {
                return res.status(500).json({ message: 'Error parsing questions data' });
            }

            const questionIndex = questions.findIndex(q => q.id === questionId);

            if (questionIndex === -1) {
                return res.status(404).json({ message: 'Question not found' });
            }

            const question = questions[questionIndex];

            // Check ownership
            // Note: We use optional chaining just in case author structure is missing, though it shouldn't be based on requirements
            if (question.author?.nupkt !== userNuptk) {
                return res.status(403).json({ message: 'Forbidden: You can only delete your own questions' });
            }

            // Remove the question
            questions.splice(questionIndex, 1);

            fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');

            res.status(200).json({ message: 'Question deleted successfully' });

        } catch (error) {
            console.error('API Error (DELETE):', error);
            res.status(500).json({ message: 'Error deleting question', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
