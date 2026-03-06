import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {

      const { data } = await supabase.auth.getSession();

      if (data.session) {

        const user = data.session.user;

        // Registra login
        await supabase.from("login_logs").insert([
          {
            user_id: user.id,
            email: user.email
          }
        ]);

        // Registra usuário na tabela users se não existir
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!existingUser) {
          await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email,
              nome: user.user_metadata?.full_name || user.email.split("@")[0]
            }
          ]);
        }

        navigate("/");

      } else {
        navigate("/login");
      }
    };

    handleAuth();

  }, [navigate]);

  return <div>Autenticando...</div>;
}

export default AuthCallback;