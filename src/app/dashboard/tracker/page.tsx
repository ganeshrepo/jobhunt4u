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
  notes?: string;
}

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    job_title: "",
    company: "",
    location: "",
    salary: "",
    status: "Applied",
    notes: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

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
      body: JSON.stringify({
        ...form,
        applied_date: new Date().toISOString().split("T")[0],
      }),
    });
    setShowForm(false);
    setForm({
      job_title: "",
      company: "",
      location: "",
      salary: "",
      status: "Applied",
      notes: "",
    });
    fetchApplications();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered =
    filter === "All"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Application Tracker" />
      <div className="flex-1 p-8">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
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
          <form
            onSubmit={handleAdd}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 space-y-4"
          >
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              ))}
            </div>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-800 text-slate-300 px-5 py-2 rounded-xl text-sm"
              >
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-5 py-3 font-medium">Position</th>
                  <th className="text-left px-5 py-3 font-medium">Company</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {app.job_title}
                    </td>
                    <td className="px-5 py-4 text-slate-400">{app.company}</td>
                    <td className="px-5 py-4 text-slate-400">
                      {app.applied_date}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                        className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer bg-transparent border-0 outline-none ${statusColors[app.status] || "text-slate-400"}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} className="bg-slate-800 text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
