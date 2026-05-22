import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("WARNING: Supabase credentials are not fully configured in the environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
