import { supabase } from "../supabaseClient";

export async function logAction(action) {

  console.log("LOG ACTION CHAMADO:", action); // 👈 ADICIONE ESTA LINHA

  const { data } = await supabase.auth.getSession();

  if (!data.session) return;

  const user = data.session.user;

  const { error } = await supabase
    .from("action_logs")
    .insert([
      {
        user_id: user.id,
        email: user.email,
        action: action
      }
    ]);

  if (error) {
    console.error("Erro ao registrar ação:", error);
  }
}