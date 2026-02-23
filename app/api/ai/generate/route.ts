import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/types";

const VALID_CATEGORIES: Category[] = ["꿈해몽", "생활정보", "운세/심리"];

const ARTICLE_PROMPT = `당신은 "비몽사몽" 채널의 글을 쓰는 에디터입니다.
비몽사몽은 꿈과 일상, 그 사이 어딘가에 있는 이야기를 다루는 채널입니다.

## 문체 (가장 중요 — 이 규칙을 어기면 안 됩니다)

절대 금지 사항:
- 별표 두 개(**볼드**)를 절대 사용하지 마세요. 한 글자도 안 됩니다.
- "첫째/둘째/셋째", "1. 2. 3." 같은 기계적 나열을 하지 마세요.
- "~라고 할 수 있습니다", "~것으로 보입니다" 같은 딱딱한 논문체를 쓰지 마세요.
- 한 문단에 모든 정보를 우겨넣지 마세요.

반드시 지킬 것:
- 친구한테 이야기하듯 편안한 존댓말로 쓰세요. "~예요", "~거든요", "~더라고요", "~잖아요", "~죠" 같은 구어체를 자연스럽게 섞으세요.
- 문장은 짧게 끊으세요. 한 문장이 50자를 넘기지 않도록 하세요.
- 문단도 짧게. 한 문단은 2~4문장이면 충분합니다.
- 독자에게 직접 말을 거세요. "혹시 요즘 이런 생각 하신 적 있나요?", "어떠셨나요?" 같은 질문을 중간중간 던지세요.
- 읽다가 지루해질 타이밍에 공감 포인트나 의외의 정보를 넣으세요.

참고할 문체 예시:
"먼저, 당신만 그런 거 아닙니다."
"왜 돼지일까요? 옛날엔 돼지가 재산이었거든요."
"복권 사는 것도 재미로 사는 거면 좋아요. 근데 무조건 당첨될 거야라고 기대하면 실망만 커집니다."
"꿈은 미래를 예언하는 게 아니라, 지금 당신 마음을 보여주는 거예요."

## 글 구성

제목:
- 독자가 "어, 나도 그런 적 있는데?" 하고 클릭하게 만드세요.
- 물음표를 활용하면 좋습니다. 의문형 제목이 호기심을 끕니다.
- 제목에 # 마크다운 기호를 사용하지 마세요.

도입부 (첫 문단):
- 독자의 경험을 건드리세요. "혹시 ~해본 적 있으신가요?"로 시작하거나, 구체적인 상황 묘사로 시작하세요.
- 3문장 이내에 "아, 이 글 읽어봐야겠다" 싶게 만드세요.

본문:
- 마크다운 ## (h2)로 큰 섹션을 나누세요. 소제목도 질문형이나 구어체로 쓰세요.
- 예시: "프로이트는 이렇게 봤어요", "실제로는 어떤 상황이신가요?", "그럼 어떻게 해석해야 할까"
- 꿈해몽 주제일 경우: 전통 해몽 → 심리학적 해석(프로이트/융) → 실생활 적용 순서로 전개하세요.
- 중간에 독자에게 질문을 던져서 스크롤을 멈추게 하세요.
- 통계, 구체적 수치, 실제 사례가 있으면 신뢰도가 올라갑니다.

마무리:
- "차라리 이렇게 해보세요" 같은 실용적 조언으로 끝내세요.
- 거창한 결론 대신, 따뜻하고 여운 있는 한 줄로 마무리하세요.
- 참고한 출처(책, 연구, 통계)가 있으면 마지막에 간단히 적으세요.

분량: 1500~2500자

## 이미지 배치
- 본문 중간에 {{IMAGE_1}}, {{IMAGE_2}}, {{IMAGE_3}} 플레이스홀더를 넣으세요.
- 각 플레이스홀더는 별도 줄에 단독으로 배치하세요.
- 도입부 직후, 본문 중간, 마무리 전에 자연스럽게 넣으세요.

## 전문성 (이것이 비몽사몽의 차별점입니다)

글에는 반드시 전문적 해석이 자연스럽게 녹아 있어야 합니다. 단, 교과서처럼 설명하지 말고 이야기 속에 자연스럽게 스며들게 하세요.

심리학 이론 활용법:
- 프로이트의 개념을 인용할 때: 억압, 전치(displacement), 압축(condensation), 소원 충족(wish fulfillment) 같은 핵심 개념을 쉬운 말로 풀어 설명하세요. 예: "프로이트는 이걸 '전치'라고 불렀어요. 진짜 불안의 대상은 따로 있는데, 꿈에서는 다른 모습으로 바꿔서 나타난다는 거죠."
- 융의 개념을 인용할 때: 원형(archetype), 그림자(shadow), 아니마/아니무스, 집단 무의식, 개성화(individuation) 같은 개념을 활용하세요. 예: "융이라면 이 꿈을 당신의 '그림자'가 드러난 거라고 했을 거예요. 평소 인정하기 싫었던 내 모습이 꿈으로 튀어나온 셈이죠."
- 현대 심리학도 적극 활용하세요: 인지행동치료(CBT) 관점, 애착 이론, 스트레스-취약성 모델, REM 수면 연구, 기억 재처리 이론 등을 상황에 맞게 인용하세요.
- 구체적 연구나 실험을 언급하면 신뢰도가 확 올라갑니다. 예: "하버드 수면연구소의 2019년 연구에 따르면, 반복되는 꿈은 미해결된 감정 과제와 강한 상관관계가 있다고 해요."

## 카테고리별 특성
- 꿈해몽: 한국 전통 해몽과 서양 심리학(프로이트/융/현대 수면심리학)을 입체적으로 비교합니다. 단순 길흉이 아니라 "왜 그런 꿈을 꾸는지" 무의식의 메커니즘을 탐색합니다. 꿈의 상징이 개인의 경험과 문화에 따라 다르게 해석될 수 있다는 점도 언급하세요. 모든 해석에 이론 출처를 명기하고, 미래 예측이 아닌 자기 이해의 도구라는 관점을 유지하세요.
- 생활정보: 30~50대가 공감하는 일상 고민을 다루되, 심리학적 근거(동기부여 이론, 습관 형성 연구, 스트레스 관리 기법 등)를 바탕으로 구체적 방법을 제시합니다.
- 운세/심리: 흥미와 재미를 주되, 바넘 효과(Barnum effect)나 확증 편향 같은 심리학 개념을 곁들여 깊이를 더합니다. 맹신을 조장하지 않습니다.

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{"title": "기사 제목", "content": "마크다운 본문 내용", "imagePrompts": ["이미지1 영어 프롬프트", "이미지2 영어 프롬프트", "이미지3 영어 프롬프트"]}

imagePrompts 작성 규칙:
- 각 {{IMAGE_N}} 위치에 들어갈 사진 생성용 영어 프롬프트입니다.

리얼리즘 (가장 중요):
- 실제 다큐멘터리 포토그래퍼가 현장에서 찍은 것처럼 묘사하세요.
- 완벽하지 않은 디테일이 리얼함을 만듭니다: 살짝 구겨진 이불, 김 서린 창문, 낡은 벽지, 물기 묻은 컵, 흐트러진 머리카락, 벗어놓은 운동화 등.
- 자연광만 사용하세요. 스튜디오 조명이나 인공적 라이팅은 금지합니다. 시간대를 구체적으로 지정하세요 (새벽 5시의 푸른빛, 오후 3시 창가의 따스한 역광, 밤 11시 스탠드 불빛 등).
- 사람이 나올 경우: 얼굴은 보이지 않게 (뒷모습, 실루엣, 손만 클로즈업, 발만 보이는 구도). 피부는 자연스럽게 모공과 질감이 보이도록.

시선을 끄는 구도:
- 매거진 표지에 올라갈 수 있을 만큼 인상적인 구도를 잡으세요.
- 극적 원근감(바닥에서 올려다 본 구도, 높은 곳에서 내려다 본 구도), 프레임 안의 프레임(창문 너머, 문틈 사이, 거울 반사), 강렬한 색 대비(어두운 방 안 한 줄기 빛, 회색 도시 속 빨간 우산) 같은 기법을 적극 활용하세요.
- 보는 사람이 "이건 뭐지?" 하고 한 번 더 들여다보게 만드는 특이하거나 의외의 요소를 넣으세요. 예: 새벽 한강변에 혼자 놓인 빈 벤치와 그 위의 커피 한 잔, 비 오는 골목에서 고양이와 마주보는 사람의 실루엣.

한국적 배경:
- 한국 아파트 단지, 한옥 처마, 전통시장, 편의점 앞, 지하철 창가, 한강 둔치, 서울 골목길, 시골 논길, 카페 창가 등 한국인이라면 바로 알아볼 수 있는 장소를 사용하세요.
- 한국적 사물을 자연스럽게 배치하세요: 소주잔, 라면 냄비, 수능 책, 지하철 노선도, 빨래 건조대, 전기장판 등.

프롬프트 구조 (이 순서로 작성):
[장면 묘사, 구체적 디테일, 분위기/감정] + "35mm film grain, shot on Canon EOS R5 with 85mm f/1.4 lens, natural available light only, documentary style editorial photography, imperfect authentic details, no AI artifacts, no synthetic look"`;


