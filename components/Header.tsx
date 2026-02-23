"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // 관리자 글쓰기 페이지에서는 헤더 숨김 (자체 헤더 사용)
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-black text-gray-900 hover:text-violet-600 transition-colors tracking-tight"
        >
          비몽사몽
        </Link>

        <Link
          href="/admin/write"
          className="text-xs text-gray-400 hover:text-violet-600 transition-colors px-3 py-1.5 rounded-full hover:bg-violet-50"
        >
          글쓰기
        </Link>
      </div>
    </header>
  );
}
