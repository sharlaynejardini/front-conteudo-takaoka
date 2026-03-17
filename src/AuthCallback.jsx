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

      try {
        console.log("\n1. Pegando usuário com getUser()...");

        const { data, error } = await supabase.auth.getUser();

        console.log("\n2. RESULTADO getUser:");
        console.log("   - Data:", data);
        console.log("   - User:", data?.user);
        console.log("   - Email:", data?.user?.email);
        console.log("   - Error:", error);

        if (error || !data.user) {
          console.error("\n❌ ERRO ao obter usuário:", error);
          navigate("/login");
          return;
        }

        const email = data.user.email;

        console.log("\n3. USUÁRIO ENCONTRADO!");
        console.log("   - Email:", email);

        // 🔥 SALVAR EMAIL
        localStorage.setItem("user_email", email);
        console.log("   - Email salvo no localStorage");

        // Verificar domínio
        const dominioPermitido =
          email.endsWith("@professor.barueri.br") ||
          email.endsWith("@educbarueri.sp.gov.br");

        console.log("   - Domínio permitido?", dominioPermitido);

        if (!dominioPermitido) {
          console.log("\n❌ DOMÍNIO NÃO PERMITIDO");
          await supabase.auth.signOut();
          navigate("/login");
          return;
        }

        console.log("\n✅ LOGIN OK! Redirecionando...");

        // Registrar login (opcional)
        try {
          await supabase.from("login_logs").insert({ email });
        } catch (e) {
          console.warn("Erro ao salvar log:", e);
        }

        navigate("/");

      } catch (error) {
        console.error("\n❌ ERRO CRÍTICO:", error);
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
      <p>Aguarde...</p>
    </div>
  );
}

export default AuthCallback;