import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY 미설정" }, { status: 500 });
  }

  let body: { prompt?: string; index?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const { prompt, index = 0 } = body;
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "프롬프트가 필요합니다." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const imgResult = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const parts = imgResult.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const supabase = getAdminSupabase();
        const buffer = Buffer.from(part.inlineData.data, "base64");
        const fileName = `ai/${Date.now()}_${index + 1}.png`;

        const { error } = await supabase.storage
          .from("post-images")
          .upload(fileName, buffer, { contentType: "image/png", upsert: true });

        if (error) {
          return NextResponse.json({ error: `업로드 실패: ${error.message}` }, { status: 500 });
        }

        const { data } = supabase.storage.from("post-images").getPublicUrl(fileName);
        return NextResponse.json({ url: data.publicUrl, index });
      }
    }

    return NextResponse.json({ error: "이미지 생성 결과가 없습니다." }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "이미지 생성 실패";
    console.error("Image generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
