import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendInterviewReminder } from "@/lib/email";

async function getSupabaseWithUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: Request) {
  const { supabase, user } = await getSupabaseWithUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { application_id } = body as { application_id?: string };

  if (!application_id) {
    return NextResponse.json({ error: "application_id is required" }, { status: 400 });
  }

  // Fetch the application (scoped to this user)
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, job_title, company, interview_date, status")
    .eq("id", application_id)
    .eq("user_id", user.id)
    .single();

  if (appError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  if (!application.interview_date) {
    return NextResponse.json(
      { error: "No interview date set for this application" },
      { status: 400 }
    );
  }

  // Fetch the user's profile for email and name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email;
  if (!email) {
    return NextResponse.json({ error: "No email address found for user" }, { status: 400 });
  }

  // interview_date is a plain date string "YYYY-MM-DD"; append T00:00:00Z to
  // force UTC parsing and avoid local-timezone off-by-one-day errors.
  const interviewDate = new Date(
    `${application.interview_date}T00:00:00Z`
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  try {
    await sendInterviewReminder(
      { email, name: profile?.full_name ?? "there" },
      application.job_title,
      application.company,
      interviewDate
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to send email: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: `Reminder sent to ${email}` });
}
