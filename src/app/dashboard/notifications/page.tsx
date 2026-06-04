import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/Topbar";
import Link from "next/link";

function getDaysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_title, company, interview_date, status, applied_date")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const apps = applications || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications: {
    id: string;
    type: "interview_today" | "interview_soon" | "interview_passed" | "follow_up";
    title: string;
    body: string;
    link: string;
    time: string;
  }[] = [];

  for (const app of apps) {
    if (app.interview_date) {
      const days = getDaysUntil(app.interview_date);
      if (days === 0) {
        notifications.push({
          id: `interview-today-${app.id}`,
          type: "interview_today",
          title: "Interview Today",
          body: `${app.job_title} at ${app.company} — Good luck!`,
          link: "/dashboard/tracker",
          time: app.interview_date,
        });
      } else if (days > 0 && days <= 3) {
        notifications.push({
          id: `interview-soon-${app.id}`,
          type: "interview_soon",
          title: `Interview in ${days} day${days === 1 ? "" : "s"}`,
          body: `${app.job_title} at ${app.company}`,
          link: "/dashboard/tracker",
          time: app.interview_date,
        });
      } else if (days < 0 && days >= -7) {
        notifications.push({
          id: `interview-passed-${app.id}`,
          type: "interview_passed",
          title: "Follow up on interview",
          body: `Your interview for ${app.job_title} at ${app.company} was ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`,
          link: "/dashboard/tracker",
          time: app.interview_date,
        });
      }
    }

    // Suggest follow-up for applications older than 7 days still in Applied
    if (app.status === "Applied" && app.applied_date) {
      const daysSince = Math.floor((Date.now() - new Date(app.applied_date).getTime()) / 86400000);
      if (daysSince >= 7 && daysSince <= 21) {
        notifications.push({
          id: `followup-${app.id}`,
          type: "follow_up",
          title: "Time to follow up",
          body: `You applied to ${app.job_title} at ${app.company} ${daysSince} days ago`,
          link: "/dashboard/tracker",
          time: app.applied_date,
        });
      }
    }
  }

  const iconMap = {
    interview_today: { icon: "🎯", bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-400" },
    interview_soon: { icon: "📅", bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
    interview_passed: { icon: "📬", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    follow_up: { icon: "💬", bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400" },
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Topbar title="Notifications" />
      <div className="flex-1 p-8 max-w-2xl">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="text-lg font-semibold text-white mb-2">No notifications</h2>
            <p className="text-slate-500 text-sm max-w-xs">
              You&apos;re all caught up. Notifications will appear here for upcoming interviews and follow-up reminders.
            </p>
            <Link
              href="/dashboard/tracker"
              className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              View Applications
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm mb-4">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>
            {notifications.map((n) => {
              const style = iconMap[n.type];
              return (
                <Link
                  key={n.id}
                  href={n.link}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${style.bg} hover:opacity-80 transition-opacity`}
                >
                  <span className="text-2xl shrink-0">{style.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${style.text}`}>{n.title}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{n.body}</p>
                  </div>
                  <span className="text-slate-600 text-xs shrink-0">
                    {new Date(n.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
