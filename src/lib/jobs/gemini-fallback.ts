import { geminiGenerate } from "@/lib/gemini";
import type { JobListing, CandidateProfile } from "./types";

export async function generateJobsWithGemini(
  profile: CandidateProfile
): Promise<JobListing[]> {
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

  const text = await geminiGenerate(prompt, { json: true });
  const data = JSON.parse(text);
  return (data.jobs || []).map((j: JobListing) => ({ ...j, source: "ai" as const }));
}
