import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PRIMARY = "gemini-2.5-flash";
const FALLBACK = "gemini-1.5-flash";

function isOverloaded(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("503") || msg.includes("overloaded") || msg.includes("high demand");
}

export async function geminiGenerate(
  prompt: string,
  options: { json?: boolean } = {}
): Promise<string> {
  const config = options.json ? { responseMimeType: "application/json" } : undefined;

  async function run(modelName: string) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...(config ? { generationConfig: config } : {}),
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  try {
    return await run(PRIMARY);
  } catch (err) {
    if (isOverloaded(err)) return run(FALLBACK);
    throw err;
  }
}
