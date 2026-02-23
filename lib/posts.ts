import { supabase } from "@/lib/supabase";
import type { Post, Category } from "@/types";

/** 최신 포스트 목록 조회 */
export async function getPosts(limit = 12): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPosts error:", error.message);
    return [];
  }
  return data as Post[];
}

/** 카테고리별 포스트 조회 */
export async function getPostsByCategory(
  category: Category,
  limit = 20
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPostsByCategory error:", error.message);
    return [];
  }
  return data as Post[];
}

/** 단일 포스트 조회 */
export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getPostById error:", error.message);
    return null;
  }
  return data as Post;
}

/** 홈 히어로용 대표 포스트 조회 (최신 1건) */
export async function getFeaturedPost(): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as Post;
}

/** 날짜 포맷 유틸 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
