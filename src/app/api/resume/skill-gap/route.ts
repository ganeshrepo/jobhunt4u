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

export async function GET() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [resumeResult, profileResult] = await Promise.all([
    supabase.from("resumes").select("keywords, summary")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
    supabase.from("profiles").select("target_role").eq("id", user.id).single(),
  ]);

  if (!resumeResult.data)
    return NextResponse.json({ error: "No resume found. Upload your resume first." }, { status: 404 });

  const keywords = (resumeResult.data.keywords as string[]) || [];
  const targetRole = profileResult.data?.target_role || "Software Engineer";

  const prompt = `Analyze the skill gap for a candidate targeting: "${targetRole}"

Candidate's current skills: ${keywords.join(", ")}

Return ONLY valid JSON:
{
  "role": "${targetRole}",
  "have": ["skill1", "skill2"],
  "missing": [
    { "skill": "Docker", "priority": "High", "resource": "Docker Official Docs" },
    { "skill": "Kubernetes", "priority": "Medium", "resource": "Kubernetes.io tutorials" }
  ],
  "market_demand": "1-sentence insight about the job market for this role"
}

Rules:
- "have" = candidate's skills that are in the top 20 for ${targetRole} (intersection)
- "missing" = top in-demand skills for ${targetRole} NOT in candidate's profile (up to 8 skills)
- priority: High (must-have for most jobs), Medium (commonly required), Low (nice to have)
- resource: free/popular learning resource for that skill
- Only include skills directly relevant to ${targetRole}`;

  try {
    const text = await geminiGenerate(prompt, { json: true });
    const analysis = JSON.parse(text);
    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json(
      { error: `Skill gap analysis failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
