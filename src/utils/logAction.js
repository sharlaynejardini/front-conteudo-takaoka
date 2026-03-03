import { supabase } from "../supabaseClient";

export async function logAction(action) {

  console.log("LOG ACTION CHAMADO:", action);

  const { data, error: sessionError } = await supabase.auth.getSession();

  console.log("SESSION:", data);
  console.log("SESSION ERROR:", sessionError);

  if (!data.session) {
    console.log("SEM SESSION");
    return;
  }

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
    console.error("ERRO INSERT:", error);
  } else {
    console.log("INSERT OK");
  }
}