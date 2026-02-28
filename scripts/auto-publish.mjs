/**
 * 비몽사몽 자동 게시글 생성 스크립트 (로컬 폴백용)
 * 서버에서는 Vercel Cron (/api/cron/auto-publish) 사용.
 * 로컬에서 수동 실행: npm run auto-publish
 *
 * Usage: node --env-file=.env.local scripts/auto-publish.mjs
 */

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { pickStaticTopic } from "./lib/topic-pools.mjs";
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
const DELAY_MS = 4000;

// ── 페르소나 (lib/auto-publish/personas.ts와 동기화) ───
const PERSONAS = [
  { name: "베테랑 기자", voice: "담백하고 팩트 중심. 감정을 절제하고 단정적으로 씁니다. '~입니다', '~했습니다' 종결.", quirks: ["짧은 문장으로 끊어 씁니다", "감정 표현 대신 수치와 사실을 제시합니다", "'사실은', '실제로는' 같은 전환어를 자주 씁니다"] },
  { name: "따뜻한 언니", voice: "공감 100%. '~거든요', '~잖아요', '~더라고요' 종결을 자주 씁니다. 개인 에피소드를 많이 섞고, 독자를 다정하게 대합니다.", quirks: ["'~거든요', '~잖아요' 종결을 자연스럽게 섞습니다", "가끔 '사실 저도요...'로 자기 이야기를 꺼냅니다", "독자를 '우리'로 묶어서 표현합니다"] },
  { name: "덕후 연구자", voice: "신나서 TMI를 쏟아냅니다. 논문이나 연구를 인용하고, 괄호로 부연설명을 많이 합니다.", quirks: ["괄호 안에 부연 설명을 자주 넣습니다", "'사실', '정확히 말하면' 같은 표현을 즐겨 씁니다", "구체적인 연구명, 연도, 학교명을 언급합니다"] },
  { name: "실용파 직장인", voice: "효율 중시. '바로 써먹을 수 있는 것만' 전달합니다. 문장이 짧고 직설적.", quirks: ["군더더기를 싫어해서 문장이 매우 짧습니다", "'핵심은', '결론은' 같은 요약 표현을 씁니다", "경험에서 나온 실전 팁을 강조합니다"] },
  { name: "철학적 에세이스트", voice: "은유가 풍부하고 문학적입니다. 여운을 남기는 마무리를 좋아합니다.", quirks: ["은유와 비유를 자연스럽게 씁니다", "문단 끝에 여운을 남기는 짧은 문장을 넣습니다", "자연이나 계절을 빗대어 설명합니다"] },
  { name: "유쾌한 아재", voice: "아재개그를 섞되 진지한 내용도 전달합니다. 옛날이야기를 즐기고, 교훈적인 마무리.", quirks: ["가벼운 유머나 말장난을 중간에 넣습니다", "세대를 넘나드는 비교를 즐깁니다", "경험담을 '예전에 말이죠...'로 시작합니다"] },
  { name: "Z세대 톤", voice: "짧고 임팩트 있게. 가볍지만 정보는 정확합니다. 신조어를 약간 섞고 직관적으로 전달합니다.", quirks: ["문장이 매우 짧고 리듬감이 있습니다", "'진짜', '솔직히', '근데' 같은 구어체를 적극 씁니다", "어려운 개념을 일상 비유로 바로 풀어냅니다"] },
  { name: "동양철학 스타일", voice: "음양오행 비유와 자연 은유를 사용합니다. 전통적 관점에서 현대를 해석하고, 차분하고 깊이 있는 톤.", quirks: ["자연 현상에 빗대어 설명합니다", "한자어 개념을 괄호와 함께 풀어서 씁니다", "전통 지혜와 현대 과학을 연결합니다"] },
];

