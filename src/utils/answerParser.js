/**
 * Answer Parser Utility
 * Extracts answer key (A/B/C/D/E) from AI-generated answer text
 * for auto-grading purposes
 */

/**
 * Regex patterns to extract answer key from various formats
 * Ordered by specificity (most specific first)
 */
const KEY_EXTRACTION_PATTERNS = [
  // Indonesian patterns with explicit markers
  /(?:Jawaban\s*(?:Benar|yang\s*Benar|Akhir)?)\s*[:=]\s*([A-E])\b/i,
  /(?:Kunci\s*(?:Jawaban)?)\s*[:=]\s*([A-E])\b/i,
  /(?:Pilihan\s*(?:yang\s*)?(?:Benar|Tepat))\s*[:=]?\s*([A-E])\b/i,
  
  // English patterns
  /(?:Correct\s*Answer|Answer\s*Key|Final\s*Answer|The\s*Answer\s*is)\s*[:=]?\s*([A-E])\b/i,
  /(?:Answer)\s*[:=]\s*([A-E])\b/i,
  
  // Inline patterns (within explanation)
  /jawabannya\s+(?:adalah\s+)?([A-E])\b/i,
  /the\s+answer\s+is\s+([A-E])\b/i,
  /maka\s+([A-E])\s+(?:adalah\s+)?(?:jawaban|benar)/i,
  
  // Pattern at end of text: "... adalah B." or "... is C."
  /(?:adalah|is)\s+([A-E])\.?\s*$/i,
  
  // Just a letter at the very end (standalone line)
  /\n\s*([A-E])\.?\s*$/i,
  
  // Parenthetical answer: "(A)" or "[B]"
  /[(\[]([A-E])[)\]]\s*$/i,
];

/**
 * Pattern to detect if entire text is just a simple answer key
 */
const SIMPLE_KEY_PATTERN = /^[A-E]\.?$/i;

/**
 * Parses AI-generated answer to extract answer key and explanation separately
 * 
 * @param {string} fullText - Full answer text from AI
 * @returns {{ key: string, explanation: string }} - Separated key and explanation
 * 
 * @example
 * parseGeneratedAnswer("Untuk menghitung... Jawaban: B")
 * // Returns: { key: "B", explanation: "Untuk menghitung..." }
 * 
 * @example
 * parseGeneratedAnswer("C")
 * // Returns: { key: "C", explanation: "" }
 */
export function parseGeneratedAnswer(fullText) {
  // Handle empty/invalid input
  if (!fullText || typeof fullText !== 'string') {
    return { key: '', explanation: '' };
  }

  const text = fullText.trim();

  // Check if it's just a simple key (A, B, C, D, E)
  if (SIMPLE_KEY_PATTERN.test(text)) {
    return {
      key: text.replace('.', '').toUpperCase(),
      explanation: '',
    };
  }

  // Try each extraction pattern
  for (const pattern of KEY_EXTRACTION_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const key = match[1].toUpperCase();
      
      // Extract explanation by removing the matched portion
      // For patterns that match at end, everything before is explanation
      const matchIndex = match.index || 0;
      let explanation = '';
      
      // If match is at the end, take everything before
      if (matchIndex + match[0].length >= text.length - 5) {
        explanation = text.substring(0, matchIndex).trim();
      } else {
        // If match is in the middle, remove just the key marker
        explanation = text.replace(match[0], '').trim();
      }

      // Clean up explanation (remove trailing punctuation artifacts)
      explanation = explanation.replace(/\s*[:=]\s*$/, '').trim();

      return { key, explanation };
    }
  }

  // No key found - try to detect if last line/word is just a letter
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const lastLine = lines[lines.length - 1] || '';
  
  if (SIMPLE_KEY_PATTERN.test(lastLine)) {
    return {
      key: lastLine.replace('.', '').toUpperCase(),
      explanation: lines.slice(0, -1).join('\n').trim(),
    };
  }

  // Last resort: check if text ends with a standalone letter
  const lastWordMatch = text.match(/\s([A-E])\.?\s*$/i);
  if (lastWordMatch) {
    return {
      key: lastWordMatch[1].toUpperCase(),
      explanation: text.substring(0, lastWordMatch.index).trim(),
    };
  }

  // Could not extract key - return full text as explanation
  return {
    key: '',
    explanation: text,
  };
}

/**
 * Extracts only the answer key from text (simpler version for grading)
 * 
 * @param {string} text - Answer text
 * @returns {string} - Extracted key (A-E) or empty string
 */
export function extractAnswerKey(text) {
  const { key } = parseGeneratedAnswer(text);
  return key;
}

/**
 * Validates if a string is a valid answer key
 * 
 * @param {string} key - Potential answer key
 * @returns {boolean} - True if valid (A-E)
 */
export function isValidAnswerKey(key) {
  if (!key || typeof key !== 'string') return false;
  return /^[A-E]$/i.test(key.trim());
}

/**
 * Normalizes an answer key to uppercase
 * 
 * @param {string} key - Answer key
 * @returns {string} - Normalized uppercase key or empty string
 */
export function normalizeAnswerKey(key) {
  if (!isValidAnswerKey(key)) return '';
  return key.trim().toUpperCase();
}

/**
 * Compares student answer with correct answer for auto-grading
 * 
 * @param {string} studentAnswer - Student's answer (can be full text)
 * @param {string} correctAnswer - Correct answer (can be key or full text)
 * @returns {{ isCorrect: boolean, studentKey: string, correctKey: string }}
 */
export function compareAnswers(studentAnswer, correctAnswer) {
  const studentKey = extractAnswerKey(studentAnswer) || normalizeAnswerKey(studentAnswer);
  const correctKey = extractAnswerKey(correctAnswer) || normalizeAnswerKey(correctAnswer);

  return {
    isCorrect: studentKey !== '' && correctKey !== '' && studentKey === correctKey,
    studentKey,
    correctKey,
  };
}

export default {
  parseGeneratedAnswer,
  extractAnswerKey,
  isValidAnswerKey,
  normalizeAnswerKey,
  compareAnswers,
};
