"use client";

import { useState, useRef } from "react";
import Topbar from "@/components/Topbar";
import ATSCard from "@/components/ATSCard";

interface Analysis {
  ats_score: number;
  keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  summary: string;
}

export default function ResumePage() {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAnalysis(data.analysis);
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
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
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
                <h2 className="text-xl font-semibold text-white">
                  Analysis Complete
                </h2>
                <p className="text-slate-400 text-sm">{fileName}</p>
              </div>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFileName(null);
                }}
                className="text-blue-400 hover:underline text-sm"
              >
                Upload new resume
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ATSCard score={analysis.ats_score} />
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-2">Summary</h3>
                <p className="text-slate-400 text-sm mb-5">{analysis.summary}</p>

                <h3 className="font-semibold text-white mb-3">
                  Keywords Found
                </h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {analysis.keywords.map((k) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs"
                    >
                      {k}
                    </span>
                  ))}
                </div>

                <h3 className="font-semibold text-white mb-3">
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.map((k) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">
                AI Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-blue-400 font-bold shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-slate-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
