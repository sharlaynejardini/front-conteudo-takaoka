import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {

      console.log("=== INICIANDO AUTH CALLBACK ===");
      console.log("URL atual:", window.location.href);
      console.log("Hash:", window.location.hash);
      console.log("Search:", window.location.search);

      try {
        // Primeiro tenta processar o hash/query params da URL
        console.log("1. Processando callback OAuth da URL...");
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        console.log("2. Resultado getSession:", authData);
        console.log("2.1 Erro:", authError);

        // Se não encontrou sessão, tenta extrair do hash manualmente
        if (!authData.session && window.location.hash) {
          console.log("3. Tentando extrair tokens do hash...");
          
          // Aguarda um pouco para o Supabase processar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          console.log("3.1 Retry getSession:", retryData);
          console.log("3.2 Retry erro:", retryError);
          
          if (retryData.session) {
            await processarUsuario(retryData.session.user);
            navigate("/");
            return;
          }
        }

        if (authData.session) {
          await processarUsuario(authData.session.user);
          navigate("/");
        } else {
          console.log("4. Sem sessão após todas tentativas, redirecionando para login");
          navigate("/login");
        }
      } catch (error) {
        console.error("5. ERRO GERAL:", error);
        navigate("/login");
      }
    };

    const processarUsuario = async (user) => {
      console.log("6. Processando usuário:", user.email);
      
      try {
        await supabase.from("login_logs").insert([{
          user_id: user.id,
          email: user.email
        }]);
        console.log("6.1 Login registrado");
      } catch (e) {
        console.error("6.2 Erro ao registrar login:", e);
      }

      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from("users").insert([{
            id: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.email.split("@")[0]
          }]);
          console.log("6.3 Usuário criado");
        }
      } catch (e) {
        console.error("6.4 Erro ao criar usuário:", e);
      }
    };

    handleAuth();

  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Autenticando...</h2>
      <p>Aguarde enquanto processamos seu login</p>
    </div>
  );
}

export default AuthCallback;