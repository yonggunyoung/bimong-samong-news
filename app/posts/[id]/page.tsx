import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostById, formatDate } from "@/lib/posts";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORY_TO_SLUG } from "@/types";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostById(params.id);
  if (!post) return { title: "기사를 찾을 수 없습니다" };

  const siteName = "비몽사몽";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = `${siteUrl}/posts/${post.id}`;

  // 마크다운 문법 제거 후 앞 140자를 description으로
  const description = post.content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 140);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      siteName,
      locale: "ko_KR",
      type: "article",
      publishedTime: post.created_at,
      section: post.category,
      ...(post.thumbnail && {
        images: [{ url: post.thumbnail, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
    alternates: { canonical: url },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  const categorySlug = CATEGORY_TO_SLUG[post.category];

  return (
    // 최대 폭 768px + 넉넉한 상하 여백
    <article className="max-w-[768px] mx-auto px-4 py-12">
      {/* 뒤로가기 */}
      <Link
        href={categorySlug ? `/category/${categorySlug}` : "/"}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 transition-colors mb-10"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {post.category}
      </Link>

      {/* 헤더 */}
      <header className="mb-10">
        <CategoryBadge category={post.category} asLink />
        <h1 className="mt-4 text-[2rem] sm:text-[2.5rem] font-black text-gray-900 leading-[1.25] tracking-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-gray-400">{formatDate(post.created_at)}</p>
      </header>

      {/* 썸네일 */}
      {post.thumbnail && (
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-12">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 본문 — 마크다운 렌더링 */}
      <div className="mt-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pb-3 border-b border-gray-100">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-[1.0625rem] text-gray-800 leading-[1.95] mb-6">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-[1.0625rem] text-gray-700 leading-[1.8]">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-violet-300 pl-5 py-1 my-6 bg-violet-50/60 rounded-r-xl">
                <div className="text-gray-600 italic leading-relaxed">{children}</div>
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 underline underline-offset-2 hover:text-violet-800 transition-colors"
              >
                {children}
              </a>
            ),
            hr: () => <hr className="border-gray-200 my-10" />,
            code: ({ children }) => (
              <code className="bg-gray-100 text-violet-700 text-[0.875em] px-1.5 py-0.5 rounded font-mono">
                {children}
              </code>
            ),
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="rounded-xl w-full my-8" />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* 하단 네비게이션 */}
      <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-violet-600 transition-colors">
          ← 홈으로
        </Link>
        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors"
          >
            {post.category} 더보기 →
          </Link>
        )}
      </div>
    </article>
  );
}
