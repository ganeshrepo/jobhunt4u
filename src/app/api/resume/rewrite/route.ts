import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are an expert resume writer and ATS optimization specialist. Rewrite this resume tailored for the job below.

TARGET JOB:
Title: ${title}
Company: ${company}
Location: ${location}
Salary: ${salary}
Required Skills: ${tags?.join(", ")}
Description: ${description}

ORIGINAL RESUME:
${resume.parsed_text?.substring(0, 6000)}

RULES:
1. Keep ALL facts accurate — never invent experience, companies, dates, or credentials
2. Write a powerful 3-sentence professional summary tailored to this specific role
3. Rewrite bullet points with strong action verbs and quantified achievements where possible
4. Naturally incorporate required skill keywords throughout
5. Reorder skills to prioritize what's most relevant to this role

Return ONLY valid JSON:
{
  "name": "candidate full name",
  "contact": "email · phone (if found in resume)",
  "summary": "3-sentence tailored professional summary",
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "date range",
      "achievements": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "skills": ["skill1", "skill2"],
  "education": [
    { "degree": "degree name", "institution": "university", "year": "year" }
  ],
  "certifications": ["cert1"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const rewritten = JSON.parse(result.response.text());
    return NextResponse.json(rewritten);
  } catch (err) {
    return NextResponse.json(
      {
        error: `AI rewrite failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
