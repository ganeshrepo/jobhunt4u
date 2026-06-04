"use client";

import { useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  async function handleProfileSave() {
    if (!targetRole.trim()) {
      setProfileError("Please enter your target role.");
      return;
    }
    setProfileError("");
    setSavingProfile(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole.trim(),
          preferred_location: preferredLocation.trim() || null,
          expected_salary: expectedSalary.trim() || null,
        }),
      });
      setStep(3);
    } catch {
      setProfileError("Failed to save. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState("uploading");
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        setUploadState("error");
        return;
      }
      setAtsScore(data.analysis?.ats_score ?? null);
      setUploadState("done");
    } catch {
      setUploadError("Upload failed. Please try again.");
      setUploadState("error");
    }
  }

  async function markDone() {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding_completed: true }),
    });
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-10 transition-colors ${
                    step > s ? "bg-blue-600" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-3">
              Welcome to JobHunt4U!
            </h1>
            <p className="text-slate-400 mb-10 text-base leading-relaxed">
              Your AI career copilot.{" "}
              <span className="text-blue-400 font-medium">
                Let&apos;s get you set up in 2 minutes.
              </span>
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: "📄", label: "Upload Resume" },
                { icon: "🎯", label: "Get Job Matches" },
                { icon: "✉️", label: "Apply with AI" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <span className="text-slate-300 text-xs font-medium text-center">
                    {item.label}
                  </span>
                  {i < 2 && (
                    <span className="hidden sm:block absolute text-blue-400 text-lg mt-4">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
            >
              Get Started →
            </button>
          </div>
        )}

        {/* Step 2 — Target Role */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              What role are you targeting?
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              This helps us match you with the most relevant jobs and tailor your AI features.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Target Role <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Preferred Location{" "}
                  <span className="text-slate-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Remote, Bangalore"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Expected Salary{" "}
                  <span className="text-slate-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. $120,000 / year or ₹25 LPA"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {profileError && (
              <p className="text-red-400 text-sm mb-4">{profileError}</p>
            )}

            <button
              onClick={handleProfileSave}
              disabled={savingProfile}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-base transition-colors"
            >
              {savingProfile ? "Saving..." : "Continue →"}
            </button>
          </div>
        )}

        {/* Step 3 — Resume Upload */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Upload your resume
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Upload your resume to unlock AI features — ATS scoring, job matching, and cover letter generation.
            </p>

            {uploadState === "idle" || uploadState === "error" ? (
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-10 text-center transition-colors group">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-slate-300 font-medium group-hover:text-blue-400 transition-colors">
                    Click to upload PDF or DOCX
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Max 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </label>
            ) : uploadState === "uploading" ? (
              <div className="border-2 border-blue-500/30 rounded-xl p-10 text-center bg-blue-500/5">
                <div className="flex items-center justify-center gap-3 text-blue-400">
                  <svg
                    className="animate-spin h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="font-medium">Analysing your resume with AI...</span>
                </div>
                <p className="text-slate-500 text-xs mt-3">This usually takes 10–20 seconds</p>
              </div>
            ) : (
              <div className="border-2 border-green-500/30 rounded-xl p-8 text-center bg-green-500/5">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-400 font-semibold text-lg mb-2">
                  Resume uploaded successfully!
                </p>
                {atsScore !== null && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full">
                    <span className="text-slate-400 text-sm">ATS Score:</span>
                    <span
                      className={`font-bold text-lg ${
                        atsScore >= 70
                          ? "text-green-400"
                          : atsScore >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {atsScore}/100
                    </span>
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-red-400 text-sm mt-3">{uploadError}</p>
            )}

            <div className="mt-6 space-y-3">
              {uploadState === "done" ? (
                <button
                  onClick={markDone}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-base transition-colors"
                >
                  All set! Go to Dashboard →
                </button>
              ) : (
                <button
                  onClick={markDone}
                  className="w-full text-slate-400 hover:text-slate-200 py-2 text-sm transition-colors"
                >
                  I&apos;ll do this later
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
