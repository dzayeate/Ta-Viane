/**
 * Content Sanitizer Utility
 * Cleans up AI-generated text by removing metadata artifacts
 */

/**
 * Regex patterns for removing unwanted content
 */
const PATTERNS = {
  // Leading numbering: "1.", "10)", "Question 1:", "Soal 1:", etc.
  leadingNumber: /^(?:\d+[.):\s]+|(?:Question|Soal|Nomor)\s*\d+[:.]\s*)/i,

  // Cognitive level markers (entire line or inline)
  cognitiveLevel: /(?:^|\n)\s*(?:Cognitive\s*Level|Tingkat\s*Kognitif|Level\s*Kognitif)\s*[:=]?\s*[A-Z]?\d*[^\n]*/gi,

  // Question type markers
  questionType: /(?:^|\n)\s*(?:Question\s*Type|Tipe\s*Soal|Jenis\s*Soal|Type)\s*[:=]?\s*[^\n]*/gi,

  // Bloom's Taxonomy references
  bloomsTaxonomy: /(?:^|\n)\s*(?:Bloom'?s?\s*Taxonomy|Taksonomi\s*Bloom)\s*[:=]?\s*[^\n]*/gi,

  // Difficulty level markers
  difficultyLevel: /(?:^|\n)\s*(?:Difficulty|Tingkat\s*Kesulitan|Kesulitan)\s*[:=]?\s*[^\n]*/gi,

  // Topic/Chapter markers that slip through
  topicMarker: /(?:^|\n)\s*(?:Topic|Topik|Chapter|Bab|Materi)\s*[:=]?\s*[^\n]*/gi,

  // Multiple consecutive newlines (cleanup)
  multipleNewlines: /\n{3,}/g,

  // Leading/trailing whitespace per line
  lineWhitespace: /^[ \t]+|[ \t]+$/gm,
};

/**
 * Sanitizes question text by removing AI metadata artifacts
 * @param {string} text - Raw question text from AI
 * @returns {string} - Cleaned question text
 */
export function sanitizeQuestionText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text;

  // Remove leading numbering
  cleaned = cleaned.replace(PATTERNS.leadingNumber, '');

  // Remove cognitive level markers
  cleaned = cleaned.replace(PATTERNS.cognitiveLevel, '');

  // Remove question type markers
  cleaned = cleaned.replace(PATTERNS.questionType, '');

  // Remove Bloom's Taxonomy references
  cleaned = cleaned.replace(PATTERNS.bloomsTaxonomy, '');

  // Remove difficulty level markers
  cleaned = cleaned.replace(PATTERNS.difficultyLevel, '');

  // Remove topic markers
  cleaned = cleaned.replace(PATTERNS.topicMarker, '');

  // Clean up multiple newlines
  cleaned = cleaned.replace(PATTERNS.multipleNewlines, '\n\n');

  // Clean line whitespace
  cleaned = cleaned.replace(PATTERNS.lineWhitespace, '');

  // Final trim
  return cleaned.trim();
}

/**
 * Patterns for identifying final answer markers
 */
const ANSWER_MARKERS = [
  // Indonesian markers
  /(?:^|\n)\s*(?:Jawaban\s*(?:Akhir|Benar|yang\s*Benar))\s*[:=]\s*/i,
  /(?:^|\n)\s*(?:Kunci\s*Jawaban)\s*[:=]\s*/i,
  /(?:^|\n)\s*(?:Jawaban)\s*[:=]\s*([A-E])\b/i,

  // English markers
  /(?:^|\n)\s*(?:Final\s*Answer|Correct\s*Answer|Answer\s*Key|The\s*Answer\s*is)\s*[:=]\s*/i,
  /(?:^|\n)\s*(?:Answer)\s*[:=]\s*([A-E])\b/i,

  // Simple letter answer at end: "Jawaban: B" or just "B."
  /(?:^|\n)\s*(?:Jawaban|Answer)\s*[:=]?\s*([A-E])\.?\s*$/i,
];

/**
 * Pattern to detect if text is just a simple answer key (A-E)
 */
