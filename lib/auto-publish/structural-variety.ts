/**
 * 글 구조 랜덤화 — 도입/섹션/마무리 패턴
 */

export const INTRO_HOOKS = [
  "장면묘사: 특정 시간, 장소, 감각을 묘사하며 시작하세요. (예: '새벽 3시, 이불 속에서 눈을 떴다.')",
  "통계/팩트: 의외의 숫자나 연구 결과로 시작하세요. (예: '한국인의 78%가 이 경험을 해봤다고 합니다.')",
  "질문: 독자에게 직접 질문을 던지며 시작하세요. (예: '혹시 이런 적 있으신가요?')",
  "에피소드: 가상의 인물이나 본인 경험으로 시작하세요. (예: '30대 직장인 민수 씨의 이야기입니다.')",
  "오해 뒤집기: 상식이라고 여기는 것을 뒤집으며 시작하세요. (예: '많은 사람들이 ~라고 생각하는데, 사실은 반대입니다.')",
  "고백/고백형: 솔직한 감정이나 약점을 드러내며 시작하세요. (예: '솔직히 말하면 저도 이게 무서웠어요.')",
];

export const SECTION_PATTERNS = [
  "질문형 소제목: 각 섹션 제목을 질문으로 쓰세요. (예: '## 왜 이런 꿈을 꾸는 걸까요?')",
  "단정문 소제목: 짧고 강렬한 선언형 소제목. (예: '## 원인은 생각보다 단순합니다')",
  "소제목 없이 자연스러운 전환: ##을 쓰지 않고, 문단 사이에 질문이나 전환문으로 흐름을 이어가세요.",
  "대화체 전환: 중간에 가상의 대화를 넣어 생동감을 주세요. (예: '\"그게 정말이에요?\" 네, 정말이에요.')",
];

export const CONCLUSION_TYPES = [
  "여운형: 짧은 한 문장으로 깊은 여운을 남기세요.",
  "과제형: 독자에게 오늘 해볼 수 있는 작은 행동을 제안하세요.",
  "열린 질문형: 답을 내리지 않고 독자 스스로 생각하게 질문으로 마무리하세요.",
  "수미상관: 도입부의 장면이나 이미지를 마지막에 다시 가져와 원을 완성하세요.",
  "편지체: 독자에게 짧은 편지를 쓰듯 따뜻하게 마무리하세요.",
];

export function pickIntroHook(): string {
  return INTRO_HOOKS[Math.floor(Math.random() * INTRO_HOOKS.length)];
}

export function pickSectionPattern(): string {
  return SECTION_PATTERNS[Math.floor(Math.random() * SECTION_PATTERNS.length)];
}

export function pickConclusionType(): string {
  return CONCLUSION_TYPES[Math.floor(Math.random() * CONCLUSION_TYPES.length)];
}
