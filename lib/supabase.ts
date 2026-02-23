import { createClient } from "@supabase/supabase-js";
import type { Post } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<{ public: { Tables: { posts: { Row: Post } } } }>(
  supabaseUrl,
  supabaseAnonKey
);
