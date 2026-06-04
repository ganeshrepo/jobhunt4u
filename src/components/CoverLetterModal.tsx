"use client";

import { useState, useEffect } from "react";
import type { JobListing } from "@/lib/jobs/types";

interface Props {
  job: JobListing | null;
  onClose: () => void;
}

export default function CoverLetterModal({ job, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!job) { setCoverLetter(null); setError(null); return; }
    setLoading(true);
    setError(null);
    setCoverLetter(null);

    fetch("/api/cover-letter/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_title: job.title,
        company: job.company,
        description: job.description,
        tags: job.tags,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCoverLetter(data.cover_letter);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [job]);

  if (!job) return null;

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${job.company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="font-semibold text-white">AI Cover Letter</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {job.title} at {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-slate-400 text-sm">Writing your cover letter...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}
          {coverLetter && (
            <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
              {coverLetter}
            </pre>
          )}
        </div>

        {coverLetter && (
          <div className="flex gap-3 px-6 py-4 border-t border-slate-800">
            <button
              onClick={handleCopy}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy to Clipboard"}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Download .txt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
