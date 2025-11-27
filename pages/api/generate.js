import { fineTuneDetailId, fineTuneDetailEn, fineTuneListId, fineTuneListEn } from "../../utils/fine-tune";
import { systemPromptDetailId, systemPromptDetailEn, systemPromptListId, systemPromptListEn } from "../../utils/system-prompt";

require('dotenv').config();

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function (req, res) {
  const { prompt, mode, difficulty, reference, type, total, lang, stream } = req.body || {};

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: { message: "Gemini API key is not configured." }
    });
  }

  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({
      error: { message: "Please enter a valid text" }
    });
  }

  const totalQuestions = parseInt(total, 10);

  // Limit to maximum 5 questions per request for list mode
  if (mode === "list" && totalQuestions > 5) {
    return res.status(400).json({
      error: { message: "Maximum 5 questions per request. Please split into multiple requests." }
    });
  }

  try {
    if (mode === "detail") {
      const body = {
        prompt,
        mode,
        difficulty,
        reference,
        type,
        total,
        lang
      }
      const messages = generatePrompt(body);
      const responseText = await callGemini(messages);

      res.status(200).json({ result: responseText });
      return;
    }

    // Streaming mode for list
    if (stream) {
      // Set headers for Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Get range from request body
      const { range } = req.body;
      const startQuestion = range?.start || 1;
      const endQuestion = range?.end || totalQuestions;

      // Send initial status
      res.write(`data: ${JSON.stringify({
        type: 'status',
        message: 'Starting generation...',
        total: totalQuestions,
        completed: 0
      })}\n\n`);

      // Force flush initial status
      if (res.flush) res.flush();

      let completedQuestions = 0;

      // Generate questions using the specified range
      for (let questionIndex = startQuestion; questionIndex <= endQuestion; questionIndex++) {
        try {
          // Send progress update
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            message: `Generating question ${questionIndex}...`,
            completed: completedQuestions,
            total: totalQuestions,
            current: questionIndex
          })}\n\n`);

          if (res.flush) res.flush();

          const questionBody = {
            prompt,
            mode,
            difficulty,
            reference,
            type,
            total: 1, // Generate only 1 question at a time
            range: { start: questionIndex, end: questionIndex },
            lang
          };

          const messages = generatePrompt(questionBody);
          const content = await callGemini(messages);

          // Parse the single question result
          if (content.trim()) {
            const results = content.split("<_>").map(item => item.trim()).filter(item => item);

            // Process each result (should be only 1, but handle multiple just in case)
            results.forEach((item) => {
              const [questionPrompt, thisDifficulty, questionType] = item.split("|->").map(part => part.trim());
              const settingDifficulty = difficulty === "Acak" ? thisDifficulty : difficulty;

              const questionData = {
                prompt: questionPrompt,
                difficulty: settingDifficulty,
                type: questionType || type,
                index: completedQuestions
              };

              // Send question immediately
              res.write(`data: ${JSON.stringify({
                type: 'question',
                data: questionData,
                completed: completedQuestions + 1,
                total: totalQuestions
              })}\n\n`);

              // Force flush to ensure immediate delivery
              if (res.flush) res.flush();

              completedQuestions++;
            });
          }

        } catch (error) {
          res.write(`data: ${JSON.stringify({
            type: 'error',
            message: `Error generating question ${questionIndex}: ${error.message}`,
            completed: completedQuestions,
            total: totalQuestions,
            current: questionIndex
          })}\n\n`);

          if (res.flush) res.flush();
        }
      }

      // Send completion status
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        message: 'Generation completed',
        completed: completedQuestions,
        total: totalQuestions
      })}\n\n`);

      if (res.flush) res.flush();
      res.end();
      return;
    }

    // Non-streaming mode - simplified to handle up to 5 questions directly
    const body = {
      prompt,
      mode,
      difficulty,
      reference,
      type,
      total: totalQuestions,
      range: { start: 1, end: totalQuestions },
      lang
    };

    const messages = generatePrompt(body);
    const content = await callGemini(messages);
    res.status(200).json({ result: content });

  } catch (error) {
    res.status(500).json({
      error: { message: error.message || 'An error occurred during your request.' }
    });
  }
}

async function callGemini(messages) {
  const contents = convertMessagesToContents(messages);

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.65,
        topP: 1.0,
        maxOutputTokens: 16384,
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Gemini API request failed.';
    throw new Error(message);
  }

  return data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
}

function convertMessagesToContents(messages = []) {
  return messages.map((message) => {
    const text = Array.isArray(message?.content)
      ? message.content.map((part) => part?.text || "").join("\n")
      : message?.content || "";

    if (message.role === "system") {
      return {
        role: "user",
        parts: [{ text: `System instructions:\n${text}` }]
      };
    }

    return {
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text }]
    };
  });
}

function generatePrompt(data) {
  const prompt = data?.prompt;
  const reference = data?.reference || "tidak ada";
  const difficulty = data?.difficulty || "Acak";
  const type = data?.type || "Acak";
  const total = data?.total || "1";
  const range = data?.range || { start: 1, end: total };
  const mode = data?.mode || "list";
  const lang = data?.lang || "id";
  const isId = lang === "id";

  let messages;

  if (mode === "detail") {
    messages = [
      {
        role: "system",
        content: isId ? systemPromptDetailId : systemPromptDetailEn,
      }
    ];

    if (lang === "id") {
      messages = [...messages, ...fineTuneDetailId];
    } else {
      messages = [...messages, ...fineTuneDetailEn];
    }
    const difficultyText = isId ? `tingkat kognitif Taksonomi Bloom ${difficulty}` : `Bloom's Taxonomy cognitive level ${difficulty}`;
    const typeText = isId ? `bertipe ${type}` : `question type ${type}`;
    const userContent = `|-[${prompt}]-| |-[${reference}]-| |-[${difficultyText}]-| |-[${typeText}]-|`;
    messages.push({
      role: "user",
      content: userContent,
    });

  } else {

    messages = [
      {
        role: "system",
        content: lang === "id" ? systemPromptListId : systemPromptListEn,
      },
    ];

    if (lang === "id") {
      messages = [...messages, ...fineTuneListId];
    } else {
      messages = [...messages, ...fineTuneListEn];
    }
    const difficultyText = isId ? `tingkat kognitif Taksonomi Bloom ${difficulty}` : `Bloom's Taxonomy cognitive level ${difficulty}`;
    const typeText = isId ? `bertipe ${type}` : `question type ${type}`;
    const rangeText = isId ? `soal mulai dari nomor ${range.start} sampai nomor ${range.end}` : `questions start from number ${range.start} to number ${range.end}`;
    const userContent = `|-[${prompt}]-| |-[${reference}]-| |-[${difficultyText}]-| |-[${typeText}]-| |-${rangeText}-|`;

    messages.push({
      role: "user",
      content: userContent,
    });
  }

  return messages;
}
