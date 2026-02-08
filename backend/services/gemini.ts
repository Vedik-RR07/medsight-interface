import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenerativeAI(key);
  }
  return client;
}

/** Call Gemini with a prompt that must return valid JSON. Returns parsed object or null. */
export async function generateJson<T = object>(
  systemPrompt: string,
  userPrompt: string,
  model = "gemini-2.5-flash-lite"
): Promise<T | null> {
  const gen = getClient().getGenerativeModel({ model });
  const fullPrompt = `${systemPrompt}\n\nRespond with only valid JSON, no markdown or extra text.\n\n${userPrompt}`;
  const result = await gen.generateContent(fullPrompt);
  const text = result.response.text();
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

/** Plain text generation when JSON is not required. */
export async function generateText(prompt: string, model = "gemini-2.5-flash-lite"): Promise<string> {
  const gen = getClient().getGenerativeModel({ model });
  const result = await gen.generateContent(prompt);
  return result.response.text() ?? "";
}
