import { createClient } from "@supabase/supabase-js";

// 🔐 프로젝트 URL & 익명 키 입력
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