const SIMPLE_ANSWER_PATTERN = /^[A-E]\.?$/i;

/**
 * Parses answer block to separate explanation/steps from final answer
 * @param {string} answerText - Raw answer text from AI
 * @returns {{ explanation: string, finalAnswer: string }} - Separated components
 */
export function parseAnswerBlock(answerText) {
  if (!answerText || typeof answerText !== 'string') {
    return { explanation: '', finalAnswer: '' };
  }

  const text = answerText.trim();

  // Check if it's just a simple answer (A, B, C, D, E)
  if (SIMPLE_ANSWER_PATTERN.test(text)) {
    return {
      explanation: '',
      finalAnswer: text.replace('.', '').toUpperCase(),
    };
  }

  // Try to find answer marker and split
  for (const pattern of ANSWER_MARKERS) {
    const match = text.match(pattern);
    if (match) {
      const markerIndex = match.index || 0;
      const markerLength = match[0].length;

      // Everything before the marker is explanation
      const explanation = text.substring(0, markerIndex).trim();

      // Everything after (including captured group if exists) is final answer
      let finalAnswer = text.substring(markerIndex + markerLength).trim();

      // If pattern captured a letter group, use that
      if (match[1]) {
        finalAnswer = match[1].toUpperCase();
      }

      // Clean up final answer (remove trailing explanation if any)
      // Sometimes AI adds explanation after the answer key
      const finalAnswerMatch = finalAnswer.match(/^([A-E])(?:[.\s]|$)/i);
      if (finalAnswerMatch) {
        finalAnswer = finalAnswerMatch[1].toUpperCase();
      }

      return {
        explanation: sanitizeQuestionText(explanation),
        finalAnswer: finalAnswer.trim(),
      };
    }
  }

  // No marker found - try to detect answer at the very end
  // Pattern: "... maka jawabannya adalah B" or "Therefore, the answer is C"
  const endAnswerPattern = /(?:jawabannya\s*(?:adalah)?|the\s*answer\s*is|jawaban(?:nya)?)\s*[:=]?\s*([A-E])\.?\s*$/i;
  const endMatch = text.match(endAnswerPattern);

  if (endMatch) {
    const explanation = text.substring(0, endMatch.index).trim();
    return {
      explanation: sanitizeQuestionText(explanation),
      finalAnswer: endMatch[1].toUpperCase(),
    };
  }

  // Last resort: check if last line is just a letter
  const lines = text.split('\n').filter(line => line.trim());
  const lastLine = lines[lines.length - 1]?.trim() || '';

  if (SIMPLE_ANSWER_PATTERN.test(lastLine)) {
    const explanation = lines.slice(0, -1).join('\n').trim();
    return {
      explanation: sanitizeQuestionText(explanation),
      finalAnswer: lastLine.replace('.', '').toUpperCase(),
    };
  }

  // Could not separate - return all as explanation
  return {
    explanation: sanitizeQuestionText(text),
    finalAnswer: '',
  };
}

/**
 * Sanitizes a full question object
 * @param {Object} question - Question object with description, answer, etc.
 * @returns {Object} - Sanitized question object
 */
export function sanitizeQuestion(question) {
  if (!question) return question;

  const sanitized = { ...question };

  // Sanitize description
  if (sanitized.description) {
    sanitized.description = sanitizeQuestionText(sanitized.description);
  }

  // Parse and sanitize answer
  if (sanitized.answer || sanitized.correctAnswer) {
    const answerText = sanitized.answer || sanitized.correctAnswer;
    const { explanation, finalAnswer } = parseAnswerBlock(answerText);

    sanitized.explanation = explanation;
    sanitized.finalAnswer = finalAnswer;

    // Keep original answer for backward compatibility
    if (!sanitized.correctAnswer && sanitized.answer) {
      sanitized.correctAnswer = answerText;
    }
  }

  return sanitized;
}

/**
 * Batch sanitize multiple questions
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array of sanitized question objects
 */
export function sanitizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map(sanitizeQuestion);
}

export default {
  sanitizeQuestionText,
  parseAnswerBlock,
  sanitizeQuestion,
  sanitizeQuestions,
};
