import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendInterviewReminder } from "@/lib/email";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Service-role client — can read all users' data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Tomorrow's date as a YYYY-MM-DD string (UTC)
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(now.getUTCDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Query applications with interview tomorrow, status = 'Interview'
  // interview_date is a date column, so compare with plain date string
  const { data: applications, error } = await supabase
    .from("applications")
    .select(`
      id,
      job_title,
      company,
      interview_date,
      user_id,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq("status", "Interview")
    .eq("interview_date", tomorrowStr);

  if (error) {
    console.error("Interview reminder query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!applications || applications.length === 0) {
    return NextResponse.json({ sent: 0, message: "No interviews scheduled for tomorrow" });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const app of applications) {
    const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
    if (!profile?.email) continue;

    // interview_date is a plain date string "YYYY-MM-DD"; append T00:00:00Z to
    // force UTC parsing and avoid local-timezone off-by-one-day errors.
    const interviewDate = new Date(`${app.interview_date}T00:00:00Z`).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }
    );

    try {
      await sendInterviewReminder(
        { email: profile.email, name: profile.full_name ?? "there" },
        app.job_title,
        app.company,
        interviewDate
      );
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to send reminder to ${profile.email}:`, msg);
      errors.push(msg);
    }
  }

  return NextResponse.json({
    sent,
    total: applications.length,
    ...(errors.length > 0 && { errors }),
  });
}
