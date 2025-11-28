/**
 * Service to handle streaming question generation
 */

export async function generateQuestionsStream({
  prompt,
  difficulty,
  type,
  total,
  reference,
  lang,
  signal
}, callbacks) {
  const { onQuestionFound, onProgress, onComplete, onError } = callbacks;
  
  const totalQuestions = parseInt(total);
  const chunkSize = 5;
  const chunks = [];
  let startIndex = 1;

  // Create chunks
  while (startIndex <= totalQuestions) {
    const endIndex = Math.min(startIndex + chunkSize - 1, totalQuestions);
    const currentChunkSize = endIndex - startIndex + 1;
    chunks.push({
      start: startIndex,
      end: endIndex,
      size: currentChunkSize
    });
    startIndex = endIndex + 1;
  }

  let totalCompleted = 0;
  let isCancelled = false;

  // Process each chunk
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    // Check if cancelled
    if (signal?.aborted) {
      isCancelled = true;
      break;
    }

    const chunk = chunks[chunkIndex];

    // Notify progress
    if (onProgress) {
      onProgress({
        type: 'progress',
        chunkIndex,
        totalChunks: chunks.length,
        start: chunk.start,
        end: chunk.end,
        total: totalQuestions,
        completed: totalCompleted
      });
    }

    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type,
          difficulty,
          reference,
          mode: "list",
          total: chunk.size,
          range: { start: chunk.start, end: chunk.end },
          lang: lang || 'id',
          stream: true
        }),
        signal: signal
      });

      if (!response.ok) {
        throw new Error(`Failed to start streaming chunk ${chunkIndex + 1}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCompleted = 0;

      while (true) {
        if (signal?.aborted) {
          isCancelled = true;
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunkData = decoder.decode(value);
        const lines = chunkData.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'question') {
                const globalIndex = chunk.start + chunkCompleted - 1;
                
                if (onQuestionFound) {
                  onQuestionFound({
                    data: data.data,
                    globalIndex,
                    chunkIndex,
                    chunkPosition: chunkCompleted + 1,
                    totalCompleted: totalCompleted + chunkCompleted + 1
                  });
                }
                chunkCompleted++;
              } else if (data.type === 'complete') {
                totalCompleted += chunkCompleted;
                break;
              } else if (data.type === 'error') {
                if (onError) {
                  onError({
                    message: data.message,
                    chunkIndex,
                    completed: totalCompleted + chunkCompleted
                  });
                }
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }

      if (isCancelled) break;

    } catch (error) {
      if (error.name === 'AbortError') {
        isCancelled = true;
        break;
      }
      
      if (onError) {
        onError({
          message: error.message,
          chunkIndex,
          completed: totalCompleted
        });
      }
    }
  }

  if (onComplete) {
    onComplete({
      isCancelled,
      total: totalQuestions,
      completed: totalCompleted
    });
  }
}
