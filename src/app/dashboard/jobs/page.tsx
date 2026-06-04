"use client";

import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import ResumeRewriteModal from "@/components/ResumeRewriteModal";
import CoverLetterModal from "@/components/CoverLetterModal";
import type { JobListing } from "@/lib/jobs/types";

const SOURCE_BADGES: Record<string, string> = {
  JSearch: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Adzuna: "bg-green-500/20 text-green-300 border-green-500/30",
  Remotive: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Gemini AI": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Multiple: "bg-gradient-to-r from-blue-500/20 to-green-500/20 text-blue-300 border-blue-500/30",
};

const JOB_SOURCE_BADGES: Record<string, string> = {
  jsearch: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  adzuna: "bg-green-500/20 text-green-300 border-green-500/30",
  remotive: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  gemini: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [rewriteJob, setRewriteJob] = useState<JobListing | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<JobListing | null>(null);

  // Save state: job_id -> saved_jobs row id
  const [savedJobIds, setSavedJobIds] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("All");

  const loadJobs = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/jobs/match")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setAllJobs(data.jobs || []);
        setSource(data.source || "");
      })
      .catch(() => setError("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  // Load saved job IDs on mount
  useEffect(() => {
    fetch("/api/jobs/saved")
      .then((r) => r.json())
      .then((data: Array<{ id: string; job_id: string }>) => {
        if (Array.isArray(data)) {
          const map = new Map<string, string>();
          data.forEach((row) => map.set(row.job_id, row.id));
          setSavedJobIds(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleApply = async (job: JobListing) => {
    setApplying(job.id);
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
    setApplied((prev) => new Set(prev).add(job.id));
    setApplying(null);
  };

  const handleToggleSave = async (job: JobListing) => {
    setSaving(job.id);
    const alreadySavedRowId = savedJobIds.get(job.id);
    if (alreadySavedRowId) {
      // Unsave
      await fetch(`/api/jobs/saved?id=${alreadySavedRowId}`, { method: "DELETE" });
      setSavedJobIds((prev) => {
        const next = new Map(prev);
        next.delete(job.id);
        return next;
      });
    } else {
      // Save
      const res = await fetch("/api/jobs/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          description: job.description,
          tags: job.tags,
          apply_url: job.apply_url,
          source: job.source,
          match_score: job.match_score,
        }),
      });
      const saved = await res.json();
      if (saved?.id) {
        setSavedJobIds((prev) => new Map(prev).set(job.id, saved.id));
      }
    }
    setSaving(null);
  };

  const availableSources = ["All", ...Array.from(new Set(allJobs.map((j) => j.source)))];

  const filteredJobs = allJobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) &&
        !job.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (remoteOnly && !job.location.toLowerCase().includes("remote")) return false;
    if (sourceFilter !== "All" && job.source !== sourceFilter) return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Topbar title="Job Matches" />
        <div className="flex-1 p-8">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <input
              type="text"
              placeholder="Search role or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
            />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {availableSources.map((s) => (
                <option key={s} className="bg-slate-800">{s}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded"
              />
              Remote only
            </label>
            <button
              onClick={loadJobs}
              disabled={loading}
              className="ml-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-slate-400 text-sm">Finding your best job matches from all sources...</p>
            </div>
          )}

          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl p-6 text-center">
              <p className="font-medium mb-1">{error}</p>
              <p className="text-sm opacity-80">Upload your resume and set your target role in Settings first.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">
                  {filteredJobs.length} of {allJobs.length} jobs matched
                </p>
                {source && (
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${SOURCE_BADGES[source] || "bg-slate-700 text-slate-400 border-slate-600"}`}>
                    Source: {source}
                  </span>
                )}
              </div>

              {filteredJobs.map((job) => {
                const isApplied = applied.has(job.id);
                const isSaved = savedJobIds.has(job.id);
                const isSaving = saving === job.id;
                return (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${JOB_SOURCE_BADGES[job.source] || "bg-slate-700 text-slate-400 border-slate-600"}`}>
                            {job.source}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {job.company} · {job.location} · {job.salary}
                          {job.posted && <span className="text-slate-600"> · {job.posted}</span>}
                        </p>
                        <p className="text-slate-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {job.tags.slice(0, 5).map((tag) => (
                            <span key={tag} className="px-2.5 py-0.5 bg-slate-800 rounded-full text-xs text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0 min-w-[130px] sm:self-start self-stretch">
                        <div className="flex items-center gap-2 w-full justify-end">
                          <span className="text-2xl font-bold text-blue-400">{job.match_score}%</span>
                          <button
                            onClick={() => handleToggleSave(job)}
                            disabled={isSaving}
                            title={isSaved ? "Unsave job" : "Save job"}
                            className={`text-xl transition-colors disabled:opacity-50 ${isSaved ? "text-yellow-400 hover:text-yellow-300" : "text-slate-600 hover:text-yellow-400"}`}
                          >
                            {isSaved ? "★" : "☆"}
                          </button>
                        </div>

                        <button
                          onClick={() => setRewriteJob(job)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          ✨ Rewrite Resume
                        </button>

                        <button
                          onClick={() => setCoverLetterJob(job)}
                          className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          📝 Cover Letter
                        </button>

                        {job.apply_url ? (
                          <a
                            href={job.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => !isApplied && handleApply(job)}
                            className={`w-full text-center px-4 py-2 rounded-xl text-sm transition-colors ${isApplied ? "bg-green-600/20 text-green-400 border border-green-600/30" : "bg-slate-700 hover:bg-slate-600 text-slate-300"}`}
                          >
                            {isApplied ? "✓ Tracked" : "Apply →"}
                          </a>
                        ) : (
                          <button
                            onClick={() => !isApplied && handleApply(job)}
                            disabled={applying === job.id || isApplied}
                            className={`w-full px-4 py-2 rounded-xl text-sm transition-colors ${isApplied ? "bg-green-600/20 text-green-400 border border-green-600/30" : "bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50"}`}
                          >
                            {isApplied ? "✓ Applied" : applying === job.id ? "Saving..." : "Quick Apply"}
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

      <ResumeRewriteModal job={rewriteJob} onClose={() => setRewriteJob(null)} />
      <CoverLetterModal job={coverLetterJob} onClose={() => setCoverLetterJob(null)} />
    </>
  );
}
