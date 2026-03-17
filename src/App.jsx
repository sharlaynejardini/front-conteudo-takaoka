import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./Login";

function App() {

  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);

  // 🔥 NOVO: guardar token
  const [token, setToken] = useState(null);

  useEffect(() => {

    console.log("=== APP.JSX INICIANDO ===");

    supabase.auth.getSession().then(({ data }) => {
      console.log("APP: Sessão obtida:", data.session ? "SIM" : "NÃO");
      console.log("APP: Usuário:", data.session?.user?.email);

      setSession(data.session);
      setUser(data.session?.user);

      // 🔥 PEGAR TOKEN
      setToken(data.session?.access_token);

      console.log("🔑 Token inicial:", data.session?.access_token);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {

        console.log("APP: Mudança de estado de auth:", _event);
        console.log("APP: Nova sessão:", session ? "SIM" : "NÃO");

        setSession(session);
        setUser(session?.user);

        // 🔥 ATUALIZAR TOKEN
        setToken(session?.access_token);

        console.log("🔑 Token atualizado:", session?.access_token);
        console.log("📧 Email atualizado:", session?.user?.email);
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  console.log("APP: Renderizando com session:", session === undefined ? "UNDEFINED" : session ? "EXISTE" : "NULL");

  if (session === undefined) {
    console.log("APP: Aguardando sessão...");
    return null;
  }

  if (!session) {
    console.log("APP: Sem sessão, mostrando Login");
    return <Login />;
  }

  const email = user?.email || "";
  console.log("APP: Email atual:", email);

  const dominioPermitido =
    email.endsWith("@professor.barueri.br") ||
    email.endsWith("@educbarueri.sp.gov.br");

  console.log("APP: Domínio permitido:", dominioPermitido);

  if (!dominioPermitido) {
    console.log("APP: Domínio não permitido, fazendo logout");
    supabase.auth.signOut();
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Acesso não autorizado</h2>
        <p>Use um email institucional.</p>
        <p>Email usado: {email}</p>
      </div>
    );
  }

  // 🔥 DEBUG FINAL (AGORA CERTO)
  console.log("✅ EMAIL LOGADO:", email);
  console.log("🔑 TOKEN ATIVO:", token);

  return <Outlet />;
}

export default App;