import { supabase } from "./supabaseClient";

export const getEmailLogado = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email || null;
};