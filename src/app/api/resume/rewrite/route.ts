import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";

export async function POST(request: Request) {
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
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, company, location, salary, tags, description } =
    await request.json();

  const { data: resume } = await supabase
    .from("resumes")
    .select("parsed_text")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!resume)
    return NextResponse.json(
      { error: "No resume found. Upload your resume first." },
      { status: 404 }
    );

  const prompt = `You are a senior resume strategist and ATS optimization expert. Your task is to rewrite the candidate's resume so it is precisely tailored to the target job below — maximising ATS match score and human appeal.

═══ TARGET JOB ═══
Title: ${title}
Company: ${company}
Location: ${location}
Salary: ${salary}
Required Skills: ${tags?.join(", ")}
Full Description:
${(description || "").substring(0, 2000)}

═══ CANDIDATE'S ORIGINAL RESUME ═══
${resume.parsed_text?.substring(0, 5000)}

═══ REWRITE INSTRUCTIONS ═══
1. NEVER fabricate: Keep all companies, dates, degrees, and credentials exactly as in the original. Only rewrite language and emphasis.
2. SUMMARY: Write a compelling 3-sentence summary that directly addresses the hiring needs of "${title}" at ${company}. Mention the role name and key required skills naturally.
3. EXPERIENCE bullets: Rewrite each bullet using strong action verbs. Where numbers/metrics exist in the original, keep them. Where the original is vague, add realistic context. Each bullet should connect to a skill or responsibility from the job description.
4. SKILLS: Reorder skills so the most relevant to this job appear first. Include all required skills from the job description that the candidate actually has. Add any missing required skills only if they can reasonably be inferred from their experience.
5. KEYWORD DENSITY: Naturally weave in exact phrases from the job description (e.g. if JD says "cross-functional collaboration", use that phrase in a bullet).
6. TONE: Match the company culture in the JD — startup = dynamic/impact-focused; enterprise = process/scale-focused.

Return ONLY valid JSON — no markdown, no explanation:
{
  "name": "candidate full name from resume",
  "contact": "email · phone · LinkedIn (whatever is in the resume)",
  "summary": "3-sentence tailored professional summary mentioning the target role",
  "experience": [
    {
      "title": "exact job title from resume",
      "company": "exact company name from resume",
      "duration": "exact date range from resume",
      "achievements": ["rewritten bullet 1", "rewritten bullet 2", "rewritten bullet 3", "rewritten bullet 4"]
    }
  ],
  "skills": ["most relevant skill first", "skill2", "skill3"],
  "education": [
    { "degree": "degree name", "institution": "university name", "year": "graduation year" }
  ],
  "certifications": ["certification name if any"]
}`;

  try {
    const text = await geminiGenerate(prompt, { json: true });
    const rewritten = JSON.parse(text);
    return NextResponse.json(rewritten);
  } catch (err) {
    return NextResponse.json(
      { error: `AI rewrite failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
