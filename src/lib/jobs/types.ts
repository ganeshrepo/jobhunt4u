export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match_score: number;
  tags: string[];
  description: string;
  apply_url?: string;
  source: "jsearch" | "adzuna" | "remotive" | "gemini";
  posted?: string;
}

export interface CandidateProfile {
  jobTitle: string;
  keywords: string[];
  resumeText: string;
  summary: string;
}
