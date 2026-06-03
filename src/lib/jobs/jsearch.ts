import type { JobListing, CandidateProfile } from "./types";

export async function fetchFromJSearch(
  profile: CandidateProfile
): Promise<JobListing[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY not set");

  const query = `${profile.jobTitle} ${profile.keywords.slice(0, 3).join(" ")}`;
  const res = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1&date_posted=month`,
    {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    }
  );

  if (!res.ok) throw new Error(`JSearch HTTP ${res.status}`);

  const data = await res.json();
  if (!data.data?.length) throw new Error("JSearch returned no results");

  return data.data.slice(0, 10).map(
    (job: Record<string, unknown>): JobListing => ({
      id: (job.job_id as string) || `jsearch-${Math.random()}`,
      title: (job.job_title as string) || "",
      company: (job.employer_name as string) || "",
      location: (job.job_city as string)
        ? `${job.job_city}, ${job.job_country}`
        : (job.job_country as string) || "Remote",
      salary:
        job.job_min_salary && job.job_max_salary
          ? `$${job.job_min_salary}–$${job.job_max_salary}`
          : "Not disclosed",
      match_score: 0,
      tags:
        (job.job_required_skills as string[]) ||
        ((job.job_highlights as Record<string, string[]>)
          ?.Qualifications as string[])?.slice(0, 5) ||
        [],
      description: ((job.job_description as string) || "").substring(0, 300),
      apply_url: (job.job_apply_link as string) || "",
      source: "jsearch",
      posted: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc as string).toLocaleDateString()
        : "",
    })
  );
}
