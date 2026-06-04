"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/client";

interface SalaryInsights {
  role: string;
  location: string;
  min_salary: string;
  max_salary: string;
  median_salary: string;
  experience_levels: { level: string; range: string }[];
  top_paying_companies: string[];
  market_trend: string;
  negotiation_tip: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    linkedin_url: "",
    target_role: "",
    preferred_location: "",
    expected_salary: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [salaryInsights, setSalaryInsights] = useState<SalaryInsights | null>(null);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setForm((prev) => ({
        ...prev,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        ...(data || {}),
      }));
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, ...form });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const fetchSalaryInsights = async () => {
    setLoadingSalary(true);
    try {
      const params = new URLSearchParams();
      if (form.target_role) params.set("role", form.target_role);
      if (form.preferred_location) params.set("location", form.preferred_location);
      const res = await fetch(`/api/salary/insights?${params}`);
      const data = await res.json();
      if (!data.error) setSalaryInsights(data);
    } catch {}
    finally { setLoadingSalary(false); }
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Settings" />
      <div className="flex-1 p-8 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Profile</h2>
            <div className="space-y-4">
              {[
                { key: "full_name", label: "Full Name", type: "text", placeholder: "Your name" },
                { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                { key: "linkedin_url", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/in/..." },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Job Preferences</h2>
            <div className="space-y-4">
              {[
                { key: "target_role", label: "Target Role", placeholder: "e.g. Senior Frontend Engineer" },
                { key: "preferred_location", label: "Preferred Location", placeholder: "e.g. Remote, Bangalore" },
                { key: "expected_salary", label: "Expected Salary (LPA)", placeholder: "e.g. 20–30" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white">Salary Insights</h2>
                <p className="text-xs text-slate-500 mt-0.5">AI-powered salary benchmarks for your target role</p>
              </div>
              <button
                type="button"
                onClick={fetchSalaryInsights}
                disabled={loadingSalary}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                {loadingSalary ? "Loading..." : "Get Insights"}
              </button>
            </div>
            {salaryInsights && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Min", value: salaryInsights.min_salary, color: "text-slate-400" },
                    { label: "Median", value: salaryInsights.median_salary, color: "text-blue-400" },
                    { label: "Max", value: salaryInsights.max_salary, color: "text-green-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-800 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">By Experience</p>
                  <div className="space-y-1.5">
                    {salaryInsights.experience_levels.map((e) => (
                      <div key={e.level} className="flex justify-between text-sm">
                        <span className="text-slate-400">{e.level}</span>
                        <span className="text-white font-medium">{e.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Top Paying Companies</p>
                  <div className="flex flex-wrap gap-2">
                    {salaryInsights.top_paying_companies.map((c) => (
                      <span key={c} className="px-2.5 py-1 bg-slate-800 rounded-full text-xs text-slate-300">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed"><span className="text-blue-400 font-medium">Trend: </span>{salaryInsights.market_trend}</p>
                  <p className="text-xs text-slate-300 leading-relaxed"><span className="text-green-400 font-medium">Tip: </span>{salaryInsights.negotiation_tip}</p>
                </div>
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
