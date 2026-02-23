import { createClient } from "@supabase/supabase-js";
import type { Post } from "@/types";

type DB = { public: { Tables: { posts: { Row: Post } } } };

// 모듈 로드 시점이 아닌 실제 쿼리 시점에 클라이언트를 생성 (빌드 크래시 방지)
let _client: ReturnType<typeof createClient<DB>> | null = null;

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지 않았습니다.");
    }
    _client = createClient<DB>(url, key);
  }
  return _client;
}
