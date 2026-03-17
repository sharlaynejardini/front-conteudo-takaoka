import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./Login";

function App() {

  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);

  useEffect(() => {

    console.log("=== APP.JSX INICIANDO ===");

    supabase.auth.getSession().then(({ data }) => {
      console.log("APP: Sessão obtida:", data.session ? "SIM" : "NÃO");
      console.log("APP: Usuário:", data.session?.user?.email);
      setSession(data.session);
      setUser(data.session?.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        console.log("APP: Mudança de estado de auth:", _event);
        console.log("APP: Nova sessão:", session ? "SIM" : "NÃO");
        setSession(session);
        setUser(session?.user);
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  // 🔥🔥🔥 NOVO USEEFFECT (ESSA É A CORREÇÃO REAL)
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem("user_email", user.email);
      console.log("💾 Email salvo no localStorage:", user.email);
    }
  }, [user]);

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
  console.log("APP: Verificando domínio para:", email);

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

  console.log("APP: Acesso permitido, renderizando Outlet");
  return <Outlet />;
}

export default App;