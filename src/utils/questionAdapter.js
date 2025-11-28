/**
 * Normalizes a question object to ensure a standard structure for the UI.
 * Handles legacy data where options might be embedded in the description.
 * 
 * @param {Object} question - The raw question object from the backend/storage.
 * @returns {Object} - The normalized question object with structured content and options.
 */
export const normalizeQuestion = (question) => {
  if (!question) return null;

  // Clone to avoid mutating original
  const normalized = { ...question };

  // Check if it's a multiple choice question but missing structured options
  // or if the type implies multiple choice but options are empty
  const isMultipleChoice = normalized.type === 'multipleChoice' || 
                           (normalized.description && normalized.description.match(/[A-E]\./));

  if (isMultipleChoice && (!normalized.options || normalized.options.length === 0)) {
    const { content, options } = parseLegacyDescription(normalized.description || '');
    
    // Only apply if we successfully extracted options
    if (options.length > 0) {
      normalized.content = content; // The question text without options
      normalized.options = options; // The structured options array
      
      // If the original description was just the combined text, we might want to keep it 
      // or update it. For UI consistency, we usually render 'content' + 'options'.
      // Let's keep 'description' as is for fallback, but UI should prefer 'content' if available.
    } else {
      // Fallback if parsing failed but it's supposed to be MC
      normalized.content = normalized.description;
      normalized.options = [];
    }
  } else {
    // For essay or already structured questions
    normalized.content = normalized.description;
  }

  return normalized;
};

/**
 * Parses a description string to separate question text from options.
 * Supports formats like:
 * "Question text...\n\nA. Option 1\nB. Option 2..."
 * 
 * @param {string} text 
 * @returns {Object} { content: string, options: Array }
 */
const parseLegacyDescription = (text) => {
  if (!text) return { content: '', options: [] };

  // Regex to identify the start of options (e.g., "A. ", "A) ", "a. ")
  // We look for a newline followed by A. or A) to be safe
  const optionRegex = /\n\s*([A-E])[\.\)]\s+(.*?)(?=(\n\s*[A-E][\.\)]\s+|$))/gs;
  
  const options = [];
  let match;
  let firstOptionIndex = -1;

  // Find all matches
  while ((match = optionRegex.exec(text)) !== null) {
    if (firstOptionIndex === -1) {
      firstOptionIndex = match.index;
    }
    options.push({
      label: match[1].toUpperCase(),
      text: match[2].trim()
    });
  }

  // If options found, extract content (everything before the first option)
  let content = text;
  if (firstOptionIndex !== -1) {
    content = text.substring(0, firstOptionIndex).trim();
  }

  return { content, options };
};
