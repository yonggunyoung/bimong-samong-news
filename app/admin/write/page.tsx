import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminWriteForm from "./AdminWriteForm";

interface Props {
  searchParams: { edit?: string };
}

export default async function AdminWritePage({ searchParams }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  if (searchParams.edit) {
    const { data: post } = await supabase
      .from("posts")
      .select("id, title, content, category, thumbnail")
      .eq("id", searchParams.edit)
      .single();

    if (post) return <AdminWriteForm initialData={post} />;
  }

  return <AdminWriteForm />;
}
