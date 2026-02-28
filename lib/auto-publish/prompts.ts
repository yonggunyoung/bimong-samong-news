/**
 * 통합 프롬프트 빌더
 *
 * 매 호출마다 조합이 달라짐:
 * persona(8) × category(3) × structure(3~4) × introHook(6) × conclusion(5) × antiPatterns(C(8,4))
 * = 약 25,000+ 고유 조합
 */

import type { Category } from "@/types";
import { pickPersona, type Persona } from "./personas";
import { CATEGORY_PROMPTS, pickStructure } from "./category-prompts";
import { pickAntiPatterns } from "./anti-patterns";
import {
  pickIntroHook,
  pickSectionPattern,
  pickConclusionType,
} from "./structural-variety";

export interface PromptConfig {
  /** 선택된 페르소나 */
  persona: Persona;
  /** 카테고리 */
  category: Category;
  /** temperature (0.7~0.95 랜덤) */
  temperature: number;
  /** maxOutputTokens (2048~4096 랜덤) */
  maxOutputTokens: number;
}

interface BuildResult {
  systemPrompt: string;
  config: PromptConfig;
}

/**
 * 카테고리 기반 통합 프롬프트 생성
 * 매번 다른 조합의 프롬프트가 나옴
 */
export function buildAutoPublishPrompt(category: Category): BuildResult {
  const persona = pickPersona();
  const catPrompt = CATEGORY_PROMPTS[category];
  const structure = pickStructure(category);
  const introHook = pickIntroHook();
  const sectionPattern = pickSectionPattern();
  const conclusionType = pickConclusionType();
  const antiPatterns = pickAntiPatterns(4);

  const temperature = 0.7 + Math.random() * 0.25; // 0.7~0.95
  const maxOutputTokens = 2048 + Math.floor(Math.random() * 2049); // 2048~4096

  const systemPrompt = `${catPrompt.systemRole}

당신의 필명은 "${persona.name}". 이 글은 "${persona.name}"의 목소리로 써주세요.
${persona.voice}

고유 습관:
${persona.quirks.map((q) => `- ${q}`).join("\n")}

## 도입부
${introHook}

좋은 도입부 예시:
"${catPrompt.exampleOpening}"

## 본문 구조
전개 방식: ${structure}
섹션 패턴: ${sectionPattern}

## 마무리
${conclusionType}

## 전문성
${catPrompt.expertiseAngle}

## 절대 금지
- 별표 두 개(**볼드**) 사용 금지
- "첫째/둘째/셋째", "1. 2. 3." 기계적 나열 금지
- 한 문단에 모든 정보를 우겨넣지 마세요
${catPrompt.forbiddenPatterns.map((p) => `- ${p}`).join("\n")}

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

  return {
    systemPrompt,
    config: { persona, category, temperature, maxOutputTokens },
  };
}

/**
 * 관리자 글쓰기용 프롬프트 (이미지 프롬프트 포함)
 */
export function buildAdminPrompt(category: Category): BuildResult {
  const result = buildAutoPublishPrompt(category);

  // 이미지 플레이스홀더 + imagePrompts 지시 추가
  const imageAddendum = `

## 이미지 배치
- 본문 중간에 {{IMAGE_1}}, {{IMAGE_2}}, {{IMAGE_3}} 플레이스홀더를 넣으세요.
- 각 플레이스홀더는 별도 줄에 단독으로 배치하세요.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{"title": "기사 제목", "content": "마크다운 본문 내용", "imagePrompts": ["이미지1 영어 프롬프트", "이미지2 영어 프롬프트", "이미지3 영어 프롬프트"]}

imagePrompts 작성 규칙:
- 실제 다큐멘터리 포토그래퍼가 현장에서 찍은 것처럼 묘사하세요.
- 불완전한 디테일(구겨진 이불, 김 서린 창문, 낡은 벽지 등)이 리얼함을 만듭니다.
- 자연광만 사용하세요. 시간대를 구체적으로 지정하세요.
- 사람 얼굴은 보이지 않게 (뒷모습, 실루엣, 손만 클로즈업).
- 한국적 배경(아파트, 한옥, 편의점, 지하철 등)을 사용하세요.
- 프롬프트 끝에 "35mm film grain, shot on Canon EOS R5 with 85mm f/1.4 lens, natural available light only, documentary style editorial photography, imperfect authentic details, no AI artifacts, no synthetic look" 추가.

title에는 # 기호를 넣지 마세요.
content에는 **볼드**를 절대 사용하지 마세요.`;

  // 기존 응답 형식 섹션을 이미지 포함 버전으로 교체
  const systemPrompt = result.systemPrompt.replace(
    /## 응답 형식[\s\S]*$/,
    imageAddendum.trim()
  );

  return { systemPrompt, config: result.config };
}