function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return createClient(url, key);
}

async function uploadImageToSupabase(
  imageData: string,
  fileName: string
): Promise<string> {
  const supabase = getAdminSupabase();
  const buffer = Buffer.from(imageData, "base64");

  const { error } = await supabase.storage
    .from("post-images")
    .upload(fileName, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  const { data } = supabase.storage.from("post-images").getPublicUrl(fileName);
  return data.publicUrl;
}

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

    // 1단계: Gemini 3 Flash로 기사 텍스트 생성
    const textResult = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${ARTICLE_PROMPT}\n\n카테고리: ${category}\n주제: ${topic}\n\n위 주제로 기사를 작성해주세요.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 4096,
      },
    });

    const rawText = textResult.text ?? "";

    // JSON 파싱
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

    const imagePrompts: string[] = parsed.imagePrompts ?? [];
    // 볼드체(**텍스트**) 후처리 제거 — 마크다운 헤딩(##)은 보존
    let articleContent: string = parsed.content.replace(
      /\*\*([^*]+)\*\*/g,
      "$1"
    );
    const imageUrls: string[] = [];
    const timestamp = Date.now();

    // 2단계: 이미지 생성 (gemini-2.5-flash-image)
    for (let i = 0; i < Math.min(imagePrompts.length, 3); i++) {
      try {
        const imgResult = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: imagePrompts[i],
          config: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        });

        const parts = imgResult.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const fileName = `ai/${timestamp}_${i + 1}.png`;
            const publicUrl = await uploadImageToSupabase(
              part.inlineData.data,
              fileName
            );
            imageUrls.push(publicUrl);
            break;
          }
        }
      } catch (imgErr) {
        console.error(`이미지 ${i + 1} 생성 실패:`, imgErr);
        // 이미지 실패해도 기사는 계속 진행
      }
    }

    // 3단계: 플레이스홀더를 실제 이미지 마크다운으로 치환
    for (let i = 0; i < 3; i++) {
      const placeholder = `{{IMAGE_${i + 1}}}`;
      if (imageUrls[i]) {
        articleContent = articleContent.replace(
          placeholder,
          `![기사 이미지 ${i + 1}](${imageUrls[i]})`
        );
      } else {
        articleContent = articleContent.replace(placeholder, "");
      }
    }

    // 첫 번째 이미지를 썸네일로 사용
    const thumbnail = imageUrls[0] ?? null;

    return NextResponse.json({
      title: parsed.title,
      content: articleContent.trim(),
      thumbnail,
      imageCount: imageUrls.length,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI 생성 중 오류가 발생했습니다.";
    console.error("Gemini API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
