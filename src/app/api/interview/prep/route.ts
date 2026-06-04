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

  const { data: resume } = await supabase
    .from("resumes").select("parsed_text, summary, keywords")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single();

  const resumeContext = resume
    ? `Resume Summary: ${resume.summary}\nKey Skills: ${(resume.keywords as string[]).slice(0, 15).join(", ")}\nResume (excerpt): ${(resume.parsed_text || "").substring(0, 2000)}`
    : "No resume provided — give general advice for this role.";

  const prompt = `Generate 10 interview questions and ideal answers for this job application. Return ONLY a valid JSON array.

Job: ${job_title} at ${company}
Description: ${(description || "").substring(0, 1500)}
Required Skills: ${(tags || []).join(", ")}

${resumeContext}

Return a JSON array of exactly 10 objects:
[
  {
    "type": "Behavioral",
    "question": "...",
    "answer": "2-3 sentence ideal answer tailored to the candidate's background using the STAR method where appropriate"
  }
]

Mix: 3 Behavioral (STAR format), 3 Technical (for the specific required skills), 2 Situational, 2 Cultural/Motivational.
Make answers specific to the candidate's resume — reference their actual skills and experience.`;

  try {
    const text = await geminiGenerate(prompt, { json: true });
    const questions = JSON.parse(text);
    return NextResponse.json({ questions });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate interview prep: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
