"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function MoonLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <svg
        className="w-6 h-6 text-violet-400 group-hover:text-violet-300 transition-colors"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
      </svg>
      <span className="text-[1.15rem] font-black tracking-tight text-white">
        비몽<span className="text-violet-400">사몽</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setRole(null); setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      setRole((data?.role as "admin" | "member") ?? "member");
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      init();
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/write")) return null;

  return (
    <header className="bg-slate-950 sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <MoonLogo />

        {/* 카테고리 네비 (md 이상) */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "꿈해몽", href: "/category/dream" },
            { label: "생활정보", href: "/category/lifestyle" },
            { label: "운세/심리", href: "/category/fortune" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {role === "admin" && (
                <Link
                  href="/admin/write"
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-full transition-colors"
                >
                  글쓰기
                </Link>
              )}
              {role !== null ? (
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
                >
                  로그인
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
