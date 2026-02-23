-- ============================================================
-- 비몽사몽 매거진 — Supabase 스키마 (전체)
-- Supabase SQL Editor 에서 실행하세요.
-- ============================================================

-- ── 1. profiles 테이블 (반드시 posts 정책보다 먼저 생성) ──────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role       TEXT        NOT NULL DEFAULT 'member'
               CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles_own_insert"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 2. posts 테이블 ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  category    TEXT        NOT NULL
                CHECK (category IN ('꿈해몽', '생활정보', '운세/심리')),
  thumbnail   TEXT        DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_category   ON public.posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_public_read"
  ON public.posts FOR SELECT USING (true);

CREATE POLICY "posts_admin_insert"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "posts_admin_update"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "posts_admin_delete"
  ON public.posts FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── 3. 신규 가입 트리거: 최초 가입자 = admin, 이후 = member ──────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  IF user_count = 0 THEN
    INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.profiles (id, role) VALUES (NEW.id, 'member');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
