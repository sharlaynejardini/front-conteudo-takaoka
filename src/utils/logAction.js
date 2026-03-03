import { supabase } from "../supabaseClient";

export async function logAction({
  action,
  entidade,
  turma,
  disciplina,
  bimestre,
  detalhes
}) {

  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const user = data.session.user;

  await supabase.from("action_logs").insert([
    {
      user_id: user.id,
      email: user.email,
      action,
      entidade,
      turma,
      disciplina,
      bimestre,
      detalhes
    }
  ]);
}