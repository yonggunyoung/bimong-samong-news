import Link from "next/link";
import { CATEGORIES, CATEGORY_TO_SLUG } from "@/types";
import type { Category } from "@/types";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-gray-100 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* 브랜드 */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-xl font-black text-gray-900 hover:text-violet-600 transition-colors">
              비몽사몽
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              꿈해몽, 생활정보, 운세와 심리까지.<br />
              잠과 일상의 사이에서 피어나는 이야기.
            </p>
          </div>

          {/* 카테고리 링크 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              카테고리
            </p>
            <ul className="flex flex-col gap-2">
              {CATEGORIES.map((cat: Category) => (
                <li key={cat}>
                  <Link
                    href={`/category/${CATEGORY_TO_SLUG[cat]}`}
                    className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {year} 비몽사몽. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            꿈과 일상의 사이
          </p>
        </div>
      </div>
    </footer>
  );
}
