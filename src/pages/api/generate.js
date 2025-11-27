import { generatePrompt, callGemini } from "@/libs/Gemini";

require('dotenv').config();

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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

