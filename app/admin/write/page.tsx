"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CATEGORIES } from "@/types";
import type { Category } from "@/types";

type Tab = "write" | "preview";

const PLACEHOLDER = `## 소제목

본문 내용을 **마크다운**으로 작성하세요.

- 목록 항목 1
- 목록 항목 2

> 인용문은 이렇게 작성합니다.
`;

export default function AdminWritePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("꿈해몽");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [tab, setTab] = useState<Tab>("write");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const charCount = content.length;
  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFeedback(null);

      if (!title.trim()) {
        setFeedback({ type: "error", message: "제목을 입력해주세요." });
        return;
      }
      if (!content.trim()) {
        setFeedback({ type: "error", message: "본문을 입력해주세요." });
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category,
            thumbnail: thumbnail.trim() || null,
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          setFeedback({ type: "error", message: json.error ?? "발행에 실패했습니다." });
          return;
        }

        setFeedback({ type: "success", message: "기사가 성공적으로 발행되었습니다!" });
        setTimeout(() => router.push(`/posts/${json.post.id}`), 1200);
      } catch {
        setFeedback({ type: "error", message: "네트워크 오류가 발생했습니다." });
      } finally {
        setIsLoading(false);
      }
    },
    [title, content, category, thumbnail, router]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">비몽사몽 — 글쓰기</span>
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
          >
            ← 사이트 보기
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── 제목 ── */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기사 제목을 입력하세요"
              className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-300 border-0 border-b-2 border-gray-100 focus:border-violet-400 focus:outline-none bg-transparent py-2 transition-colors"
            />
          </div>

          {/* ── 메타 행 (카테고리 + 썸네일) ── */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 카테고리 */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                카테고리
              </label>
              <div className="flex gap-2">
                {CATEGORIES.map((cat: Category) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      category === cat
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 썸네일 URL */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                썸네일 URL <span className="normal-case font-normal text-gray-300">(선택)</span>
              </label>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 transition-colors bg-white"
              />
            </div>
          </div>

          {/* ── 에디터 영역 ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 탭 */}
            <div className="flex items-center gap-0 border-b border-gray-100 px-4 pt-3">
              {(["write", "preview"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === t
                      ? "border-violet-500 text-violet-600"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {t === "write" ? "작성" : "미리보기"}
                </button>
              ))}
            </div>

            {/* 에디터 */}
            {tab === "write" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={22}
                className="w-full px-6 py-5 text-sm text-gray-800 font-mono leading-7 resize-none focus:outline-none placeholder:text-gray-300"
              />
            ) : (
              <div className="min-h-[440px] px-6 py-5">
                {content.trim() ? (
                  <div className="prose-admin">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">본문을 작성하면 미리보기가 표시됩니다.</p>
                )}
              </div>
            )}

            {/* 글자 수 카운터 */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                <span className="font-medium text-gray-600">{charCount.toLocaleString()}</span>자
                &nbsp;·&nbsp;
                <span className="font-medium text-gray-600">{wordCount.toLocaleString()}</span>단어
              </span>
              <span className="text-xs text-gray-300">Markdown 지원</span>
            </div>
          </div>

          {/* ── 피드백 메시지 ── */}
          {feedback && (
            <div
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* ── 발행 버튼 ── */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-full hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "발행 중…" : "발행하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
