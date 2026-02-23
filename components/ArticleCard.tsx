import Link from "next/link";
import Image from "next/image";
import CategoryBadge from "@/components/CategoryBadge";
import { formatDate } from "@/lib/posts";
import type { Post } from "@/types";

interface Props {
  post: Post;
  featured?: boolean;
}

export default function ArticleCard({ post, featured = false }: Props) {
  if (featured) {
    return (
      <Link href={`/posts/${post.id}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-gray-900 min-h-[420px] flex flex-col justify-end">
          {post.thumbnail && (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-300"
              priority
            />
          )}
          <div className="relative z-10 p-8">
            <CategoryBadge category={post.category} />
            <h2 className="mt-3 text-3xl font-bold text-white leading-tight group-hover:text-violet-300 transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-gray-300">{formatDate(post.created_at)}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <article className="flex flex-col h-full border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:shadow-violet-100 transition-shadow duration-200 bg-white">
        {/* 썸네일 */}
        <div className="relative h-48 bg-violet-50 overflow-hidden">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100">
              <span className="text-4xl opacity-40">🌙</span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="flex flex-col flex-1 p-5">
          <CategoryBadge category={post.category} asLink />
          <h3 className="mt-2 text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-violet-600 transition-colors">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
            {stripHtml(post.content)}
          </p>
          <p className="mt-3 text-xs text-gray-400">{formatDate(post.created_at)}</p>
        </div>
      </article>
    </Link>
  );
}

/** HTML 태그 제거 (카드 미리보기용) */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
