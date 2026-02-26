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

        // 🔥 REGISTRA LOGIN
        await supabase.from("login_logs").insert([
          {
            user_id: user.id,
            email: user.email
          }
        ]);

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