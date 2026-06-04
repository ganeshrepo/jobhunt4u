import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getJobMatches } from "@/lib/jobs";
import { sendWeeklyDigest } from "@/lib/email";

const MAX_USERS_PER_RUN = 10;

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

  // Query profiles that have a resume uploaded and a target_role set
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      target_role,
      resumes!inner (
        parsed_text,
        keywords,
        summary
      )
    `)
    .not("target_role", "is", null)
    .limit(MAX_USERS_PER_RUN);

  if (error) {
    console.error("Weekly digest query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, message: "No eligible users found" });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    if (!profile.email) continue;

    // Use the first resume (most recent via ordering)
    const resumeRaw = Array.isArray(profile.resumes) ? profile.resumes[0] : profile.resumes;
    if (!resumeRaw) continue;

    const resume = resumeRaw as {
      parsed_text: string | null;
      keywords: string[] | null;
      summary: string | null;
    };

    const keywords = Array.isArray(resume.keywords) ? resume.keywords : [];
    const jobTitle = profile.target_role || keywords.slice(0, 2).join(" ") || "Software Engineer";

    const candidateProfile = {
      jobTitle,
      keywords,
      resumeText: resume.parsed_text ?? "",
      summary: resume.summary ?? "",
    };

    try {
      const { jobs } = await getJobMatches(candidateProfile);
      const topJobs = jobs.slice(0, 5).map((j) => ({
        title: j.title,
        company: j.company,
        match_score: j.match_score,
      }));

      if (topJobs.length === 0) continue;

      await sendWeeklyDigest(
        { email: profile.email, name: profile.full_name ?? "there" },
        topJobs
      );
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to send digest to ${profile.email}:`, msg);
      errors.push(msg);
    }
  }

  return NextResponse.json({
    sent,
    total: profiles.length,
    ...(errors.length > 0 && { errors }),
  });
}
