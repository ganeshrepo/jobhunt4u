import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function POST(request: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { application_id } = await request.json();
  if (!application_id) {
    return NextResponse.json({ error: "application_id is required" }, { status: 400 });
  }

  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("job_title, company, applied_date, notes, status")
    .eq("id", application_id)
    .eq("user_id", user.id)
    .single();

  if (appError || !app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { data: resume } = await supabase
    .from("resumes")
    .select("summary, keywords")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const appliedDate = new Date(app.applied_date);
  const today = new Date();
  const daysSinceApplied = Math.floor(
    (today.getTime() - appliedDate.getTime()) / 86400000
  );

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Write a professional follow-up email for a job application.

Candidate applied for: ${app.job_title} at ${app.company}
Days since applying: ${daysSinceApplied} days
Current status: ${app.status}
Application notes: ${app.notes || "none"}
${resume ? `Candidate background: ${resume.summary || ""}` : ""}

Write a concise, professional follow-up email (3-4 sentences) that:
1. References the specific role and company
2. Reiterates genuine interest
3. Politely asks for a status update
4. Is warm but not desperate

Format: Just the email body (no subject line). Start with "Dear Hiring Manager," or "Dear ${app.company} Team,"`;

  try {
    const result = await model.generateContent(prompt);
    const body = result.response.text();
    return NextResponse.json({
      subject: `Following up: ${app.job_title} Application`,
      body,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate email: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
