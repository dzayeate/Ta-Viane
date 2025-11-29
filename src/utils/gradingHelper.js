/**
 * Grading Utility Functions
 * Handles extraction of answer keys from various formats
 */

/**
 * Extract the correct answer key (A, B, C, D, E) from an answer text.
 * Supports various formats including verbose explanations.
 * 
 * @param {string} answerText - The raw answer text from the database
 * @returns {string|null} - The uppercase answer key (A-E) or null if not found
 * 
 * @example
 * extractAnswerKey("C") // => "C"
 * extractAnswerKey("Jawaban benar: A") // => "A"
 * extractAnswerKey("The correct answer is B because...") // => "B"
 * extractAnswerKey("Essay answer text...") // => null
 */
export const extractAnswerKey = (answerText) => {
  // Handle null/undefined
  if (!answerText) return null;
  
  // Convert to string and trim
  const text = String(answerText).trim();
  
  // Case 1: Direct single letter answer (A, B, C, D, E)
  if (/^[A-Ea-e]$/.test(text)) {
    return text.toUpperCase();
  }
  
  // Case 2: Single letter with period (A., B., etc.)
  if (/^[A-Ea-e]\.$/.test(text)) {
    return text.charAt(0).toUpperCase();
  }
  
  // Define regex patterns to search for answer keys
  const patterns = [
    // Indonesian patterns
    /Jawaban\s*(?:yang\s+)?benar\s*(?:adalah\s*)?:?\s*([A-Ea-e])/i,
    /Jawaban\s*:\s*([A-Ea-e])/i,
    /Kunci\s+jawaban\s*:?\s*([A-Ea-e])/i,
    /Pilihan\s+yang\s+tepat\s*:?\s*([A-Ea-e])/i,
    
    // English patterns
    /Correct\s+answer\s*(?:is\s*)?:?\s*([A-Ea-e])/i,
    /Answer\s*:\s*([A-Ea-e])/i,
    /The\s+answer\s+is\s*:?\s*([A-Ea-e])/i,
    /Key\s*:\s*([A-Ea-e])/i,
    
    // Generic patterns
    /\(([A-Ea-e])\)\s*(?:adalah\s+)?(?:jawaban\s+)?(?:yang\s+)?(?:benar|tepat|correct)/i,
    /(?:^|\s)([A-Ea-e])\s*(?:adalah\s+)?(?:jawaban\s+)?(?:yang\s+)?(?:benar|tepat|correct)/i,
    
    // Pattern at the end of text
    /(?:jawaban|answer|key)\s*[:=]\s*([A-Ea-e])\s*\.?\s*$/i,
    
    // Standalone letter after colon at end
    /:\s*([A-Ea-e])\s*\.?\s*$/i,
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }
  
  // Case 3: Check if text starts with answer pattern like "A. " or "A) "
  const startsWithPattern = /^([A-Ea-e])[\.\)]\s/;
  const startsMatch = text.match(startsWithPattern);
  if (startsMatch && startsMatch[1]) {
    return startsMatch[1].toUpperCase();
  }
  
  // No answer key found - likely an essay question
  return null;
};

/**
 * Compare student answer with correct answer key.
 * Handles various input formats and normalizes comparison.
 * 
 * @param {string} studentAnswer - The student's submitted answer
 * @param {string} correctAnswer - The correct answer (may be verbose)
 * @returns {boolean} - True if answers match
 */
export const compareAnswers = (studentAnswer, correctAnswer) => {
  if (!studentAnswer || !correctAnswer) return false;
  
  // Normalize student answer (extract key if needed)
  const studentKey = extractAnswerKey(studentAnswer) || String(studentAnswer).trim().toUpperCase();
  
  // Extract correct answer key from potentially verbose text
  const correctKey = extractAnswerKey(correctAnswer);
  
  // If we couldn't extract a key from correct answer, do exact comparison
  if (!correctKey) {
    // Fall back to case-insensitive string comparison
    return String(studentAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
  }
  
  // Compare normalized keys
  return studentKey === correctKey;
};

/**
 * Check if a question type is auto-gradable (multiple choice).
 * 
 * @param {string} type - The question type
 * @returns {boolean} - True if the question can be auto-graded
 */
export const isAutoGradable = (type) => {
  if (!type) return false;
  const t = type.toLowerCase();
  return (
    t === 'multiplechoice' ||
    t === 'multiple-choice' ||
    t === 'pg' ||
    t === 'pilihan ganda' ||
    t === 'pilihanganda'
  );
};
