import Link from "next/link";
import Image from "next/image";
import CategoryBadge from "@/components/CategoryBadge";
import { formatDate, readingTime } from "@/lib/posts";
import type { Post } from "@/types";
import type { Category } from "@/types";

interface Props {
  post: Post;
  featured?: boolean;
}

const CATEGORY_GRADIENT: Record<Category, string> = {
  "꿈해몽": "from-violet-900 via-indigo-900 to-slate-900",
  "생활정보": "from-sky-900 via-cyan-900 to-slate-900",
  "운세/심리": "from-rose-900 via-pink-900 to-slate-900",
};

const CARD_PLACEHOLDER: Record<Category, string> = {
  "꿈해몽": "from-violet-50 to-violet-100",
  "생활정보": "from-sky-50 to-sky-100",
  "운세/심리": "from-rose-50 to-rose-100",
};

const CATEGORY_ICON: Record<Category, string> = {
  "꿈해몽": "🌙",
  "생활정보": "💡",
  "운세/심리": "✨",
};

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export default function ArticleCard({ post, featured = false }: Props) {
  const mins = readingTime(post.content);
  const excerpt = stripMarkdown(post.content).slice(0, 110);

  if (featured) {
    return (
      <Link href={`/posts/${post.id}`} className="group block">
        <article
          className={`relative overflow-hidden rounded-2xl min-h-[380px] flex flex-col justify-end bg-gradient-to-br ${CATEGORY_GRADIENT[post.category]}`}
        >
          {post.thumbnail && (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
              priority
            />
          )}
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 p-7 sm:p-10">
            <div className="flex items-center gap-3 mb-3">
              <CategoryBadge category={post.category} />
              <span className="text-xs text-slate-400">{mins}분 읽기</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:text-violet-300 transition-colors">
              {post.title}
            </h2>
            {excerpt && (
              <p className="mt-2 text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            )}
            <p className="mt-4 text-xs text-slate-500">{formatDate(post.created_at)}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.id}`} className="group block h-full">
      <article className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-200">
        {/* 썸네일 */}
        <div className="relative h-44 overflow-hidden">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${CARD_PLACEHOLDER[post.category]}`}
            >
              <span className="text-4xl opacity-50">{CATEGORY_ICON[post.category]}</span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge category={post.category} />
          </div>
          <h3 className="text-[0.9375rem] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-violet-600 transition-colors flex-1">
            {post.title}
          </h3>
          {excerpt && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>{mins}분 읽기</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
