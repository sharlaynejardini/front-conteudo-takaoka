import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {

      console.log("=== AUTH CALLBACK ===");

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro:", error);
          navigate("/login");
          return;
        }

        if (data.session) {
          const email = data.session.user.email;
          console.log("Usuário:", email);
          
          // Verifica se é um domínio permitido
          if (email.endsWith("@professor.barueri.br") || email.endsWith("@educbarueri.sp.gov.br")) {
            console.log("Acesso permitido!");
            navigate("/");
          } else {
            console.log("Domínio não autorizado");
            await supabase.auth.signOut();
            navigate("/login");
          }
        } else {
          console.log("Sem sessão");
          navigate("/login");
        }
      } catch (error) {
        console.error("ERRO:", error);
        navigate("/login");
      }
    };

    handleAuth();

  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Autenticando...</h2>
      <p>Aguarde</p>
    </div>
  );
}

export default AuthCallback;