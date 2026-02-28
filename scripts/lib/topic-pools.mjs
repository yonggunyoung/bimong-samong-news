/**
 * 카테고리별 주제 풀
 * 정적 풀에서 50% + AI 동적 생성 50% 비율로 사용
 * 계절/시기 태그 포함 — 현재 월에 맞는 주제 우선 선택
 */

// 월별 태그: 해당 월에 우선 노출될 주제
// all = 연중 상시
const TAG = {
  ALL: "all",
  SPRING: "spring",     // 3~5월
  SUMMER: "summer",     // 6~8월
  AUTUMN: "autumn",     // 9~11월
  WINTER: "winter",     // 12~2월
  NEW_YEAR: "new_year", // 1월
  EXAM: "exam",         // 6, 11월
};

export const TOPIC_POOLS = {
  "꿈해몽": [
    // seed-backfill 기존 7건
    { topic: "이빨 빠지는 꿈, 치과 가라는 뜻이 아닙니다", tag: TAG.ALL },
    { topic: "물에 빠지는 꿈 — 감정의 파도에 휩쓸리고 있다는 신호", tag: TAG.ALL },
    { topic: "옛 연인이 꿈에 나왔을 때, 아직 미련이 있는 걸까", tag: TAG.ALL },
    { topic: "시험 꿈을 졸업하고도 계속 꾸는 사람들의 공통점", tag: TAG.EXAM },
    { topic: "불이 나는 꿈 — 파괴일까 정화일까", tag: TAG.ALL },
    { topic: "고양이가 꿈에 나타났다면 독립심에 대한 이야기일 수 있어요", tag: TAG.ALL },
    { topic: "아기가 나오는 꿈은 정말 태몽일까 — 새로운 시작의 상징", tag: TAG.ALL },
    // 확장
    { topic: "쫓기는 꿈을 자주 꾸는 사람, 무의식이 보내는 SOS", tag: TAG.ALL },
    { topic: "하늘을 나는 꿈 — 자유를 갈망하는 마음의 날갯짓", tag: TAG.SPRING },
    { topic: "뱀이 나오는 꿈, 한국에선 길몽이라는데 진짜일까", tag: TAG.ALL },
    { topic: "죽은 사람이 꿈에 나왔을 때, 그리움인지 메시지인지", tag: TAG.ALL },
    { topic: "길을 잃는 꿈 — 인생의 갈림길에서 자주 찾아옵니다", tag: TAG.ALL },
    { topic: "떨어지는 꿈이 반복된다면 불안장애 신호일 수 있어요", tag: TAG.ALL },
    { topic: "돼지 꿈 꾸면 정말 복권을 사야 할까?", tag: TAG.NEW_YEAR },
    { topic: "자동차 사고 나는 꿈 — 통제력을 잃고 있다는 경고", tag: TAG.ALL },
    { topic: "물고기 잡는 꿈, 정말 재물운과 관련 있을까", tag: TAG.ALL },
    { topic: "화장실 꿈을 자주 꾸는 사람에게 필요한 것", tag: TAG.ALL },
    { topic: "나체로 돌아다니는 꿈 — 수치심과 자기 노출의 심리학", tag: TAG.ALL },
    { topic: "지각하는 꿈, 완벽주의자들이 특히 많이 꾼다고요?", tag: TAG.ALL },
    { topic: "같은 꿈을 반복해서 꾸는 이유와 끊는 법", tag: TAG.ALL },
    { topic: "꿈에서 울었는데 진짜 눈물이 흐르는 이유", tag: TAG.ALL },
    { topic: "집이 나오는 꿈, 그 집의 상태가 지금 내 마음입니다", tag: TAG.ALL },
    { topic: "비 오는 꿈 — 감정 정화가 시작된 신호", tag: TAG.SUMMER },
    { topic: "누군가를 죽이는 꿈, 정말 무서운 꿈일까?", tag: TAG.ALL },
    { topic: "꽃이 피는 꿈 — 봄에 유독 많이 꾸는 이유", tag: TAG.SPRING },
    { topic: "시계가 나오는 꿈, 시간에 대한 불안을 말하고 있어요", tag: TAG.ALL },
    { topic: "눈(雪) 내리는 꿈 — 순수함의 회복인가 고립의 시작인가", tag: TAG.WINTER },
    { topic: "엘리베이터 꿈의 숨은 의미 — 오르내리는 감정", tag: TAG.ALL },
    { topic: "바다 꿈 — 잔잔함과 파도가 말해주는 감정의 깊이", tag: TAG.SUMMER },
    { topic: "학교로 돌아가는 꿈, 어른이 된 뒤에도 안 끝나는 숙제", tag: TAG.EXAM },
    { topic: "돈을 줍는 꿈 vs 돈을 잃는 꿈, 해석이 정반대?", tag: TAG.ALL },
    { topic: "결혼하는 꿈 — 진짜 결혼 예감일까 새 시작의 상징일까", tag: TAG.ALL },
    { topic: "산을 오르는 꿈 — 목표를 향한 무의식의 힘", tag: TAG.AUTUMN },
    { topic: "이사하는 꿈, 변화를 원하는 마음이 만든 이미지", tag: TAG.SPRING },
    { topic: "벌레가 나오는 꿈 — 작지만 거슬리는 고민이 있다는 뜻", tag: TAG.SUMMER },
    { topic: "문이 잠긴 꿈, 기회가 닫혔다고 느낄 때 찾아옵니다", tag: TAG.ALL },
    { topic: "가위눌림과 꿈의 관계 — 수면마비의 과학", tag: TAG.ALL },
    { topic: "꿈을 기억 못 하는 사람 vs 선명하게 기억하는 사람", tag: TAG.ALL },
    { topic: "전쟁이 나는 꿈, 내면의 갈등이 폭발하기 직전", tag: TAG.ALL },
    { topic: "음식 먹는 꿈 — 무엇을 채우고 싶은 건지 들여다보기", tag: TAG.WINTER },
    { topic: "강아지가 나오는 꿈 — 충성심과 우정에 대한 무의식", tag: TAG.ALL },
    { topic: "피가 나오는 꿈, 에너지 소진의 경고일 수 있어요", tag: TAG.ALL },
    { topic: "하늘에서 무언가 떨어지는 꿈 — 예상치 못한 변화의 전조", tag: TAG.ALL },
    { topic: "전화 받는 꿈 — 누군가의 메시지를 기다리고 있다는 뜻", tag: TAG.ALL },
    { topic: "자기 자신이 아이로 돌아간 꿈, 내면 아이가 부르는 소리", tag: TAG.ALL },
    { topic: "미로에 갇히는 꿈 — 선택지가 너무 많을 때 꾸게 됩니다", tag: TAG.ALL },
    { topic: "새가 나오는 꿈 — 자유와 영혼의 메타포", tag: TAG.SPRING },
    { topic: "다리를 건너는 꿈 — 인생 전환기의 시그널", tag: TAG.ALL },
    { topic: "빛이 보이는 꿈 — 깨달음인가 희망인가", tag: TAG.ALL },
    { topic: "밤하늘 별을 보는 꿈 — 이상과 현실 사이", tag: TAG.WINTER },
    { topic: "자연재해 꿈 — 감정의 쓰나미가 밀려오고 있어요", tag: TAG.SUMMER },
  ],

  "생활정보": [
    // seed-backfill 기존 7건
    { topic: "새해 목표 작심삼일 안 되는 진짜 이유와 해결법", tag: TAG.NEW_YEAR },
    { topic: "겨울철 수면 질이 떨어지는 이유와 숙면 꿀팁", tag: TAG.WINTER },
    { topic: "30대 넘으면 달라지는 몸 — 지금 시작해야 할 건강 습관", tag: TAG.ALL },
    { topic: "혼밥이 늘었는데 외로운 건 아닙니다 — 혼자 먹기의 심리학", tag: TAG.ALL },
    { topic: "계절성 우울증인지 그냥 귀찮은 건지 구별하는 법", tag: TAG.WINTER },
    { topic: "디지털 디톡스 3일 해봤더니 생긴 변화들", tag: TAG.ALL },
    { topic: "스트레스 받을 때 먹는 게 당기는 과학적 이유", tag: TAG.ALL },
    // 확장
    { topic: "아침형 인간이 되고 싶은데 자꾸 실패하는 사람을 위한 팁", tag: TAG.ALL },
    { topic: "잠들기 전 스마트폰, 실제로 수면에 얼마나 나쁠까?", tag: TAG.ALL },
    { topic: "점심 먹고 쏟아지는 졸음, 이건 게으른 게 아닙니다", tag: TAG.ALL },
    { topic: "봄만 되면 피곤한 이유 — 춘곤증의 과학", tag: TAG.SPRING },
    { topic: "미세먼지 심한 날 실내에서 할 수 있는 건강 루틴", tag: TAG.SPRING },
    { topic: "여름 불면증, 에어컨 틀고 자도 괜찮을까?", tag: TAG.SUMMER },
    { topic: "열대야에 숙면하는 5가지 과학적 방법", tag: TAG.SUMMER },
    { topic: "가을 우울감, 일조량 부족이 진짜 원인일까?", tag: TAG.AUTUMN },
    { topic: "환절기 면역력 지키는 생활 습관", tag: TAG.AUTUMN },
    { topic: "나이 들수록 잠이 줄어드는 건 자연스러운 걸까?", tag: TAG.ALL },
    { topic: "재택근무 2년 차, 번아웃이 온 것 같다면", tag: TAG.ALL },
    { topic: "카페인 끊으면 정말 달라질까? 30일 실험 결과", tag: TAG.ALL },
    { topic: "운동이 우울증에 효과가 있다는 연구, 얼마나 해야 할까?", tag: TAG.ALL },
    { topic: "야식 먹고 자면 진짜 살이 더 찔까?", tag: TAG.ALL },
    { topic: "주말에 몰아 자는 건 수면 부채를 갚는 게 아닙니다", tag: TAG.ALL },
    { topic: "감사 일기 쓰기, 정말 멘탈에 도움이 될까?", tag: TAG.ALL },
    { topic: "걷기 운동의 과학 — 하루 만 보가 아니라 이것이 기준", tag: TAG.ALL },
    { topic: "독서가 뇌에 미치는 영향 — 6분이면 스트레스가 줄어든다고?", tag: TAG.ALL },
    { topic: "40대 이후 꼭 받아야 할 건강검진 항목", tag: TAG.ALL },
    { topic: "소확행이 진짜 행복에 미치는 영향, 심리학의 답은?", tag: TAG.ALL },
    { topic: "직장에서 받는 스트레스, 주말이면 정말 풀릴까?", tag: TAG.ALL },
    { topic: "SNS를 줄이면 자존감이 올라간다는 연구 결과", tag: TAG.ALL },
    { topic: "향기로 수면의 질을 높이는 방법 — 아로마테라피의 과학", tag: TAG.ALL },
    { topic: "체중이 아니라 체지방이 중요한 진짜 이유", tag: TAG.ALL },
    { topic: "명상이 어려운 사람을 위한 초간단 마인드풀니스", tag: TAG.ALL },
    { topic: "자기 전 따뜻한 물 한 잔, 과학적으로 맞는 말일까?", tag: TAG.WINTER },
    { topic: "결혼 후 체중 증가, '행복 살'이라는 말의 진실", tag: TAG.ALL },
    { topic: "혼자 사는 사람이 알아두면 좋은 셀프 건강 체크법", tag: TAG.ALL },
    { topic: "장마철 우울함, 비 오는 날 기분이 가라앉는 과학적 이유", tag: TAG.SUMMER },
    { topic: "단풍 구경이 멘탈 건강에 좋다는 연구가 있어요", tag: TAG.AUTUMN },
    { topic: "크리스마스 블루, 연말에 외로워지는 심리학적 이유", tag: TAG.WINTER },
    { topic: "새해 다이어트, 의지력보다 환경 설계가 답인 이유", tag: TAG.NEW_YEAR },
    { topic: "하루 중 가장 창의적인 시간은 언제일까?", tag: TAG.ALL },
    { topic: "짧은 낮잠의 과학 — 몇 분이 최적인지 연구가 답했습니다", tag: TAG.ALL },
    { topic: "커피 마시는 최적 시간 — 코르티솔 리듬에 맞추면 달라요", tag: TAG.ALL },
    { topic: "정리 정돈이 멘탈에 미치는 영향 — 공간이 마음을 바꿉니다", tag: TAG.SPRING },
    { topic: "수면 앱은 정말 수면의 질을 측정할 수 있을까?", tag: TAG.ALL },
    { topic: "습관이 만들어지는 데 걸리는 진짜 시간 — 21일이 아닙니다", tag: TAG.ALL },
    { topic: "갱년기 수면 장애, 모르고 넘어가기 쉬운 증상들", tag: TAG.ALL },
    { topic: "반려동물이 수면에 미치는 영향 — 같이 자도 될까?", tag: TAG.ALL },
    { topic: "자기 전 스트레칭 5분이 수면의 질을 바꿉니다", tag: TAG.ALL },
    { topic: "직장인 점심시간 활용법 — 20분 산책의 효과", tag: TAG.ALL },
    { topic: "월요병은 진짜 병일까? 주간 리듬의 심리학", tag: TAG.ALL },
    { topic: "목욕 vs 샤워, 수면에 더 좋은 건 어느 쪽일까?", tag: TAG.ALL },
  ],

  "운세/심리": [
    // seed-backfill 기존 7건
    { topic: "왜 신년 운세를 보면 마음이 편해질까 — 바넘 효과 이야기", tag: TAG.NEW_YEAR },
    { topic: "데자뷰를 자주 겪는 사람의 뇌는 뭐가 다를까", tag: TAG.ALL },
    { topic: "MBTI 궁합, 심리학적으로 정말 의미 있을까", tag: TAG.ALL },
    { topic: "직감이 맞는 순간과 틀리는 순간, 그 차이는 뭘까", tag: TAG.ALL },
    { topic: "나이 들수록 시간이 빨리 가는 이유 — 심리학이 찾은 답", tag: TAG.ALL },
    { topic: "좋아하는 색깔로 보는 지금 내 심리 상태", tag: TAG.ALL },
    { topic: "혈액형 성격론, 믿는 사람은 왜 맞다고 느낄까", tag: TAG.ALL },
    // 확장
    { topic: "거울을 오래 보면 무서워지는 이유 — 트록슬러 효과", tag: TAG.ALL },
    { topic: "왜 우리는 점을 보러 갈까 — 불확실성과 마음의 관계", tag: TAG.ALL },
    { topic: "사주팔자, 과학으로 설명할 수 있는 부분이 있을까?", tag: TAG.ALL },
    { topic: "숫자 11:11을 자꾸 보게 되는 건 우연일까?", tag: TAG.ALL },
    { topic: "타로카드는 어떤 원리로 작동하는 걸까?", tag: TAG.ALL },
    { topic: "꿈을 꾸면 정말 무언가를 예감할 수 있을까?", tag: TAG.ALL },
    { topic: "인상학, 얼굴로 성격을 읽을 수 있다는 주장의 진실", tag: TAG.ALL },
    { topic: "별자리 운세, 왜 내 얘기 같을까 — 주관적 검증의 함정", tag: TAG.ALL },
    { topic: "봄에 연애 감정이 솟구치는 심리학적 이유", tag: TAG.SPRING },
    { topic: "여름밤 괴담이 더 무서운 이유 — 공포의 심리학", tag: TAG.SUMMER },
    { topic: "가을에 감성적이 되는 건 뇌 화학물질 때문입니다", tag: TAG.AUTUMN },
    { topic: "새해 결심이 대부분 실패하는 심리학적 메커니즘", tag: TAG.NEW_YEAR },
    { topic: "플라시보 효과와 부적 — 믿음이 만드는 현실", tag: TAG.ALL },
    { topic: "손금으로 미래를 본다? — 의사과학의 매력과 한계", tag: TAG.ALL },
    { topic: "왜 우리는 공포영화를 보면서도 즐거울까?", tag: TAG.ALL },
    { topic: "첫인상이 3초 만에 결정된다는 말, 심리학의 답은?", tag: TAG.ALL },
    { topic: "잘 때 꾸는 꿈으로 내일 운세를 볼 수 있다?", tag: TAG.ALL },
    { topic: "자기 실현적 예언 — 운세가 맞는 진짜 이유", tag: TAG.ALL },
    { topic: "풍수 인테리어, 심리학적으로 설명되는 부분이 있다", tag: TAG.ALL },
    { topic: "달의 위상과 감정 변화 — 보름달에 잠이 안 오는 이유", tag: TAG.ALL },
    { topic: "컬러 심리학 — 옷 색깔이 기분과 행동을 바꾼다?", tag: TAG.ALL },
    { topic: "행운을 믿는 사람이 정말 더 운이 좋을까?", tag: TAG.ALL },
    { topic: "향수가 기억을 소환하는 이유 — 프루스트 효과", tag: TAG.ALL },
    { topic: "왜 어떤 노래는 계속 머릿속에 맴돌까 — 이어웜의 심리학", tag: TAG.ALL },
    { topic: "얼굴 관상학 vs 심리학적 첫인상 — 어디까지 믿을 수 있나", tag: TAG.ALL },
    { topic: "미래에 대한 불안, 점(占)이 아니라 심리상담이 필요한 순간", tag: TAG.ALL },
    { topic: "동지에 팥죽을 먹는 이유 — 한국 세시풍속의 심리학", tag: TAG.WINTER },
    { topic: "MBTI가 바뀌는 사람 — 성격은 정말 변하는 걸까?", tag: TAG.ALL },
    { topic: "왜 우리는 비 오는 날 우울해질까 — 날씨와 심리의 관계", tag: TAG.SUMMER },
    { topic: "결정 장애의 심리학 — 선택이 어려운 진짜 이유", tag: TAG.ALL },
    { topic: "사람은 왜 확증 편향에 빠질까 — 운세를 믿는 뇌의 구조", tag: TAG.ALL },
    { topic: "잠자리에 들기 전 떠오르는 불안한 생각들의 정체", tag: TAG.ALL },
    { topic: "감정 전이 — 왜 옆에 있는 사람의 기분이 나에게 옮을까", tag: TAG.ALL },
    { topic: "겨울에 더 많이 꾸는 꿈이 있다 — 계절과 꿈의 관계", tag: TAG.WINTER },
    { topic: "타인의 시선이 지나치게 신경 쓰인다면 — 조명 효과", tag: TAG.ALL },
    { topic: "후회를 자주 하는 사람의 뇌 — 반사실적 사고의 심리학", tag: TAG.ALL },
    { topic: "왜 좋아하는 사람 앞에서 바보가 될까 — 인지 부하 이론", tag: TAG.ALL },
    { topic: "매일 같은 시간에 눈이 떠지는 건 생체시계 때문?", tag: TAG.ALL },
    { topic: "토정비결부터 AI 운세까지 — 운세의 진화와 심리", tag: TAG.NEW_YEAR },
    { topic: "왜 밤에는 감정이 더 강해질까 — 야간 감정 증폭 효과", tag: TAG.ALL },
    { topic: "선물 고르기가 어려운 심리학적 이유", tag: TAG.WINTER },
    { topic: "자존감이 낮을 때 운세에 더 의존하게 되는 이유", tag: TAG.ALL },
    { topic: "계절별로 달라지는 나의 MBTI — 환경이 성격을 바꾼다?", tag: TAG.ALL },
    { topic: "이름이 성격에 영향을 미친다? — 명명 효과의 심리학", tag: TAG.ALL },
  ],
};

/**
 * 현재 월에 맞는 주제를 우선 반환하되, 이미 사용된 제목은 제외
 * @param {string} category
 * @param {string[]} usedTitles - 이미 게시된 글 제목 목록
 * @returns {{ topic: string } | null}
 */
export function pickStaticTopic(category, usedTitles) {
  const pool = TOPIC_POOLS[category];
  if (!pool) return null;

  const month = new Date().getMonth() + 1; // 1~12
  const seasonTag = getSeasonTag(month);

  // 사용되지 않은 주제만 필터
  const available = pool.filter(
    (t) => !usedTitles.some((title) => title.includes(t.topic.slice(0, 15)))
  );

  if (available.length === 0) return null;

  // 시즌 매칭 주제 우선
  const seasonal = available.filter(
    (t) => t.tag === seasonTag || t.tag === "all"
  );
  const candidates = seasonal.length > 0 ? seasonal : available;

  // 랜덤 선택
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getSeasonTag(month) {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}
