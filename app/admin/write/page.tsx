import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminWriteForm from "./AdminWriteForm";

export default async function AdminWritePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return <AdminWriteForm />;
}
