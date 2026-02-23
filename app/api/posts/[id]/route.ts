import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import type { Category } from "@/types";

const VALID_CATEGORIES: Category[] = ["꿈해몽", "생활정보", "운세/심리"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  return createSupabaseAdmin(url, key);
}

async function checkAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  let body: { title?: string; content?: string; category?: string; thumbnail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { title, content, category, thumbnail } = body;

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: "제목, 본문, 카테고리는 필수입니다." }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json({ error: "유효하지 않은 카테고리입니다." }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        category,
        thumbnail: thumbnail?.trim() || null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("posts").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
