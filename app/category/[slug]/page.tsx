import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import {
  SLUG_TO_CATEGORY,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_COLORS,
} from "@/types";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return [
    { slug: "dream" },
    { slug: "lifestyle" },
    { slug: "fortune" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = SLUG_TO_CATEGORY[params.slug];
  if (!category) return {};

  const siteName = "비몽사몽";
  const title = `${category} — ${siteName}`;
  const description = CATEGORY_DESCRIPTIONS[category];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/category/${params.slug}`,
      siteName,
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/category/${params.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = SLUG_TO_CATEGORY[params.slug];
  if (!category) notFound();

  const posts = await getPostsByCategory(category, 20);
  const colors = CATEGORY_COLORS[category];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 카테고리 헤더 */}
      <div className={`mb-10 p-8 rounded-2xl ${colors.bg}`}>
        <span className={`text-xs font-semibold uppercase tracking-widest ${colors.text}`}>
          Category
        </span>
        <h1 className={`mt-2 text-3xl font-black ${colors.text}`}>{category}</h1>
        <p className="mt-2 text-sm text-gray-600">{CATEGORY_DESCRIPTIONS[category]}</p>
        <p className="mt-1 text-xs text-gray-400">총 {posts.length}개의 기사</p>
      </div>

      {/* 포스트 그리드 */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4 opacity-30">📭</span>
          <p className="text-gray-400 text-sm">이 카테고리에 아직 기사가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
