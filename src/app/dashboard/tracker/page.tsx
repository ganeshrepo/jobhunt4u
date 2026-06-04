"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { statusColors } from "@/lib/data";

interface Application {
  id: string;
  job_title: string;
  company: string;
  location?: string;
  salary?: string;
  status: string;
  applied_date: string;
  interview_date?: string;
  notes?: string;
}

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string; interview_date: string } | null>(null);
  const [followupApp, setFollowupApp] = useState<Application | null>(null);
  const [followupEmail, setFollowupEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generatingFollowup, setGeneratingFollowup] = useState(false);
  const [followupCopied, setFollowupCopied] = useState(false);
  const [form, setForm] = useState({
    job_title: "",
    company: "",
    location: "",
    salary: "",
    status: "Applied",
    interview_date: "",
    notes: "",
  });

  useEffect(() => { fetchApplications(); }, []);

  const handleGenerateFollowup = async (app: Application) => {
    setFollowupApp(app);
    setFollowupEmail(null);
    setGeneratingFollowup(true);
    try {
      const res = await fetch("/api/applications/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: app.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFollowupEmail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingFollowup(false);
    }
  };

  const fetchApplications = async () => {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApplications(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, applied_date: new Date().toISOString().split("T")[0] }),
    });
    setShowForm(false);
    setForm({ job_title: "", company: "", location: "", salary: "", status: "Applied", interview_date: "", notes: "" });
    fetchApplications();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const handleSaveNotes = async () => {
    if (!editingNotes) return;
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingNotes.id, notes: editingNotes.notes, interview_date: editingNotes.interview_date || null }),
    });
    setApplications((prev) =>
      prev.map((a) =>
        a.id === editingNotes.id
          ? { ...a, notes: editingNotes.notes, interview_date: editingNotes.interview_date }
          : a
      )
    );
    setEditingNotes(null);
    setExpandedNotes(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const getDaysUntilInterview = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    return diff;
  };

  const filtered = filter === "All" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Application Tracker" />
      <div className="flex-1 p-8">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {s}
              {s !== "All" && (
                <span className="ml-1.5 opacity-60">
                  ({applications.filter((a) => a.status === s).length})
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-sm transition-colors"
          >
            + Add Application
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-white">Add New Application</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "job_title", placeholder: "Job Title", required: true },
                { key: "company", placeholder: "Company", required: true },
                { key: "location", placeholder: "Location" },
                { key: "salary", placeholder: "Salary (optional)" },
              ].map((f) => (
                <input
                  key={f.key}
                  required={f.required}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Interview Date (optional)</label>
                <input
                  type="date"
                  value={form.interview_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, interview_date: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm transition-colors">
                Save
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-800 text-slate-300 px-5 py-2 rounded-xl text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No applications{filter !== "All" ? ` with status "${filter}"` : " yet"}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-5 py-3 font-medium">Position</th>
                  <th className="text-left px-5 py-3 font-medium">Company</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Interview</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((app) => {
                  const daysUntil = getDaysUntilInterview(app.interview_date);
                  const isExpanded = expandedNotes === app.id;

                  return (
                    <>
                      <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-white">{app.job_title}</td>
                        <td className="px-5 py-4 text-slate-400">{app.company}</td>
                        <td className="px-5 py-4 text-slate-400">{app.applied_date}</td>
                        <td className="px-5 py-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer bg-transparent border-0 outline-none ${statusColors[app.status] || "text-slate-400"}`}
                          >
                            {STATUSES.map((s) => <option key={s} className="bg-slate-800 text-white">{s}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          {app.interview_date ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              daysUntil !== null && daysUntil <= 3 && daysUntil >= 0
                                ? "bg-orange-500/20 text-orange-400"
                                : daysUntil !== null && daysUntil < 0
                                  ? "bg-slate-700 text-slate-500"
                                  : "bg-purple-500/20 text-purple-400"
                            }`}>
                              {daysUntil !== null && daysUntil >= 0
                                ? daysUntil === 0 ? "Today!" : `${daysUntil}d`
                                : app.interview_date}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center gap-3 justify-end">
                            <button
                              onClick={() => {
                                setExpandedNotes(isExpanded ? null : app.id);
                                setEditingNotes({ id: app.id, notes: app.notes || "", interview_date: app.interview_date || "" });
                              }}
                              className="text-slate-500 hover:text-blue-400 text-xs transition-colors"
                            >
                              {isExpanded ? "▲ notes" : "▼ notes"}
                            </button>
                            <button
                              onClick={() => handleGenerateFollowup(app)}
                              className="text-slate-500 hover:text-purple-400 text-xs transition-colors"
                            >
                              Follow up
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && editingNotes?.id === app.id && (
                        <tr key={`${app.id}-notes`} className="bg-slate-800/30">
                          <td colSpan={6} className="px-5 py-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Interview Date</label>
                                  <input
                                    type="date"
                                    value={editingNotes.interview_date}
                                    onChange={(e) => setEditingNotes((p) => p ? { ...p, interview_date: e.target.value } : p)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <textarea
                                rows={3}
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes((p) => p ? { ...p, notes: e.target.value } : p)}
                                placeholder="Add notes, recruiter contacts, follow-up reminders..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                              />
                              <div className="flex gap-2">
                                <button onClick={handleSaveNotes} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs transition-colors">
                                  Save
                                </button>
                                <button onClick={() => { setExpandedNotes(null); setEditingNotes(null); }} className="bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg text-xs">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {followupApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="font-semibold text-white">AI Follow-up Email</h2>
                <p className="text-xs text-slate-400 mt-0.5">{followupApp.job_title} at {followupApp.company}</p>
              </div>
              <button onClick={() => { setFollowupApp(null); setFollowupEmail(null); }} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="p-6">
              {generatingFollowup && (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-slate-400 text-sm">Writing your follow-up...</span>
                </div>
              )}
              {followupEmail && !generatingFollowup && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Subject</p>
                    <p className="text-sm text-white bg-slate-800 rounded-lg px-3 py-2">{followupEmail.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Body</p>
                    <pre className="text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-3 whitespace-pre-wrap font-sans leading-relaxed">{followupEmail.body}</pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${followupEmail.subject}\n\n${followupEmail.body}`);
                      setFollowupCopied(true);
                      setTimeout(() => setFollowupCopied(false), 2000);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {followupCopied ? "✓ Copied!" : "Copy to Clipboard"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
