import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import ATSCard from "@/components/ATSCard";
import MatchCard from "@/components/MatchCard";
import SmartSlider from "@/components/SmartSlider";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { statusColors } from "@/lib/data";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [resumeResult, applicationsResult] = await Promise.all([
    supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const resume = resumeResult.data;
  const applications = applicationsResult.data || [];
  const interviewCount = applications.filter(
    (a: { status: string }) => a.status === "Interview"
  ).length;
  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Dashboard" userName={userName} />

      <div className="flex-1 p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="ATS Score"
            value={resume?.ats_score ? `${resume.ats_score}%` : "—"}
            sub={resume ? "Your resume score" : "Upload resume"}
            color="text-green-400"
          />
          <StatCard
            label="Applications"
            value={applications.length}
            sub="Total submitted"
            color="text-blue-400"
          />
          <StatCard
            label="Interviews"
            value={interviewCount}
            sub="Scheduled"
            color="text-purple-400"
          />
          <StatCard
            label="Resume"
            value={resume ? "✓" : "✗"}
            sub={resume?.file_name || "Not uploaded"}
            color={resume ? "text-green-400" : "text-red-400"}
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ATSCard score={resume?.ats_score || 0} />
          <MatchCard score={92} count={0} />
          <SmartSlider />
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resume?.suggestions && Array.isArray(resume.suggestions) ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Resume Insights</h2>
                <Link
                  href="/dashboard/resume"
                  className="text-blue-400 text-sm hover:underline"
                >
                  View
                </Link>
              </div>
              <div className="space-y-2">
                {(resume.suggestions as string[]).slice(0, 3).map((s, i) => (
                  <div key={i} className="flex gap-2 text-sm text-slate-400">
                    <span className="text-yellow-400 shrink-0">→</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-slate-500 text-sm">No resume uploaded yet</p>
              <Link
                href="/dashboard/resume"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Upload Resume →
              </Link>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Applications</h2>
              <Link
                href="/dashboard/tracker"
                className="text-blue-400 text-sm hover:underline"
              >
                View all
              </Link>
            </div>
            {applications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                No applications yet
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((app: Record<string, string>) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800"
                  >
                    <div>
                      <p className="font-medium text-sm text-white">
                        {app.job_title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {app.company} · {app.applied_date}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[app.status] || "bg-slate-700 text-slate-400"}`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
