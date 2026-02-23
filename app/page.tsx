import Link from "next/link";
import { getPosts, getPostsByCategory } from "@/lib/posts";
import ArticleListItem from "@/components/ArticleListItem";
import { CATEGORIES, SLUG_TO_CATEGORY, CATEGORY_TO_SLUG } from "@/types";
import type { Category } from "@/types";

export const revalidate = 3600;

interface Props {
  searchParams: { tab?: string };
}

const ALL_TABS = [
  { label: "전체", slug: "all" },
  ...CATEGORIES.map((cat: Category) => ({ label: cat, slug: CATEGORY_TO_SLUG[cat] })),
];

export default async function HomePage({ searchParams }: Props) {
  const activeSlug = searchParams.tab && searchParams.tab !== "all"
    ? searchParams.tab
    : "all";

  const activeCategory = activeSlug !== "all"
    ? SLUG_TO_CATEGORY[activeSlug] ?? null
    : null;

  const posts = activeCategory
    ? await getPostsByCategory(activeCategory, 30)
    : await getPosts(30);

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* ── 히어로 헤더 ── */}
      <div className="pt-14 pb-8 text-center border-b border-gray-100">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">비몽사몽</h1>
        <p className="mt-2 text-sm text-gray-400 tracking-wide">
          꿈해몽 &middot; 생활정보 &middot; 운세/심리
        </p>
      </div>

      {/* ── 카테고리 탭 ── */}
      <div className="flex items-end gap-0 border-b border-gray-100 mt-0 overflow-x-auto no-scrollbar">
        {ALL_TABS.map(({ label, slug }) => {
          const isActive = activeSlug === slug;
          const href = slug === "all" ? "/" : `/?tab=${slug}`;
          return (
            <Link
              key={slug}
              href={href}
              className={`
                inline-block px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 -mb-px transition-colors
                ${isActive
                  ? "border-violet-500 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
                }
              `}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── 기사 목록 ── */}
      <section className="py-2">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4 opacity-25">🌙</span>
            <p className="text-sm text-gray-400">아직 등록된 기사가 없습니다.</p>
            <Link
              href="/admin/write"
              className="mt-4 text-xs text-violet-500 hover:text-violet-700 underline"
            >
              첫 기사 작성하기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <ArticleListItem key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
