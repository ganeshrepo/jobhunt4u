"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import ResumeRewriteModal from "@/components/ResumeRewriteModal";
import type { JobListing } from "@/lib/jobs/types";

const SOURCE_BADGES: Record<string, string> = {
  JSearch: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Adzuna: "bg-green-500/20 text-green-300 border-green-500/30",
  Remotive: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Gemini AI": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [rewriteJob, setRewriteJob] = useState<JobListing | null>(null);

  useEffect(() => {
    fetch("/api/jobs/match")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setJobs(data.jobs || []);
        setSource(data.source || "");
      })
      .catch(() => setError("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (job: JobListing) => {
    const key = job.id;
    setApplying(key);
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        status: "Applied",
        applied_date: new Date().toISOString().split("T")[0],
        job_url: job.apply_url,
      }),
    });
    setApplied((prev) => new Set(prev).add(key));
    setApplying(null);
  };

  return (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Topbar title="Job Matches" />
        <div className="flex-1 p-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-slate-400 text-sm">Finding your best job matches...</p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl p-6 text-center">
              <p className="font-medium mb-1">{error}</p>
              <p className="text-sm opacity-80">
                Upload your resume and set your target role in Settings first.
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                  {jobs.length} jobs matched to your profile
                </p>
                {source && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full border font-medium ${SOURCE_BADGES[source] || "bg-slate-700 text-slate-400 border-slate-600"}`}
                  >
                    Source: {source}
                  </span>
                )}
              </div>

              {jobs.map((job) => {
                const isApplied = applied.has(job.id);
                return (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-lg">
                            {job.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${SOURCE_BADGES[job.source] || "bg-slate-700 text-slate-400 border-slate-600"}`}
                          >
                            {job.source}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {job.company} · {job.location} · {job.salary}
                          {job.posted && (
                            <span className="text-slate-600"> · {job.posted}</span>
                          )}
                        </p>
                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {job.tags.slice(0, 5).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 bg-slate-800 rounded-full text-xs text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-2xl font-bold text-blue-400">
                          {job.match_score}%
                        </span>

                        <button
                          onClick={() => setRewriteJob(job)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          ✨ Rewrite & Apply
                        </button>

                        {job.apply_url ? (
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => !isApplied && handleApply(job)}
                            className={`w-full text-center px-4 py-2 rounded-xl text-sm transition-colors ${
                              isApplied
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                            }`}
                          >
                            {isApplied ? "✓ Tracked" : "Apply →"}
                          </a>
                        ) : (
                          <button
                            onClick={() => !isApplied && handleApply(job)}
                            disabled={applying === job.id || isApplied}
                            className={`w-full px-4 py-2 rounded-xl text-sm transition-colors ${
                              isApplied
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : "bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50"
                            }`}
                          >
                            {isApplied
                              ? "✓ Applied"
                              : applying === job.id
                                ? "Saving..."
                                : "Quick Apply"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ResumeRewriteModal
        job={rewriteJob}
        onClose={() => setRewriteJob(null)}
      />
    </>
  );
}
