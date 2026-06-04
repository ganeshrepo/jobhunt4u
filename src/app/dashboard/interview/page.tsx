"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";

interface Application {
  id: string;
  job_title: string;
  company: string;
  status: string;
  applied_date: string;
}

interface Question {
  type: string;
  question: string;
  answer: string;
}

interface ManualJob {
  job_title: string;
  company: string;
  description: string;
}

const TYPE_COLORS: Record<string, string> = {
  Behavioral: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Technical: "bg-green-500/20 text-green-300 border-green-500/30",
  Situational: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Cultural: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function InterviewPrepPage() {
  const [tab, setTab] = useState<"applications" | "manual">("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [manualJob, setManualJob] = useState<ManualJob>({ job_title: "", company: "", description: "" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((data) => setApplications(Array.isArray(data) ? data.slice(0, 8) : []));
  }, []);

  const generate = async (job: { job_title: string; company: string; description?: string }) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setExpanded(null);

    try {
      const res = await fetch("/api/interview/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: job.job_title,
          company: job.company,
          description: job.description || "",
          tags: [],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAppSelect = (app: Application) => {
    setSelectedApp(app);
    generate({ job_title: app.job_title, company: app.company });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate(manualJob);
  };

  const activeJob = selectedApp
    ? `${selectedApp.job_title} @ ${selectedApp.company}`
    : manualJob.job_title
      ? `${manualJob.job_title} @ ${manualJob.company}`
      : null;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Interview Prep" />
      <div className="flex-1 p-8 max-w-4xl">
        {questions.length === 0 && !loading ? (
          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => { setTab("applications"); setSelectedApp(null); }}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${tab === "applications" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                From My Applications
              </button>
              <button
                onClick={() => { setTab("manual"); setSelectedApp(null); }}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${tab === "manual" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
              >
                Enter Job Details
              </button>
            </div>

            {tab === "applications" && (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">Select a job you applied to:</p>
                {applications.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No applications yet — add them in the Tracker first.</p>
                ) : (
                  applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleAppSelect(app)}
                      className="w-full text-left bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-colors"
                    >
                      <p className="font-medium text-white">{app.job_title}</p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {app.company} · Applied {app.applied_date}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}

            {tab === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Job Title *</label>
                    <input
                      required
                      value={manualJob.job_title}
                      onChange={(e) => setManualJob((p) => ({ ...p, job_title: e.target.value }))}
                      placeholder="e.g. Senior React Developer"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Company *</label>
                    <input
                      required
                      value={manualJob.company}
                      onChange={(e) => setManualJob((p) => ({ ...p, company: e.target.value }))}
                      placeholder="e.g. Google"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Job Description (optional — improves accuracy)</label>
                  <textarea
                    rows={4}
                    value={manualJob.description}
                    onChange={(e) => setManualJob((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Paste the job description here..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Generate Interview Prep →
                </button>
              </form>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-slate-400 text-sm">Generating 10 tailored interview questions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">{activeJob}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{questions.length} questions ready — click each to reveal the answer</p>
              </div>
              <button
                onClick={() => { setQuestions([]); setSelectedApp(null); setManualJob({ job_title: "", company: "", description: "" }); }}
                className="text-blue-400 hover:underline text-sm"
              >
                ← New Prep
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">{error}</div>
            )}

            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full text-left p-5 flex items-start gap-4"
                >
                  <span className="text-slate-500 font-mono text-sm shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[q.type] || "bg-slate-700 text-slate-400 border-slate-600"}`}>
                        {q.type}
                      </span>
                    </div>
                    <p className="font-medium text-white text-sm">{q.question}</p>
                  </div>
                  <span className="text-slate-500 text-sm shrink-0">
                    {expanded === i ? "▲" : "▼"}
                  </span>
                </button>

                {expanded === i && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Suggested Answer</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{q.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
