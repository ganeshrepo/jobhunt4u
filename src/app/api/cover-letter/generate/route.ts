import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";

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

  const { job_title, company, description, tags } = await request.json();

  const [resumeResult, profileResult] = await Promise.all([
    supabase.from("resumes").select("parsed_text, summary, keywords")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
    supabase.from("profiles").select("full_name, target_role").eq("id", user.id).single(),
  ]);

  if (!resumeResult.data)
    return NextResponse.json({ error: "No resume found. Upload your resume first." }, { status: 404 });

  const resume = resumeResult.data;
  const userName = profileResult.data?.full_name ||
    user.user_metadata?.full_name || "Candidate";

  const prompt = `Write a professional, compelling cover letter for this job application.

Candidate Name: ${userName}
Resume Summary: ${resume.summary || "Experienced professional"}
Key Skills: ${(resume.keywords as string[]).slice(0, 15).join(", ")}
Resume (excerpt): ${(resume.parsed_text || "").substring(0, 2500)}

Target Job: ${job_title} at ${company}
Job Description: ${(description || "").substring(0, 1500)}
Required Skills: ${(tags || []).join(", ")}

Write a 3-paragraph cover letter that:
1. Opens with genuine enthusiasm for this specific role at ${company}
2. Highlights 2-3 concrete achievements from the candidate's background that directly match the job requirements
3. Closes with a confident call to action

Rules: Start directly with "Dear Hiring Manager,". No placeholders. No brackets. Ready to send as-is. Professional but warm tone.`;

  try {
    const coverLetter = await geminiGenerate(prompt);
    return NextResponse.json({ cover_letter: coverLetter });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate cover letter: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
