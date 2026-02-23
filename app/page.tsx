import Link from "next/link";
import { getPosts, getPostsByCategory, searchPosts } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import { CATEGORIES, SLUG_TO_CATEGORY, CATEGORY_TO_SLUG } from "@/types";
import type { Category } from "@/types";

export const revalidate = 3600;

interface Props {
  searchParams: { tab?: string; search?: string };
}

const ALL_TABS = [
  { label: "전체", slug: "all" },
  ...CATEGORIES.map((cat: Category) => ({ label: cat, slug: CATEGORY_TO_SLUG[cat] })),
];

export default async function HomePage({ searchParams }: Props) {
  const searchQuery = searchParams.search?.trim() ?? "";
  const activeSlug = searchParams.tab && searchParams.tab !== "all" ? searchParams.tab : "all";
  const activeCategory = activeSlug !== "all" ? SLUG_TO_CATEGORY[activeSlug] ?? null : null;

  const posts = searchQuery
    ? await searchPosts(searchQuery, 24)
    : activeCategory
    ? await getPostsByCategory(activeCategory, 24)
    : await getPosts(24);

  const [featured, ...rest] = posts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <div className="pt-12 pb-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {searchQuery ? `"${searchQuery}" 검색 결과` : "비몽사몽"}
        </h1>
        <p className="mt-1.5 text-sm text-gray-400">꿈해몽 · 생활정보 · 운세/심리</p>
        <div className="mt-6">
          <SearchBar defaultValue={searchQuery} />
        </div>
      </div>

      {searchQuery ? (
        <div>
          {posts.length === 0 ? (
            <EmptyState query={searchQuery} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-violet-600 hover:text-violet-800 transition-colors">
              ← 전체 목록으로
            </Link>
          </div>
        </div>
      ) : (
        <>
          {featured && (
            <div className="mb-10">
              <ArticleCard post={featured} featured />
            </div>
          )}

          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
            {ALL_TABS.map(({ label, slug }) => {
              const isActive = activeSlug === slug;
              const href = slug === "all" ? "/" : `/?tab=${slug}`;
              return (
                <Link
                  key={slug}
                  href={href}
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-violet-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {rest.length === 0 && !featured ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4 opacity-20">🌙</span>
      <p className="text-sm text-gray-400">
        {query ? `"${query}"에 해당하는 기사가 없습니다.` : "아직 등록된 기사가 없습니다."}
      </p>
    </div>
  );
}
