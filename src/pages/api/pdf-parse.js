import pdf from 'pdf-parse';

async function parsePDF(fileBuffer) {
  const data = await pdf(fileBuffer);
  return data.text;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { file } = req.body;
    const buffer = Buffer.from(file, 'base64');

    try {
      const text = await parsePDF(buffer);
      res.status(200).json({ text });
    } catch (error) {
      res.status(500).json({ error: 'Failed to parse PDF' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}