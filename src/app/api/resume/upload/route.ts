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

export async function POST(request: Request) {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("resume") as File;
  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowed.includes(file.type))
    return NextResponse.json(
      { error: "Only PDF and DOCX files are supported" },
      { status: 400 }
    );

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let parsedText = "";

  try {
    if (file.type === "application/pdf") {
      const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse");
      const data = await pdfParse(buffer);
      parsedText = data.text;
    } else {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      parsedText = result.value;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to parse file: ${msg}` },
      { status: 500 }
    );
  }

  // Upload to Supabase Storage
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
  const fileName = `${user.id}/${Date.now()}_${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(fileName, buffer, { contentType: file.type });

  if (uploadError)
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message} (${uploadError.statusCode})` },
      { status: 500 }
    );

  const {
    data: { publicUrl },
  } = supabase.storage.from("resumes").getPublicUrl(fileName);

  // AI Analysis with Gemini
  let analysis = {
    ats_score: 0,
    keywords: [] as string[],
    missing_keywords: [] as string[],
    suggestions: [] as string[],
    summary: "",
  };

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are an ATS expert. Analyze this resume and return ONLY valid JSON:
{
  "ats_score": <number 0-100>,
  "keywords": ["skill1", "skill2"],
  "missing_keywords": ["missing1", "missing2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "summary": "2-sentence candidate summary"
}

Resume:
${parsedText.substring(0, 8000)}`;

    const result = await model.generateContent(prompt);
    analysis = JSON.parse(result.response.text());
  } catch (err) {
    console.error("Gemini analysis failed:", err);
    return NextResponse.json(
      { error: `AI analysis failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  // Save to DB
  const { data: resumeData, error: dbError } = await supabase
    .from("resumes")
    .upsert({
      user_id: user.id,
      file_name: file.name,
      file_url: publicUrl,
      parsed_text: parsedText.substring(0, 50000),
      ats_score: analysis.ats_score,
      keywords: analysis.keywords,
      missing_keywords: analysis.missing_keywords,
      suggestions: analysis.suggestions,
      summary: analysis.summary,
    })
    .select()
    .single();

  if (dbError)
    return NextResponse.json(
      { error: "Failed to save resume" },
      { status: 500 }
    );

  return NextResponse.json({ success: true, resume: resumeData, analysis });
}
