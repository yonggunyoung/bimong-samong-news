import Link from "next/link";
import { getPosts, getPostsByCategory, searchPosts } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import { CATEGORY_TO_SLUG } from "@/types";
import type { Category, Post } from "@/types";

export const revalidate = 60;

interface Props {
  searchParams: { search?: string };
}

const CATEGORY_EMOJI: Record<Category, string> = {
  "꿈해몽": "🌙",
  "생활정보": "💡",
  "운세/심리": "✨",
};

function CategorySection({ category, posts }: { category: Category; posts: Post[] }) {
  if (posts.length === 0) return null;
  const slug = CATEGORY_TO_SLUG[category];
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <span>{CATEGORY_EMOJI[category]}</span>
          {category}
        </h2>
        <Link
          href={`/category/${slug}`}
          className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors flex items-center gap-1"
        >
          전체보기 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const searchQuery = searchParams.search?.trim() ?? "";

  /* ── 검색 결과 뷰 ── */
  if (searchQuery) {
    const results = await searchPosts(searchQuery, 24);
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="pt-10 pb-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            &ldquo;{searchQuery}&rdquo; 검색 결과
          </h1>
          <div className="mt-5">
            <SearchBar defaultValue={searchQuery} />
          </div>
        </div>
        {results.length === 0 ? (
          <EmptyState query={searchQuery} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-violet-600 hover:text-violet-800 transition-colors"
          >
            ← 전체 목록으로
          </Link>
        </div>
      </div>
    );
  }

  /* ── 메인 뷰 데이터 패치 ── */
  const [latestPosts, dreamPosts, lifestylePosts, fortunePosts] = await Promise.all([
    getPosts(4),
    getPostsByCategory("꿈해몽", 3),
    getPostsByCategory("생활정보", 3),
    getPostsByCategory("운세/심리", 3),
  ]);

  const featured = latestPosts[0] ?? null;
  const popularPosts = latestPosts.slice(1, 4);

  const categorySections: { category: Category; posts: Post[] }[] = [
    { category: "꿈해몽", posts: dreamPosts },
    { category: "생활정보", posts: lifestylePosts },
    { category: "운세/심리", posts: fortunePosts },
  ];

  const hasAnyPosts = !!featured || categorySections.some((s) => s.posts.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-8">
      {!hasAnyPosts ? (
        <EmptyState />
      ) : (
        <>
          {/* 히어로 대표 기사 */}
          {featured && (
            <div className="mb-14">
              <ArticleCard post={featured} featured />
            </div>
          )}

          {/* 카테고리별 섹션 — 각 3개 */}
          {categorySections.map(({ category, posts }) => (
            <CategorySection key={category} category={category} posts={posts} />
          ))}

          {/* 인기 기사 */}
          {popularPosts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span>🔥</span>
                  인기 기사
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {popularPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </section>
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
        {query
          ? `"${query}"에 해당하는 기사가 없습니다.`
          : "아직 등록된 기사가 없습니다."}
      </p>
    </div>
  );
}
