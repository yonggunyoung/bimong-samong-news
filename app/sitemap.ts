import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bimong-samong.com";
  const supabase = getSupabase();

  const { data } = await supabase
    .from("posts")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as { id: string; created_at: string }[];

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/posts/${p.id}`,
    lastModified: p.created_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/category/dream`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/category/lifestyle`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/category/fortune`, changeFrequency: "daily", priority: 0.8 },
    ...postEntries,
  ];
}
