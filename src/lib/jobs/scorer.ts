import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobListing, CandidateProfile } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function scoreJobs(
  jobs: JobListing[],
  profile: CandidateProfile
): Promise<JobListing[]> {
  if (!jobs.length) return jobs;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const jobSummaries = jobs
    .map(
      (j, i) =>
        `${i}. ${j.title} at ${j.company} (${j.location})\n   Skills: ${j.tags.join(", ")}\n   ${j.description.substring(0, 150)}`
    )
    .join("\n\n");

  const prompt = `Score each job (0-100) based on how well it matches this candidate's profile.

Candidate:
- Target role: ${profile.jobTitle}
- Skills: ${profile.keywords.slice(0, 15).join(", ")}
- Summary: ${profile.summary}

Jobs:
${jobSummaries}

Return ONLY valid JSON array:
[{"index": 0, "score": 85}, {"index": 1, "score": 72}, ...]`;

  try {
    const result = await model.generateContent(prompt);
    const scores: { index: number; score: number }[] = JSON.parse(
      result.response.text()
    );
    return jobs
      .map((job, i) => ({
        ...job,
        match_score: scores.find((s) => s.index === i)?.score ?? 60,
      }))
      .sort((a, b) => b.match_score - a.match_score);
  } catch {
    return jobs.map((job) => ({ ...job, match_score: 70 }));
  }
}
