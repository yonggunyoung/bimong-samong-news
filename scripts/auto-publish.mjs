/**
 * 비몽사몽 자동 게시글 생성 스크립트
 * 하루 2~3개 자동 게시. Gemini 무료 티어 내 운영.
 *
 * Usage: node --env-file=.env.local scripts/auto-publish.mjs
 *        npm run auto-publish
 */

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { pickStaticTopic } from "./lib/topic-pools.mjs";
import { buildPrompt, buildTopicGenerationPrompt, pickRandomStyle } from "./lib/prompts.mjs";
import { pickImageScene } from "./lib/image-scenes.mjs";

// ── 환경변수 검증 ─────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
  console.error("필수 환경변수가 없습니다:");
  if (!SUPABASE_URL) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_KEY) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  if (!GEMINI_KEY) console.error("  - GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

const CATEGORIES = ["꿈해몽", "생활정보", "운세/심리"];
const MAX_DAILY = 3;
const DELAY_MS = 4000; // rate limit 방지

// ── 오늘 게시 수 확인 ──────────────────────────────────
async function getTodayPostCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  return count ?? 0;
}

// ── 최근 7일 카테고리별 게시 수 ─────────────────────────
async function getCategoryStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const stats = {};
  for (const cat of CATEGORIES) {
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("category", cat)
      .gte("created_at", weekAgo.toISOString());
    stats[cat] = count ?? 0;
  }
  return stats;
}

// ── 카테고리 우선순위 (적게 게시된 순) ──────────────────
function prioritizeCategories(stats) {
  return [...CATEGORIES].sort((a, b) => stats[a] - stats[b]);
}

// ── 기존 제목 조회 (중복 방지) ──────────────────────────
async function getRecentTitles(limit = 100) {
  const { data } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p) => p.title);
}

// ── AI로 동적 주제 생성 ─────────────────────────────────
async function generateDynamicTopic(category, existingTitles) {
  const prompt = buildTopicGenerationPrompt(category, existingTitles);

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.9, maxOutputTokens: 256 },
  });

  const raw = result.text ?? "";
  const match = raw.match(/\{[\s\S]*"topic"[\s\S]*\}/);
  if (!match) return null;

  const parsed = JSON.parse(match[0]);
  return parsed.topic ?? null;
}

// ── 주제 선택 (정적 50% + 동적 50%) ────────────────────
async function pickTopic(category, usedTitles) {
  // 50% 확률로 정적 풀 먼저 시도
  if (Math.random() < 0.5) {
    const staticPick = pickStaticTopic(category, usedTitles);
    if (staticPick) return staticPick.topic;
  }

  // 동적 생성 시도
  try {
    const dynamicTopic = await generateDynamicTopic(category, usedTitles);
    if (dynamicTopic) return dynamicTopic;
  } catch (err) {
    console.log(`  △ 동적 주제 생성 실패: ${err.message?.slice(0, 50)}`);
  }

  // 폴백: 정적 풀
  const fallback = pickStaticTopic(category, usedTitles);
  return fallback?.topic ?? null;
}

// ── 기사 텍스트 생성 ────────────────────────────────────
async function generateArticle(topic, category) {
  const style = pickRandomStyle();
  const prompt = buildPrompt(category, style);

  console.log(`  스타일: ${style.name}`);

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}\n\n카테고리: ${category}\n주제: ${topic}\n\n위 주제로 기사를 작성해주세요.`,
    config: { temperature: 0.85, maxOutputTokens: 4096 },
  });

  const raw = result.text ?? "";
  const match = raw.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
  if (!match) throw new Error("JSON 파싱 실패");

  const parsed = JSON.parse(match[0]);
  // 볼드체 제거
  parsed.content = parsed.content.replace(/\*\*([^*]+)\*\*/g, "$1");
  return parsed;
}

// ── 썸네일 이미지 생성 ──────────────────────────────────
async function generateAndUploadImage(category) {
  const imagePrompt = pickImageScene(category);
  if (!imagePrompt) return null;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: imagePrompt,
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const parts = result.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      const fileName = `auto/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.png`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(fileName, buffer, { contentType: "image/png", upsert: true });

      if (error) throw new Error(`업로드 실패: ${error.message}`);

      const { data } = supabase.storage.from("post-images").getPublicUrl(fileName);
      return data.publicUrl;
    }
  }
  return null;
}

// ── 메인 실행 ─────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  비몽사몽 자동 게시글 생성                  ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // 1. 오늘 게시 수 확인
  const todayCount = await getTodayPostCount();
  const remaining = MAX_DAILY - todayCount;
  console.log(`오늘 게시된 글: ${todayCount}건 / 최대 ${MAX_DAILY}건`);

  if (remaining <= 0) {
    console.log("오늘은 이미 충분히 게시되었습니다. 스킵합니다.\n");
    return;
  }
  console.log(`생성할 글: ${remaining}건\n`);

  // 2. 카테고리 우선순위 결정
  const stats = await getCategoryStats();
  const ordered = prioritizeCategories(stats);
  console.log("최근 7일 카테고리별 게시 수:");
  for (const cat of ordered) {
    console.log(`  ${cat}: ${stats[cat]}건`);
  }
  console.log();

  // 3. 기존 제목 조회
  const usedTitles = await getRecentTitles(100);

  // 4. 글 생성
  const results = [];
  const categoriesToUse = ordered.slice(0, remaining);

  for (let i = 0; i < categoriesToUse.length; i++) {
    const category = categoriesToUse[i];
    console.log(`[${i + 1}/${categoriesToUse.length}] ${category}`);

    // 4-1. 주제 선택
    const topic = await pickTopic(category, usedTitles);
    if (!topic) {
      console.log("  ✗ 주제를 선택할 수 없습니다. 스킵.\n");
      continue;
    }
    console.log(`  주제: ${topic}`);

    // 4-2. 기사 텍스트 생성
    let article;
    try {
      article = await generateArticle(topic, category);
      console.log(`  ✓ 텍스트: "${article.title}" (${article.content.length}자)`);
    } catch (err) {
      console.log(`  ✗ 텍스트 생성 실패: ${err.message}`);
      continue;
    }

    // 4-3. 대기 (rate limit)
    await new Promise((r) => setTimeout(r, DELAY_MS));

    // 4-4. 썸네일 이미지 생성
    let thumbnailUrl = null;
    try {
      thumbnailUrl = await generateAndUploadImage(category);
      if (thumbnailUrl) {
        console.log("  ✓ 이미지 업로드 완료");
      } else {
        console.log("  △ 이미지 생성 결과 없음 (스킵)");
      }
    } catch (err) {
      console.log(`  △ 이미지 생성 스킵: ${err.message?.slice(0, 60)}`);
    }

    // 4-5. DB 삽입
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: article.title,
          content: article.content,
          category,
          thumbnail: thumbnailUrl,
        })
        .select("id, title, created_at")
        .single();

      if (error) throw error;

      console.log(`  ✓ DB 삽입: ${data.id}`);
      results.push(data);
      usedTitles.push(article.title);
    } catch (err) {
      console.log(`  ✗ DB 삽입 실패: ${err.message}`);
    }

    console.log();

    // 다음 글 전 대기
    if (i < categoriesToUse.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // 5. 결과 요약
  console.log("══════════════════════════════════════════════");
  console.log(`완료: ${results.length}/${remaining}건 게시`);
  console.log("══════════════════════════════════════════════\n");

  for (const r of results) {
    const d = new Date(r.created_at).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log(`${d} | ${r.title}`);
  }
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
