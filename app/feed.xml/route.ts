import { getSupabase } from "@/lib/supabase";
import type { Post } from "@/types";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bimong-samong.com";
  const supabase = getSupabase();

  const { data } = await supabase
    .from("posts")
    .select("id, title, content, category, created_at, thumbnail")
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (data ?? []) as Pick<Post, "id" | "title" | "content" | "category" | "created_at" | "thumbnail">[];

  const items = posts
    .map((p) => {
      const desc = p.content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*/g, "")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 200);

      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}/posts/${p.id}</link>
      <guid isPermaLink="true">${siteUrl}/posts/${p.id}</guid>
      <description>${escapeXml(desc)}</description>
      <category>${escapeXml(p.category)}</category>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>비몽사몽</title>
    <link>${siteUrl}</link>
    <description>꿈해몽, 생활정보, 운세와 심리까지 — 잠과 일상의 사이에서 피어나는 이야기</description>
    <language>ko</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
