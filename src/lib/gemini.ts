const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_PRIMARY = "llama-3.3-70b-versatile";
const GROQ_FALLBACK = "llama-3.1-8b-instant";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGroq(model: string, prompt: string, json: boolean): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callGemini(prompt: string, json: boolean): Promise<string> {
  const url = `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      ...(json
        ? { generationConfig: { responseMimeType: "application/json" } }
        : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function geminiGenerate(
  prompt: string,
  options: { json?: boolean } = {}
): Promise<string> {
  const json = options.json ?? false;

  // 1. Try Groq primary model
  try {
    return await callGroq(GROQ_PRIMARY, prompt, json);
  } catch (groqPrimaryErr) {
    console.warn("Groq primary failed:", groqPrimaryErr);
  }

  // 2. Try Groq fallback model
  try {
    return await callGroq(GROQ_FALLBACK, prompt, json);
  } catch (groqFallbackErr) {
    console.warn("Groq fallback failed:", groqFallbackErr);
  }

  // 3. Fall back to Gemini
  return callGemini(prompt, json);
}
