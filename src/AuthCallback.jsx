import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    const handleAuth = async () => {

      console.log("=== INICIANDO AUTH CALLBACK ===");

      try {
        console.log("1. Buscando sessão...");
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        console.log("2. Sessão obtida:", data);
        console.log("2.1 Erro de sessão:", sessionError);

        if (data.session) {

          const user = data.session.user;
          console.log("3. Usuário autenticado:", {
            id: user.id,
            email: user.email,
            metadata: user.user_metadata
          });

          // Registra login
          try {
            console.log("4. Tentando registrar login...");
            const { error: logError } = await supabase.from("login_logs").insert([
              {
                user_id: user.id,
                email: user.email
              }
            ]);
            if (logError) {
              console.error("4.1 Erro ao registrar login:", logError);
            } else {
              console.log("4.2 Login registrado com sucesso");
            }
          } catch (logError) {
            console.error("4.3 Exceção ao registrar login:", logError);
          }

          // Registra usuário na tabela users se não existir
          try {
            console.log("5. Verificando se usuário existe...");
            const { data: existingUser, error: checkError } = await supabase
              .from("users")
              .select("id")
              .eq("email", user.email)
              .maybeSingle();

            console.log("5.1 Usuário existente:", existingUser);
            console.log("5.2 Erro ao verificar:", checkError);

            if (!existingUser) {
              console.log("6. Criando novo usuário...");
              const { error: insertError } = await supabase.from("users").insert([
                {
                  id: user.id,
                  email: user.email,
                  nome: user.user_metadata?.full_name || user.email.split("@")[0]
                }
              ]);
              if (insertError) {
                console.error("6.1 Erro ao criar usuário:", insertError);
              } else {
                console.log("6.2 Usuário criado com sucesso");
              }
            } else {
              console.log("6.3 Usuário já existe, pulando criação");
            }
          } catch (userError) {
            console.error("6.4 Exceção ao registrar usuário:", userError);
          }

          console.log("7. Navegando para /");
          navigate("/");

        } else {
          console.log("8. Sem sessão, redirecionando para login");
          navigate("/login");
        }
      } catch (error) {
        console.error("9. ERRO GERAL na autenticação:", error);
        console.error("9.1 Stack:", error.stack);
        navigate("/login");
      }
    };

    handleAuth();

  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Autenticando...</h2>
      <p>Verifique o console para logs detalhados</p>
    </div>
  );
}

export default AuthCallback;