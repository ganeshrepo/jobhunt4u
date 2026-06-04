import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import ATSCard from "@/components/ATSCard";
import MatchCard from "@/components/MatchCard";
import SmartSlider from "@/components/SmartSlider";
import StatCard from "@/components/StatCard";
import PipelineChart from "@/components/PipelineChart";
import Link from "next/link";
import { statusColors } from "@/lib/data";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [resumeResult, applicationsResult, allResumesResult] = await Promise.all([
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
      .order("created_at", { ascending: false }),
    supabase
      .from("resumes")
      .select("ats_score, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true })
      .limit(10),
  ]);

  const resume = resumeResult.data;
  const allApplications: Record<string, string>[] & { status: string }[] = applicationsResult.data || [];
  const recentApplications = allApplications.slice(0, 4);
  const allResumes: { ats_score: number; created_at: string }[] = allResumesResult.data || [];

  const interviewCount = allApplications.filter(
    (a) => a.status === "Interview"
  ).length;

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  // Analytics: This Week vs Previous Week
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekCount = allApplications.filter((a) => {
    const d = new Date(a.created_at);
    return d >= oneWeekAgo;
  }).length;

  const prevWeekCount = allApplications.filter((a) => {
    const d = new Date(a.created_at);
    return d >= twoWeeksAgo && d < oneWeekAgo;
  }).length;

  const weekDiff = thisWeekCount - prevWeekCount;

  // ATS score trend from all resumes
  const atsScores = allResumes
    .filter((r) => r.ats_score != null)
    .map((r) => r.ats_score);

  const maxAts = Math.max(...atsScores, 100);

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
            value={allApplications.length}
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

        {/* Analytics Section */}
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Application Pipeline */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-medium text-white mb-4">Application Pipeline</h3>
              <PipelineChart applications={allApplications} />
            </div>

            {/* This Week card + ATS score trend */}
            <div className="flex flex-col gap-4">
              {/* This Week */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1">
                <h3 className="font-medium text-white mb-1">This Week</h3>
                <p className="text-slate-500 text-xs mb-4">vs. previous 7 days</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-blue-400">{thisWeekCount}</span>
                  <span
                    className={`text-sm font-medium mb-1 ${weekDiff > 0 ? "text-green-400" : weekDiff < 0 ? "text-red-400" : "text-slate-500"}`}
                  >
                    {weekDiff > 0 ? `+${weekDiff}` : weekDiff < 0 ? `${weekDiff}` : "—"}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  applications added
                </p>
              </div>

              {/* ATS Score Trend */}
              {atsScores.length > 1 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1">
                  <h3 className="font-medium text-white mb-1">ATS Score Trend</h3>
                  <p className="text-slate-500 text-xs mb-4">{atsScores.length} resumes uploaded</p>
                  {/* SVG sparkline */}
                  <div className="relative w-full h-16">
                    <svg
                      viewBox={`0 0 ${Math.max(atsScores.length - 1, 1) * 40} 48`}
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={atsScores
                          .map((score, i) => {
                            const x = i * 40;
                            const y = 48 - (score / maxAts) * 44;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {atsScores.map((score, i) => {
                        const x = i * 40;
                        const y = 48 - (score / maxAts) * 44;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#60a5fa"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>{atsScores[0]}%</span>
                    <span className="text-blue-400 font-medium">{atsScores[atsScores.length - 1]}%</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center gap-2">
                  <p className="text-slate-500 text-sm">ATS Score Trend</p>
                  <p className="text-slate-600 text-xs">Upload multiple resumes to see your score progression</p>
                </div>
              )}
            </div>
          </div>
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
            {recentApplications.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                No applications yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app: Record<string, string>) => (
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
