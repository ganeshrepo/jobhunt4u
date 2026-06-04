"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";

interface SavedJob {
  id: string;
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  tags: string[];
  apply_url: string;
  source: string;
  match_score: number;
  saved_at: string;
}

const JOB_SOURCE_BADGES: Record<string, string> = {
  jsearch: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  adzuna: "bg-green-500/20 text-green-300 border-green-500/30",
  remotive: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  gemini: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsaving, setUnsaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSavedJobs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (job: SavedJob) => {
    setUnsaving(job.id);
    await fetch(`/api/jobs/saved?id=${job.id}`, { method: "DELETE" });
    setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    setUnsaving(null);
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Saved Jobs" />
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-slate-400 text-sm">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-5xl">★</span>
            <h2 className="text-white font-semibold text-lg">No saved jobs yet</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Browse Job Matches and save roles you like using the bookmark button.
            </p>
            <a
              href="/dashboard/jobs"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Browse Job Matches →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">{savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}</p>
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                      {job.source && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${JOB_SOURCE_BADGES[job.source] || "bg-slate-700 text-slate-400 border-slate-600"}`}>
                          {job.source}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {job.company}
                      {job.location && ` · ${job.location}`}
                      {job.salary && ` · ${job.salary}`}
                    </p>
                    {job.description && (
                      <p className="text-slate-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                    )}
                    {Array.isArray(job.tags) && job.tags.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {job.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="px-2.5 py-0.5 bg-slate-800 rounded-full text-xs text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-600 text-xs mt-3">
                      Saved on {formatDate(job.saved_at)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 min-w-[130px]">
                    {job.match_score > 0 && (
                      <span className="text-2xl font-bold text-blue-400">{job.match_score}%</span>
                    )}

                    {job.apply_url ? (
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        Apply →
                      </a>
                    ) : null}

                    <button
                      onClick={() => handleUnsave(job)}
                      disabled={unsaving === job.id}
                      className="w-full px-4 py-2 rounded-xl text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 transition-colors disabled:opacity-50"
                    >
                      {unsaving === job.id ? "Removing..." : "✕ Unsave"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
