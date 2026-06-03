import { fetchFromJSearch } from "./jsearch";
import { fetchFromAdzuna } from "./adzuna";
import { fetchFromRemotive } from "./remotive";
import { generateJobsWithGemini } from "./gemini-fallback";
import { scoreJobs } from "./scorer";
import type { JobListing, CandidateProfile } from "./types";

export type { JobListing, CandidateProfile };

const SOURCES = [
  { name: "JSearch", fn: fetchFromJSearch, envCheck: () => !!process.env.RAPIDAPI_KEY },
  { name: "Adzuna", fn: fetchFromAdzuna, envCheck: () => !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) },
  { name: "Remotive", fn: fetchFromRemotive, envCheck: () => true },
];

export async function getJobMatches(
  profile: CandidateProfile
): Promise<{ jobs: JobListing[]; source: string }> {
  let jobs: JobListing[] = [];
  let usedSource = "";

  for (const source of SOURCES) {
    if (!source.envCheck()) {
      console.log(`Skipping ${source.name} — credentials not set`);
      continue;
    }
    try {
      jobs = await source.fn(profile);
      if (jobs.length > 0) {
        usedSource = source.name;
        console.log(`Fetched ${jobs.length} jobs from ${source.name}`);
        break;
      }
    } catch (err) {
      console.log(
        `${source.name} failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  // Final fallback: Gemini AI
  if (jobs.length === 0) {
    console.log("All real APIs failed — using Gemini fallback");
    jobs = await generateJobsWithGemini(profile);
    usedSource = "Gemini AI";
  }

  // Score real jobs against resume (Gemini-generated jobs already have scores)
  if (usedSource !== "Gemini AI" && jobs.length > 0) {
    jobs = await scoreJobs(jobs, profile);
  }

  return { jobs, source: usedSource };
}
