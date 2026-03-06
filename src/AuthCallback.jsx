import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {

      console.log("========================================");
      console.log("=== AUTH CALLBACK INICIADO ===");
      console.log("========================================");
      console.log("URL completa:", window.location.href);
      console.log("Hash:", window.location.hash);
      console.log("Search:", window.location.search);

      try {
        console.log("\n1. Aguardando 1 segundo para processar...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("\n2. Chamando supabase.auth.getSession()...");
        const { data, error } = await supabase.auth.getSession();
        
        console.log("\n3. RESULTADO getSession:");
        console.log("   - Data:", data);
        console.log("   - Session:", data?.session);
        console.log("   - User:", data?.session?.user);
        console.log("   - Email:", data?.session?.user?.email);
        console.log("   - Error:", error);
        
        if (error) {
          console.error("\n❌ ERRO no getSession:", error);
          console.error("   - Message:", error.message);
          console.error("   - Status:", error.status);
          console.error("   - Stack:", error.stack);
          navigate("/login");
          return;
        }

        if (data.session) {
          const email = data.session.user.email;
          console.log("\n4. SESSÃO ENCONTRADA!");
          console.log("   - Email do usuário:", email);
          
          // Verifica se é um domínio permitido
          const dominioPermitido = email.endsWith("@professor.barueri.br") || email.endsWith("@educbarueri.sp.gov.br");
          console.log("   - Domínio permitido?", dominioPermitido);
          
          if (dominioPermitido) {
            console.log("\n✅ ACESSO PERMITIDO! Redirecionando para home...");
            
            // Registrar login
            try {
              await supabase.from("login_logs").insert({ email });
              console.log("   - Login registrado no histórico");
            } catch (logError) {
              console.error("   - Erro ao registrar login:", logError);
            }
            
            navigate("/");
          } else {
            console.log("\n❌ DOMÍNIO NÃO AUTORIZADO!");
            console.log("   - Fazendo logout...");
            await supabase.auth.signOut();
            navigate("/login");
          }
        } else {
          console.log("\n❌ NENHUMA SESSÃO ENCONTRADA");
          console.log("   - Redirecionando para login...");
          navigate("/login");
        }
      } catch (error) {
        console.error("\n❌❌❌ ERRO CRÍTICO:", error);
        console.error("   - Message:", error.message);
        console.error("   - Stack:", error.stack);
        console.error("   - Objeto completo:", JSON.stringify(error, null, 2));
        navigate("/login");
      }
      
      console.log("========================================");
      console.log("=== AUTH CALLBACK FINALIZADO ===");
      console.log("========================================");
    };

    handleAuth();

  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Autenticando...</h2>
      <p>Aguarde (verifique o console F12)</p>
    </div>
  );
}

export default AuthCallback;