// ── 카테고리별 프롬프트 ──────────────────────────────
const CAT_PROMPTS = {
  "꿈해몽": {
    systemRole: "당신은 꿈 분석 전문가이자 심리학 칼럼니스트입니다. 프로이트, 융, 현대 수면심리학에 깊은 이해가 있으며, 한국 전통 해몽도 잘 알고 있습니다.",
    expertiseAngle: "한국 전통 해몽과 서양 심리학을 입체적으로 비교하세요. 꿈의 상징이 개인의 경험과 문화에 따라 다르게 해석될 수 있다는 점을 강조하세요.",
    forbiddenPatterns: ["이 꿈을 꾸면 반드시 ~합니다", "길몽/흉몽으로 단정하는 표현"],
    exampleOpening: "새벽 3시, 식은땀을 흘리며 깨어난 적 있나요.",
  },
  "생활정보": {
    systemRole: "당신은 심리학 기반 라이프스타일 에디터입니다. 30~50대가 공감하는 일상의 고민을 다루되, 심리학적 근거를 바탕으로 구체적이고 실천 가능한 방법을 제시합니다.",
    expertiseAngle: "'해보세요' 식의 뻔한 조언 대신, '왜 그게 효과가 있는지'를 심리학적 근거와 함께 설명하세요.",
    forbiddenPatterns: ["~하면 인생이 바뀝니다", "성공한 사람들은 모두 ~"],
    exampleOpening: "월요일 아침 7시. 알람이 울리고, 눈은 떴는데 몸이 안 움직여요.",
  },
  "운세/심리": {
    systemRole: "당신은 심리학을 전공한 문화 칼럼니스트입니다. 운세, 점, 사주 같은 전통 문화에 대해 흥미롭게 다루되, 바넘 효과나 확증 편향 같은 심리학 개념을 곁들입니다.",
    expertiseAngle: "한국 전통 문화와 현대 심리학을 연결하세요. '재미로 보되, 이런 심리가 작동해요'라는 균형 잡힌 시각을 유지하세요.",
    forbiddenPatterns: ["~좌는 반드시 ~합니다", "운명은 정해져 있습니다"],
    exampleOpening: "핸드폰 시계를 봤는데 11:11이에요.",
  },
};

const INTRO_HOOKS = [
  "장면묘사: 특정 시간, 장소, 감각을 묘사하며 시작하세요.",
  "통계/팩트: 의외의 숫자나 연구 결과로 시작하세요.",
  "질문: 독자에게 직접 질문을 던지며 시작하세요.",
  "에피소드: 가상의 인물이나 본인 경험으로 시작하세요.",
  "오해 뒤집기: 상식을 뒤집으며 시작하세요.",
  "고백형: 솔직한 감정이나 약점을 드러내며 시작하세요.",
];

const SECTION_PATTERNS = [
  "질문형 소제목: 각 섹션 제목을 질문으로 쓰세요.",
  "단정문 소제목: 짧고 강렬한 선언형 소제목.",
  "소제목 없이 자연스러운 전환: 문단 사이에 질문이나 전환문으로 흐름을 이어가세요.",
  "대화체 전환: 중간에 가상의 대화를 넣어 생동감을 주세요.",
];

const CONCLUSION_TYPES = [
  "여운형: 짧은 한 문장으로 깊은 여운을 남기세요.",
  "과제형: 독자에게 오늘 해볼 수 있는 작은 행동을 제안하세요.",
  "열린 질문형: 답을 내리지 않고 질문으로 마무리하세요.",
  "수미상관: 도입부의 장면이나 이미지를 다시 가져와 원을 완성하세요.",
  "편지체: 독자에게 짧은 편지를 쓰듯 마무리하세요.",
];

const ANTI_PATTERNS = [
  '"~에 대해 알아보겠습니다" / "~에 대해 살펴보겠습니다"',
  '"마무리하며" / "마치며" / "글을 마무리하면서"',
  '"다양한" / "풍부한" / "중요한" 같은 의미 없는 수식어',
  '"자, 그럼 시작해볼까요?" 같은 인위적 전환',
  '"~라고 할 수 있습니다" / "~것으로 보입니다" 같은 논문체',
  '"오늘은 ~ 주제로 이야기해보려고 합니다" 같은 서론',
  '"여러분" 반복 호칭 (한 글에 2번 이상)',
  '"~하는 것이 좋습니다" 반복',
  '"이처럼" / "이렇듯" / "이와 같이" 같은 접속어 남용',
  '"흥미롭게도" / "놀랍게도" / "재미있게도" 반복',
  '"~하는 것은 물론이고" 같은 기계적 나열',
  '"지금까지 ~에 대해 알아보았습니다" 같은 요약 맺음',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }

function buildPrompt(category) {
  const persona = pick(PERSONAS);
  const cat = CAT_PROMPTS[category];
  const introHook = pick(INTRO_HOOKS);
  const sectionPattern = pick(SECTION_PATTERNS);
  const conclusionType = pick(CONCLUSION_TYPES);
  const antiPatterns = pickN(ANTI_PATTERNS, 4);
  const temperature = 0.7 + Math.random() * 0.25;
  const maxOutputTokens = 2048 + Math.floor(Math.random() * 2049);

  const systemPrompt = `${cat.systemRole}

당신의 필명은 "${persona.name}". 이 글은 "${persona.name}"의 목소리로 써주세요.
${persona.voice}

고유 습관:
${persona.quirks.map((q) => `- ${q}`).join("\n")}

## 도입부
${introHook}

좋은 도입부 예시:
"${cat.exampleOpening}"

## 본문 구조
섹션 패턴: ${sectionPattern}

## 마무리
${conclusionType}

## 전문성
${cat.expertiseAngle}

## 절대 금지
- 별표 두 개(**볼드**) 사용 금지
- "첫째/둘째/셋째", "1. 2. 3." 기계적 나열 금지
- 한 문단에 모든 정보를 우겨넣지 마세요
${cat.forbiddenPatterns.map((p) => `- ${p}`).join("\n")}

아래 표현은 절대 쓰지 마세요:
${antiPatterns.map((p) => `- ${p}`).join("\n")}

## 문체
- 문장은 짧게 끊으세요. 한 문장이 50자를 넘기지 않도록.
- 문단도 짧게. 2~4문장이면 충분합니다.
- 독자에게 직접 말을 거세요.
- 분량: 1500~2500자

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{"title": "기사 제목", "content": "마크다운 본문 내용"}

title에는 # 기호를 넣지 마세요.
content에는 **볼드**를 절대 사용하지 마세요.`;

  return { systemPrompt, persona, temperature, maxOutputTokens };
}

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

function prioritizeCategories(stats) {
  return [...CATEGORIES].sort((a, b) => stats[a] - stats[b]);
}

async function getRecentTitles(limit = 100) {
  const { data } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p) => p.title);
}

// ── 기사 텍스트 생성 ────────────────────────────────────
async function generateArticle(topic, category) {
  const { systemPrompt, persona, temperature, maxOutputTokens } = buildPrompt(category);
  console.log(`  페르소나: ${persona.name}`);

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\n카테고리: ${category}\n주제: ${topic}\n\n위 주제로 기사를 작성해주세요.`,
    config: { temperature, maxOutputTokens },
  });

  const raw = result.text ?? "";
  const match = raw.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
  if (!match) throw new Error("JSON 파싱 실패");

  const parsed = JSON.parse(match[0]);
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
  console.log("║  비몽사몽 자동 게시글 생성 (로컬)           ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const todayCount = await getTodayPostCount();
  const remaining = MAX_DAILY - todayCount;
  console.log(`오늘 게시된 글: ${todayCount}건 / 최대 ${MAX_DAILY}건`);

  if (remaining <= 0) {
    console.log("오늘은 이미 충분히 게시되었습니다. 스킵합니다.\n");
    return;
  }
  console.log(`생성할 글: ${remaining}건\n`);

  const stats = await getCategoryStats();
  const ordered = prioritizeCategories(stats);
  console.log("최근 7일 카테고리별 게시 수:");
  for (const cat of ordered) {
    console.log(`  ${cat}: ${stats[cat]}건`);
  }
  console.log();

  const usedTitles = await getRecentTitles(100);

  const results = [];
  const categoriesToUse = ordered.slice(0, remaining);

  for (let i = 0; i < categoriesToUse.length; i++) {
    const category = categoriesToUse[i];
    console.log(`[${i + 1}/${categoriesToUse.length}] ${category}`);

    // 주제 선택 (정적 풀만 — 토큰 절약)
    const topic = pickStaticTopic(category, usedTitles);
    if (!topic) {
      console.log("  ✗ 주제를 선택할 수 없습니다. 스킵.\n");
      continue;
    }
    console.log(`  주제: ${topic.topic ?? topic}`);

    const topicStr = typeof topic === "string" ? topic : topic.topic;

    // 기사 텍스트 생성
    let article;
    try {
      article = await generateArticle(topicStr, category);
      console.log(`  ✓ 텍스트: "${article.title}" (${article.content.length}자)`);
    } catch (err) {
      console.log(`  ✗ 텍스트 생성 실패: ${err.message}`);
      continue;
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));

    // 썸네일 이미지 생성
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

    // DB 삽입
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

    if (i < categoriesToUse.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

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
