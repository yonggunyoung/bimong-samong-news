import Link from "next/link";
import { CATEGORIES, CATEGORY_TO_SLUG } from "@/types";
import type { Category } from "@/types";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* 브랜드 */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <svg
                className="w-5 h-5 text-violet-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
              </svg>
              <span className="text-base font-black text-white tracking-tight">
                비몽<span className="text-violet-400">사몽</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 max-w-xs leading-relaxed">
              꿈해몽, 생활정보, 운세와 심리까지.<br />
              잠과 일상의 사이에서 피어나는 이야기.
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-4">
              카테고리
            </p>
            <ul className="flex flex-col gap-2.5">
              {CATEGORIES.map((cat: Category) => (
                <li key={cat}>
                  <Link
                    href={`/category/${CATEGORY_TO_SLUG[cat]}`}
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">© {year} 비몽사몽. All rights reserved.</p>
          <p className="text-xs text-slate-700">꿈과 일상의 사이</p>
        </div>
      </div>
    </footer>
  );
}
