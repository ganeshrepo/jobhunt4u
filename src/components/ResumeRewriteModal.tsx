"use client";

import { useEffect, useState } from "react";

interface RewrittenResume {
  name: string;
  contact: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }[];
  skills: string[];
  education: { degree: string; institution: string; year: string }[];
  certifications?: string[];
}

interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  match_score: number;
  tags: string[];
  description: string;
}

export default function ResumeRewriteModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<RewrittenResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!job) return;
    setResume(null);
    setError(null);
    setApplied(false);
    setLoading(true);

    fetch("/api/resume/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResume(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [job]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
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
        notes: "Applied with AI-optimized resume",
      }),
    });
    setApplying(false);
    setApplied(true);
  };

  const downloadPDF = () => {
    if (!resume) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `<!DOCTYPE html><html>
<head>
  <title>${resume.name} — Resume</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; max-width: 780px; margin: 0 auto; padding: 40px; color: #111; font-size: 13px; line-height: 1.6; }
    h1 { font-size: 24px; font-weight: 700; }
    .contact { color: #555; font-size: 12px; margin: 4px 0 20px; }
    h2 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; border-bottom: 1px solid #dbeafe; padding-bottom: 3px; margin: 18px 0 8px; }
    .summary { color: #333; }
    .exp-header { display: flex; justify-content: space-between; }
    .exp-title { font-weight: 600; font-size: 14px; }
    .exp-company { color: #2563eb; font-size: 12px; margin-bottom: 4px; }
    .exp-duration { font-size: 11px; color: #777; }
    ul { padding-left: 16px; margin: 4px 0 10px; }
    li { margin-bottom: 3px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 2px 10px; border-radius: 20px; font-size: 11px; }
    .edu-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${resume.name}</h1>
  <div class="contact">${resume.contact}</div>

  <h2>Professional Summary</h2>
  <p class="summary">${resume.summary}</p>

  <h2>Work Experience</h2>
  ${resume.experience
    .map(
      (exp) => `
    <div style="margin-bottom:14px">
      <div class="exp-header">
        <span class="exp-title">${exp.title}</span>
        <span class="exp-duration">${exp.duration}</span>
      </div>
      <div class="exp-company">${exp.company}</div>
      <ul>${exp.achievements.map((a) => `<li>${a}</li>`).join("")}</ul>
    </div>`
    )
    .join("")}

  <h2>Skills</h2>
  <div class="skills">${resume.skills.map((s) => `<span class="skill">${s}</span>`).join("")}</div>

  <h2>Education</h2>
  ${resume.education
    .map(
      (e) => `
    <div class="edu-row">
      <strong>${e.degree}</strong>
      <span style="color:#555">${e.institution} · ${e.year}</span>
    </div>`
    )
    .join("")}

  ${
    resume.certifications?.length
      ? `<h2>Certifications</h2><ul>${resume.certifications.map((c) => `<li>${c}</li>`).join("")}</ul>`
      : ""
  }
</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end">
      <div className="w-full max-w-2xl h-screen bg-slate-950 border-l border-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="font-semibold text-white">AI Resume Rewrite</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimized for {job.title} at {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-slate-400 text-sm text-center">
                Gemini is rewriting your resume
                <br />
                for this specific role...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {resume && !loading && (
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="text-xl font-bold text-white">{resume.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{resume.contact}</p>
              </div>

              <section>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                  Professional Summary
                </h4>
                <p className="text-slate-300 leading-relaxed">{resume.summary}</p>
              </section>

              <section>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
                  Work Experience
                </h4>
                <div className="space-y-5">
                  {resume.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-white">{exp.title}</span>
                        <span className="text-slate-500 text-xs">{exp.duration}</span>
                      </div>
                      <p className="text-blue-400 text-xs mb-2">{exp.company}</p>
                      <ul className="space-y-1.5 pl-3">
                        {exp.achievements.map((a, j) => (
                          <li key={j} className="text-slate-300 flex gap-2">
                            <span className="text-slate-600 shrink-0 mt-1">•</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-blue-600/10 border border-blue-600/20 text-blue-300 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                  Education
                </h4>
                {resume.education.map((edu, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="font-medium text-white">{edu.degree}</span>
                    <span className="text-slate-400 text-xs">
                      {edu.institution} · {edu.year}
                    </span>
                  </div>
                ))}
              </section>

              {resume.certifications?.length ? (
                <section>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                    Certifications
                  </h4>
                  <ul className="space-y-1 pl-3">
                    {resume.certifications.map((c, i) => (
                      <li key={i} className="text-slate-300 flex gap-2">
                        <span className="text-slate-600">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        {resume && !loading && (
          <div className="px-6 py-4 border-t border-slate-800 flex gap-3 shrink-0">
            <button
              onClick={downloadPDF}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl text-sm transition-colors"
            >
              ↓ Download PDF
            </button>
            <button
              onClick={handleApply}
              disabled={applying || applied}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                applied
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
              }`}
            >
              {applied ? "✓ Applied!" : applying ? "Applying..." : "Apply for this Job"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
