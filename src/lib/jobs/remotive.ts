import type { JobListing, CandidateProfile } from "./types";

export async function fetchFromRemotive(
  profile: CandidateProfile
): Promise<JobListing[]> {
  const search = encodeURIComponent(profile.jobTitle);
  const res = await fetch(
    `https://remotive.com/api/remote-jobs?search=${search}&limit=10`
  );

  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`);

  const data = await res.json();
  if (!data.jobs?.length) throw new Error("Remotive returned no results");

  return data.jobs.slice(0, 10).map(
    (job: Record<string, unknown>): JobListing => ({
      id: `remotive-${job.id}`,
      title: (job.title as string) || "",
      company: (job.company_name as string) || "",
      location:
        (job.candidate_required_location as string) || "Remote (Worldwide)",
      salary: (job.salary as string) || "Not disclosed",
      match_score: 0,
      tags: ((job.tags as string[]) || []).slice(0, 5),
      description: ((job.description as string) || "")
        .replace(/<[^>]*>/g, "")
        .substring(0, 300),
      apply_url: (job.url as string) || "",
      source: "remotive",
      posted: job.publication_date
        ? new Date(job.publication_date as string).toLocaleDateString()
        : "",
    })
  );
}
