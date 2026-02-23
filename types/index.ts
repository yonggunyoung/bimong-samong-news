export interface Post {
  id: string;
  title: string;
  content: string;
  category: Category;
  thumbnail: string | null;
  created_at: string;
}

export type Category = "꿈해몽" | "생활정보" | "운세/심리";

export const CATEGORIES: Category[] = ["꿈해몽", "생활정보", "운세/심리"];

/** DB 카테고리명 → URL 슬러그 */
export const CATEGORY_TO_SLUG: Record<Category, string> = {
  꿈해몽: "dream",
  생활정보: "lifestyle",
  "운세/심리": "fortune",
};

/** URL 슬러그 → DB 카테고리명 */
export const SLUG_TO_CATEGORY: Record<string, Category> = {
  dream: "꿈해몽",
  lifestyle: "생활정보",
  fortune: "운세/심리",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  꿈해몽: "꿈의 의미를 해석하고 일상의 신호를 읽어드립니다",
  생활정보: "일상을 더 풍요롭게 만드는 유용한 정보를 전합니다",
  "운세/심리": "당신의 운세와 심리를 깊이 탐구합니다",
};

/** 카테고리별 포인트 색상 (Tailwind 클래스) */
export const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> =
  {
    꿈해몽: { bg: "bg-violet-100", text: "text-violet-700" },
    생활정보: { bg: "bg-sky-100", text: "text-sky-700" },
    "운세/심리": { bg: "bg-rose-100", text: "text-rose-700" },
  };
