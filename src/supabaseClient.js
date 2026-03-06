import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ekqoaouowjavmnmsjkwu.supabase.co";
const supabaseAnonKey = "sb_publishable_j9sMw6wzyFxdVYfGytKkxg_9mPB7bv2";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});