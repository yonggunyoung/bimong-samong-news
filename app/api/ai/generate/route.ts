import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/types";
import { buildAdminPrompt } from "@/lib/auto-publish/prompts";

const VALID_CATEGORIES: Category[] = ["꿈해몽", "생활정보", "운세/심리"];

// 텍스트만 생성 (이미지 프롬프트 포함해서 반환)
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "여기에_API_키를_입력하세요") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다. .env.local을 확인해주세요." },
      { status: 500 }
    );
  }

  let body: { topic?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { topic, category } = body;

  if (!topic?.trim()) {
    return NextResponse.json({ error: "주제를 입력해주세요." }, { status: 400 });
  }

  if (!category || !VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: "유효하지 않은 카테고리입니다." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { systemPrompt, config } = buildAdminPrompt(category as Category);

    const textResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\n카테고리: ${category}\n주제: ${topic}\n\n위 주제로 기사를 작성해주세요.`,
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    const rawText = textResult.text ?? "";

    const jsonMatch = rawText.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.title || !parsed.content) {
      return NextResponse.json(
        { error: "AI가 올바른 형식의 응답을 생성하지 못했습니다." },
        { status: 500 }
      );
    }

    // 볼드체 후처리 제거
    const content = parsed.content.replace(/\*\*([^*]+)\*\*/g, "$1");

    return NextResponse.json({
      title: parsed.title,
      content,
      imagePrompts: parsed.imagePrompts ?? [],
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI 생성 중 오류가 발생했습니다.";
    console.error("Gemini API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
