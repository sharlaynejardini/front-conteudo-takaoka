import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {

      try {
        const { data } = await supabase.auth.getSession();

        if (data.session) {

          const user = data.session.user;

          // Registra login
          try {
            await supabase.from("login_logs").insert([
              {
                user_id: user.id,
                email: user.email
              }
            ]);
          } catch (logError) {
            console.error("Erro ao registrar login:", logError);
          }

          // Registra usuário na tabela users se não existir
          try {
            const { data: existingUser } = await supabase
              .from("users")
              .select("id")
              .eq("email", user.email)
              .maybeSingle();

            if (!existingUser) {
              await supabase.from("users").insert([
                {
                  id: user.id,
                  email: user.email,
                  nome: user.user_metadata?.full_name || user.email.split("@")[0]
                }
              ]);
            }
          } catch (userError) {
            console.error("Erro ao registrar usuário:", userError);
          }

          navigate("/");

        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        navigate("/login");
      }
    };

    handleAuth();

  }, [navigate]);

  return <div style={{ textAlign: "center", marginTop: "100px" }}>Autenticando...</div>;
}

export default AuthCallback;