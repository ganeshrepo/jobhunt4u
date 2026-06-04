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

export async function GET(request: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  let role = searchParams.get("role") || "";
  const location = searchParams.get("location") || "India/Remote";

  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("target_role")
      .eq("id", user.id)
      .single();
    role = profile?.target_role || "Software Engineer";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Provide salary insights for the role "${role}" in "${location}".

Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "role": "...",
  "location": "...",
  "min_salary": "₹X LPA",
  "max_salary": "₹X LPA",
  "median_salary": "₹X LPA",
  "experience_levels": [
    { "level": "0-2 years", "range": "₹X–Y LPA" },
    { "level": "2-5 years", "range": "₹X–Y LPA" },
    { "level": "5-8 years", "range": "₹X–Y LPA" },
    { "level": "8+ years", "range": "₹X–Y LPA" }
  ],
  "top_paying_companies": ["Company A", "Company B", "Company C"],
  "market_trend": "one sentence about salary trend for this role",
  "negotiation_tip": "one actionable salary negotiation tip"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const insights = JSON.parse(cleaned);
    return NextResponse.json(insights);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to generate salary insights: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
