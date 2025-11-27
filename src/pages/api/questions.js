import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'mock', 'questions', 'index.json');

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
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
