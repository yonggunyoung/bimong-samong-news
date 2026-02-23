-- ============================================================
-- 비몽사몽 매거진 — Supabase 스키마
-- Supabase SQL Editor 에서 실행하세요.
-- ============================================================

-- posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,                     -- HTML 형식 본문
  category    TEXT        NOT NULL
                CHECK (category IN ('꿈해몽', '생활정보', '운세/심리')),
  thumbnail   TEXT        DEFAULT NULL,                 -- Supabase Storage URL
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_posts_category    ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at  ON posts (created_at DESC);

-- ── Row Level Security ──
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 허용 (공개 매거진)
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (true);

-- 인증된 사용자만 쓰기 허용 (관리자)
CREATE POLICY "posts_auth_insert"
  ON posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "posts_auth_update"
  ON posts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "posts_auth_delete"
  ON posts FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 샘플 데이터 (개발/테스트용)
-- ============================================================
INSERT INTO posts (title, content, category, thumbnail) VALUES
(
  '뱀 꿈을 꿨다면? 길몽 vs 흉몽 완벽 해석',
  '<p>뱀 꿈은 한국에서 오랫동안 <strong>재물운</strong>과 연결되어 왔습니다. 뱀의 색깔, 크기, 행동에 따라 꿈의 의미가 달라지는데...</p><h2>색깔별 해석</h2><ul><li><strong>황금빛 뱀</strong> — 대길몽, 큰 재물이 들어올 징조</li><li><strong>흰 뱀</strong> — 귀인을 만날 운, 사업 성공</li><li><strong>검은 뱀</strong> — 건강 주의, 나쁜 소식 가능성</li></ul><p>뱀이 나를 감거나 물었다면 오히려 좋은 신호일 수 있습니다. 재물이 나를 찾아오는 형상으로 해석되기 때문입니다.</p>',
  '꿈해몽',
  NULL
),
(
  '불 꿈의 의미 — 타오르는 불길이 알려주는 것',
  '<p>불 꿈은 <strong>열정, 변화, 정화</strong>를 상징합니다. 불길의 세기와 상황에 따라 긍정적·부정적으로 해석됩니다.</p><h2>상황별 해석</h2><ul><li>집에 불이 나는 꿈 — 집안에 큰 변화의 예고</li><li>촛불 꿈 — 희망과 새로운 시작</li><li>불을 끄는 꿈 — 문제 해결, 위기 극복</li></ul>',
  '꿈해몽',
  NULL
),
(
  '냉장고 묵은 냄새 없애는 법 5가지',
  '<p>냉장고를 사용하다 보면 어느새 불쾌한 냄새가 배어들기 마련입니다. 화학적 냄새 제거제 없이도 집에 있는 재료로 깔끔하게 해결할 수 있습니다.</p><h2>효과적인 방법</h2><ol><li><strong>베이킹소다</strong> — 개봉한 베이킹소다를 작은 그릇에 담아 냉장고 구석에 놓아두세요.</li><li><strong>커피 찌꺼기</strong> — 말린 커피 찌꺼기가 강력한 탈취 효과를 발휘합니다.</li><li><strong>숯</strong> — 활성탄 숯은 수분과 냄새를 동시에 잡아줍니다.</li></ol>',
  '생활정보',
  NULL
),
(
  '2025년 토끼띠 운세 — 하반기 재물·사랑 총정리',
  '<p>2025년 토끼띠는 <strong>목성의 기운</strong>을 받아 전반적으로 안정적인 한 해를 보낼 것으로 예측됩니다.</p><h2>재물운</h2><p>7월부터 10월 사이 투자나 부업에서 성과가 기대됩니다. 다만 충동적인 지출은 주의하세요.</p><h2>사랑운</h2><p>솔로라면 9월에 인연을 만날 가능성이 높습니다. 이미 연인이 있다면 함께 여행을 계획해보세요.</p>',
  '운세/심리',
  NULL
);
