"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/client";

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
