"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import ATSCard from "@/components/ATSCard";
import { createClient } from "@/lib/supabase/client";

interface Analysis {
  ats_score: number;
  keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  summary: string;
}

interface SkillGap {
  role: string;
  have: string[];
  missing: { skill: string; priority: string; resource: string }[];
  market_demand: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-500/10 border-red-500/30 text-red-400",
  Medium: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  Low: "bg-slate-700 border-slate-600 text-slate-400",
};

export default function ResumePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchingExisting, setFetchingExisting] = useState(true);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [loadingSkillGap, setLoadingSkillGap] = useState(false);
  const [skillGapError, setSkillGapError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ ats_score: number; file_name: string; created_at: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load existing resume from DB on mount so analysis persists across navigation
  useEffect(() => {
    const loadExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFetchingExisting(false); return; }

      const { data } = await supabase
        .from("resumes")
        .select("file_name, ats_score, keywords, missing_keywords, suggestions, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setFileName(data.file_name);
        setAnalysis({
          ats_score: data.ats_score ?? 0,
          keywords: (data.keywords as string[]) || [],
          missing_keywords: (data.missing_keywords as string[]) || [],
          suggestions: (data.suggestions as string[]) || [],
          summary: data.summary || "",
        });
      }

      // Fetch all resumes for score history
      const { data: histData } = await supabase
        .from("resumes")
        .select("ats_score, file_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (histData) setHistory(histData);

      setFetchingExisting(false);
    };
    loadExisting();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);
    setSkillGap(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAnalysis(data.analysis);
      setFileName(file.name);
      setHistory(prev => [{
        ats_score: data.analysis.ats_score,
        file_name: file.name,
        created_at: new Date().toISOString()
      }, ...prev]);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const analyzeSkillGap = async () => {
    setLoadingSkillGap(true);
    setSkillGapError(null);
    try {
      const res = await fetch("/api/resume/skill-gap");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSkillGap(data);
    } catch (err: unknown) {
      setSkillGapError(err instanceof Error ? err.message : "Skill gap analysis failed");
    } finally {
      setLoadingSkillGap(false);
    }
  };

  if (fetchingExisting) {
    return (
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Topbar title="Resume Studio" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Resume Studio" />
      <div className="flex-1 p-8">
        {!analysis ? (
          <div className="max-w-2xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !uploading && fileRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-2xl p-16 text-center transition-colors cursor-pointer"
            >
              <div className="text-5xl mb-4">{uploading ? "⏳" : "📄"}</div>
              <h2 className="text-xl font-semibold mb-2 text-white">
                {uploading ? "Analyzing your resume..." : "Upload Your Resume"}
              </h2>
              <p className="text-slate-400 mb-6 text-sm">
                {uploading
                  ? `Processing ${fileName} with AI — this takes ~10 seconds`
                  : "PDF or DOCX · Max 5MB · AI scores and parses instantly"}
              </p>
              {uploading ? (
                <div className="flex justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors">
                  Choose File
                </button>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
            </div>
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Analysis Complete</h2>
                <p className="text-slate-400 text-sm">{fileName}</p>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-blue-400 hover:underline text-sm disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload new resume"}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ATSCard score={analysis.ats_score} />
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-2">Summary</h3>
                <p className="text-slate-400 text-sm mb-5">{analysis.summary}</p>

                <h3 className="font-semibold text-white mb-3">Keywords Found</h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {analysis.keywords.map((k) => (
                    <span key={k} className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs">
                      {k}
                    </span>
                  ))}
                </div>

                <h3 className="font-semibold text-white mb-3">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.map((k) => (
                    <span key={k} className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">AI Improvement Suggestions</h3>
              <div className="space-y-3">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                    <span className="text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">Skill Gap Analysis</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare your skills against market demand for your target role
                  </p>
                </div>
                {!skillGap && (
                  <button
                    onClick={analyzeSkillGap}
                    disabled={loadingSkillGap}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
                  >
                    {loadingSkillGap ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Gap →"
                    )}
                  </button>
                )}
              </div>

              {skillGapError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4">
                  {skillGapError}
                </div>
              )}

              {skillGap && (
                <div className="space-y-5">
                  <p className="text-sm text-slate-400 italic">{skillGap.market_demand}</p>

                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">
                      ✓ Skills You Have ({skillGap.have.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillGap.have.map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-3">
                      Skills to Add ({skillGap.missing.length})
                    </h4>
                    <div className="space-y-2">
                      {skillGap.missing.map((item) => (
                        <div key={item.skill} className="flex items-center gap-3 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low}`}>
                            {item.priority}
                          </span>
                          <span className="text-white font-medium">{item.skill}</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-blue-400 text-xs">{item.resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSkillGap(null)}
                    className="text-slate-500 hover:text-slate-400 text-xs"
                  >
                    Clear analysis
                  </button>
                </div>
              )}
            </div>

            {/* Score History */}
            {history.length > 1 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-1">Score History</h3>
                <p className="text-xs text-slate-500 mb-5">{history.length} resume versions uploaded</p>
                <div className="space-y-3">
                  {history.map((h, i) => {
                    const prev = history[i + 1];
                    const diff = prev ? h.ats_score - prev.ats_score : null;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ background: `conic-gradient(#3b82f6 ${h.ats_score * 3.6}deg, #1e293b 0deg)` }}>
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                            <span className="text-blue-400 text-xs font-bold">{h.ats_score}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{h.file_name}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        {diff !== null && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            diff > 0 ? "bg-green-500/10 text-green-400" :
                            diff < 0 ? "bg-red-500/10 text-red-400" :
                            "bg-slate-700 text-slate-400"
                          }`}>
                            {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "—"}
                          </span>
                        )}
                        {i === 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-medium shrink-0">Latest</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
