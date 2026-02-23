import Link from "next/link";
import Image from "next/image";
import CategoryBadge from "@/components/CategoryBadge";
import { formatDate } from "@/lib/posts";
import type { Post } from "@/types";

interface Props {
  post: Post;
}

export default function ArticleListItem({ post }: Props) {
  const excerpt = post.content
    .replace(/#{1,6}\s/g, "")   // 마크다운 헤딩 제거
    .replace(/\*\*/g, "")        // bold 마크다운 제거
    .replace(/\*/g, "")          // italic 제거
    .replace(/`/g, "")           // 코드 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 링크 텍스트만 남기기
    .replace(/\n+/g, " ")        // 줄바꿈 → 공백
    .trim()
    .slice(0, 120);

  return (
    <Link href={`/posts/${post.id}`} className="group block py-6 hover:bg-violet-50/40 -mx-4 px-4 rounded-xl transition-colors">
      <article className="flex gap-5 items-start">
        {/* 썸네일 (있을 때만) */}
        {post.thumbnail && (
          <div className="flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden bg-violet-50">
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryBadge category={post.category} />
            <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-violet-700 transition-colors line-clamp-2">
            {post.title}
          </h2>
          {excerpt && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
