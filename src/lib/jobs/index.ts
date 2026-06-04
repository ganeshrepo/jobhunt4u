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
  // Fetch from all available sources simultaneously
  const settled = await Promise.allSettled(
    SOURCES.filter((s) => s.envCheck()).map((s) =>
      s.fn(profile).then((jobs) => ({ name: s.name, jobs }))
    )
  );

  const successful = settled
    .filter((r): r is PromiseFulfilledResult<{ name: string; jobs: JobListing[] }> =>
      r.status === "fulfilled" && r.value.jobs.length > 0
    )
    .map((r) => r.value);

  settled
    .filter((r) => r.status === "rejected")
    .forEach((r) => console.log("Source failed:", (r as PromiseRejectedResult).reason?.message));

  let allJobs = successful.flatMap((s) => s.jobs);

  // Gemini fallback only if every real source failed
  if (allJobs.length === 0) {
    console.log("All real APIs failed — using Gemini fallback");
    const geminiJobs = await generateJobsWithGemini(profile);
    return { jobs: geminiJobs, source: "Gemini AI" };
  }

  // Deduplicate by normalised title+company
  const seen = new Set<string>();
  allJobs = allJobs.filter((job) => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Score all jobs against the resume (cap at 20 to keep Gemini cost low)
  allJobs = await scoreJobs(allJobs.slice(0, 20), profile);

  const sourceNames = successful.map((s) => s.name);
  const sourceLabel = sourceNames.length > 1 ? "Multiple" : sourceNames[0] ?? "Unknown";

  return { jobs: allJobs, source: sourceLabel };
}
