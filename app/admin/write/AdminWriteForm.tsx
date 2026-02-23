"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CATEGORIES } from "@/types";
import type { Category, Post } from "@/types";

type Tab = "write" | "preview";

const PLACEHOLDER = `## 소제목

본문 내용을 **마크다운**으로 작성하세요.

- 목록 항목 1
- 목록 항목 2

> 인용문은 이렇게 작성합니다.
`;

interface Props {
  initialData?: Pick<Post, "id" | "title" | "content" | "category" | "thumbnail">;
}

export default function AdminWriteForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState<Category>(initialData?.category ?? "꿈해몽");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [tab, setTab] = useState<Tab>("write");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [aiTopic, setAiTopic] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const charCount = content.length;

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), category }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: json.error ?? "AI 생성에 실패했습니다." });
        return;
      }
      setTitle(json.title);
      setContent(json.content);
      if (json.thumbnail) setThumbnail(json.thumbnail);
      setShowAiModal(false);
      setAiTopic("");
      const imgMsg = json.imageCount ? ` (이미지 ${json.imageCount}장 포함)` : "";
      setFeedback({ type: "success", message: `AI가 기사를 작성했습니다${imgMsg}. 내용을 검토 후 발행하세요.` });
    } catch {
      setFeedback({ type: "error", message: "네트워크 오류가 발생했습니다." });
    } finally {
      setIsGenerating(false);
    }
  }, [aiTopic, category]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFeedback(null);
      if (!title.trim()) { setFeedback({ type: "error", message: "제목을 입력해주세요." }); return; }
      if (!content.trim()) { setFeedback({ type: "error", message: "본문을 입력해주세요." }); return; }

      setIsLoading(true);
      try {
        const url = isEdit ? `/api/posts/${initialData.id}` : "/api/posts";
        const method = isEdit ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content: content.trim(), category, thumbnail: thumbnail.trim() || null }),
        });
        const json = await res.json();
        if (!res.ok) { setFeedback({ type: "error", message: json.error ?? "저장에 실패했습니다." }); return; }
        setFeedback({ type: "success", message: isEdit ? "수정이 완료되었습니다!" : "기사가 성공적으로 발행되었습니다!" });
        const postId = isEdit ? initialData.id : json.post.id;
        setTimeout(() => router.push(`/posts/${postId}`), 1200);
      } catch {
        setFeedback({ type: "error", message: "네트워크 오류가 발생했습니다." });
      } finally {
        setIsLoading(false);
      }
    },
    [title, content, category, thumbnail, router, isEdit, initialData]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
            <span className="text-sm font-bold text-white">
              비몽<span className="text-violet-400">사몽</span> — {isEdit ? "글 편집" : "글쓰기"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-full transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1l1 5h-3l-1-5h-2l-1 5H7l1-5H7a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z"/>
              </svg>
              AI 작성
            </button>
            <a href="/" className="text-xs text-slate-400 hover:text-white transition-colors">← 사이트 보기</a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기사 제목을 입력하세요"
            className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-300 border-0 border-b-2 border-gray-100 focus:border-violet-400 focus:outline-none bg-transparent py-2 transition-colors"
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">카테고리</label>
              <div className="flex gap-2">
                {CATEGORIES.map((cat: Category) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      category === cat ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                썸네일 URL <span className="normal-case font-normal text-gray-300">(선택)</span>
              </label>
              <input type="url" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 transition-colors bg-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex items-center border-b border-gray-100 px-4 pt-3">
              {(["write", "preview"] as Tab[]).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === t ? "border-violet-500 text-violet-600" : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}>
                  {t === "write" ? "작성" : "미리보기"}
                </button>
              ))}
            </div>

            {tab === "write" ? (
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder={PLACEHOLDER} rows={22}
                className="w-full px-6 py-5 text-sm text-gray-800 font-mono leading-7 resize-none focus:outline-none placeholder:text-gray-300" />
            ) : (
              <div className="min-h-[440px] px-6 py-5">
                {content.trim() ? (
                  <div className="prose-admin">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">본문을 작성하면 미리보기가 표시됩니다.</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-2.5 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                <span className="font-medium text-gray-600">{charCount.toLocaleString()}</span>자
              </span>
              <span className="text-xs text-gray-300">Markdown 지원</span>
            </div>
          </div>

          {feedback && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              feedback.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}>
              {feedback.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pb-4">
            <button type="button" onClick={() => router.back()}
              className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              취소
            </button>
            <button type="submit" disabled={isLoading}
              className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-full hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50">
              {isLoading ? (isEdit ? "저장 중…" : "발행 중…") : (isEdit ? "저장하기" : "발행하기")}
            </button>
          </div>
        </form>
      </div>

      {/* AI 작성 모달 */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-sm">AI</span>
                AI 기사 작성
              </h3>
              <button type="button" onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">카테고리</label>
              <p className="text-sm font-medium text-violet-600">{category}</p>
              <p className="text-xs text-gray-400 mt-0.5">위에서 선택한 카테고리가 적용됩니다</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">주제 / 키워드</label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="예: 뱀 꿈의 의미, 아침 루틴 추천, 2026년 별자리 운세"
                className="w-full text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-colors"
                onKeyDown={(e) => { if (e.key === "Enter") handleAiGenerate(); }}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                취소
              </button>
              <button type="button" onClick={handleAiGenerate}
                disabled={isGenerating || !aiTopic.trim()}
                className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    기사 + 이미지 생성 중…
                  </>
                ) : "기사 + 이미지 생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
