import { fineTuneDetailId, fineTuneDetailEn, fineTuneListId, fineTuneListEn } from "@/utils/fine-tune";
import { systemPromptDetailId, systemPromptDetailEn, systemPromptListId, systemPromptListEn } from "@/utils/system-prompt";

require('dotenv').config();

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function callGemini(messages) {
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

export function generatePrompt(data) {
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
