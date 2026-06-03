import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobListing, CandidateProfile } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateJobsWithGemini(
  profile: CandidateProfile
): Promise<JobListing[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Generate 5 realistic job opportunities for this candidate in India.

Candidate:
- Target role: ${profile.jobTitle}
- Skills: ${profile.keywords.join(", ")}
- Summary: ${profile.summary}

Return ONLY valid JSON:
{"jobs": [
  {
    "title": "job title",
    "company": "real Indian company name",
    "location": "city or Remote",
    "salary": "₹X-Y LPA",
    "match_score": 85,
    "tags": ["skill1", "skill2"],
    "description": "2-sentence description",
    "apply_url": "",
    "posted": "Today"
  }
]}`;

  const result = await model.generateContent(prompt);
  const data = JSON.parse(result.response.text());
  return (data.jobs || []).map((j: JobListing) => ({ ...j, source: "gemini" as const }));
}
