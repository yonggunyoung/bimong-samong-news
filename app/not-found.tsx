import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-6 opacity-30">🌙</span>
      <h1 className="text-2xl font-black text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-500 text-sm mb-8">
        요청하신 페이지가 없거나 삭제되었습니다.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-full hover:bg-violet-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
