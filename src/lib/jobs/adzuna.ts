import type { JobListing, CandidateProfile } from "./types";

export async function fetchFromAdzuna(
  profile: CandidateProfile
): Promise<JobListing[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) throw new Error("Adzuna credentials not set");

  const query = encodeURIComponent(profile.jobTitle);
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${query}&content-type=application/json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Adzuna HTTP ${res.status}`);

  const data = await res.json();
  if (!data.results?.length) throw new Error("Adzuna returned no results");

  return data.results.map(
    (job: Record<string, unknown>): JobListing => ({
      id: (job.id as string) || `adzuna-${Math.random()}`,
      title: (job.title as string) || "",
      company:
        (job.company as Record<string, string>)?.display_name || "Unknown",
      location:
        (job.location as Record<string, string>)?.display_name || "India",
      salary:
        job.salary_min && job.salary_max
          ? `₹${Math.round((job.salary_min as number) / 100000)}–${Math.round((job.salary_max as number) / 100000)} LPA`
          : "Not disclosed",
      match_score: 0,
      tags: (job.category as Record<string, string>)?.tag
        ? [(job.category as Record<string, string>).tag]
        : [],
      description: ((job.description as string) || "").substring(0, 300),
      apply_url: (job.redirect_url as string) || "",
      source: "adzuna",
      posted: job.created
        ? new Date(job.created as string).toLocaleDateString()
        : "",
    })
  );
}
