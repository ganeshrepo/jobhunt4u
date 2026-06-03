import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getJobMatches } from "@/lib/jobs";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function GET() {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch resume + profile in parallel
  const [resumeResult, profileResult] = await Promise.all([
    supabase
      .from("resumes")
      .select("parsed_text, keywords, summary")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("profiles")
      .select("target_role")
      .eq("id", user.id)
      .single(),
  ]);

  if (!resumeResult.data)
    return NextResponse.json(
      { error: "No resume found. Upload your resume first." },
      { status: 404 }
    );

  const resume = resumeResult.data;
  const keywords = Array.isArray(resume.keywords) ? resume.keywords : [];

  // Use target_role from settings, or infer from keywords
  const jobTitle =
    profileResult.data?.target_role ||
    keywords.slice(0, 2).join(" ") ||
    "Software Engineer";

  const profile = {
    jobTitle,
    keywords,
    resumeText: resume.parsed_text || "",
    summary: resume.summary || "",
  };

  try {
    const { jobs, source } = await getJobMatches(profile);
    return NextResponse.json({ jobs, source });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Job matching failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
