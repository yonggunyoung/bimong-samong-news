import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { buildAutoPublishPrompt } from "@/lib/auto-publish/prompts";
import { pickStaticTopic } from "@/lib/auto-publish/topic-pools";
import { generateAndUploadImage } from "@/lib/auto-publish/image";
import type { Category } from "@/types";

export const maxDuration = 60;

const CATEGORIES: Category[] = ["꿈해몽", "생활정보", "운세/심리"];
const MAX_DAILY = 3;

export async function GET(req: NextRequest) {
  // CRON_SECRET 검증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const geminiKey = process.env.GEMINI_API_KEY!;

  if (!supabaseUrl || !supabaseKey || !geminiKey) {
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const ai = new GoogleGenAI({ apiKey: geminiKey });

  // 1. 오늘 게시 수 확인
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  if ((todayCount ?? 0) >= MAX_DAILY) {
    return NextResponse.json({
      message: `Already ${todayCount} posts today. Skipping.`,
    });
  }

  // 2. 카테고리 균형 선택 (7일 통계)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("category", cat)
      .gte("created_at", weekAgo.toISOString());
    stats[cat] = count ?? 0;
  }

  const category = [...CATEGORIES].sort(
    (a, b) => stats[a] - stats[b]
  )[0];

  // 3. 주제 선택 (정적 풀 — AI 호출 불필요)
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(100);

  const usedTitles = (recentPosts ?? []).map((p) => p.title);
  const topic = pickStaticTopic(category, usedTitles);

  if (!topic) {
    return NextResponse.json({
      message: `No available topic for ${category}`,
    });
  }

  // 4. 글 생성 (Gemini 1회)
  const { systemPrompt, config } = buildAutoPublishPrompt(category);
  const userMessage = `카테고리: ${category}\n주제: ${topic}\n\n위 주제로 기사를 작성해주세요.`;

  let article: { title: string; content: string };
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\n${userMessage}`,
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    const raw = result.text ?? "";
    // 마크다운 코드블록 안의 JSON도 처리
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    const match = cleaned.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Failed to parse AI response", rawPreview: raw.slice(0, 300) },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(match[0]);
    parsed.content = parsed.content.replace(/\*\*([^*]+)\*\*/g, "$1");
    article = parsed;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Text generation failed: ${msg}` },
      { status: 500 }
    );
  }

  // 5. 이미지 생성 (실패 시 null)
  let thumbnailUrl: string | null = null;
  try {
    thumbnailUrl = await generateAndUploadImage(
      category,
      ai,
      supabaseUrl,
      supabaseKey
    );
  } catch {
    // 이미지 실패는 무시, 글만 게시
  }

  // 6. DB 삽입
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: article.title,
      content: article.content,
      category,
      thumbnail: thumbnailUrl,
    })
    .select("id, title, category, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: `DB insert failed: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Published successfully",
    post: data,
    persona: config.persona.name,
    temperature: config.temperature.toFixed(2),
    hasImage: !!thumbnailUrl,
  });
}
