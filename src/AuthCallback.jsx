import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
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