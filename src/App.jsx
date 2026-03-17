import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./Login";

function App() {

  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);

  useEffect(() => {

    console.log("=== APP.JSX INICIANDO ===");

    // 🔥 PEGAR SESSÃO INICIAL
    supabase.auth.getSession().then(({ data }) => {
      console.log("APP: Sessão inicial:", data.session);
      setSession(data.session);
      setUser(data.session?.user);

      // 🔥 SALVAR AQUI TAMBÉM
      const email = data.session?.user?.email;
      if (email) {
        localStorage.setItem("user_email", email);
        console.log("💾 Email salvo (init):", email);
      }
    });

    // 🔥 O MAIS IMPORTANTE (LOGIN REAL ACONTECE AQUI)
    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {

        console.log("🔁 EVENTO AUTH:", _event);
        console.log("SESSION:", session);

        setSession(session);
        setUser(session?.user);

        // 🔥🔥🔥 SALVAR AQUI (GARANTIDO)
        const email = session?.user?.email;

        if (email) {
          localStorage.setItem("user_email", email);
          console.log("💾 Email salvo (evento):", email);
        }
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  console.log("APP: Renderizando:", session);

  if (session === undefined) {
    return null;
  }

  if (!session) {
    return <Login />;
  }

  const email = user?.email || "";

  const dominioPermitido =
    email.endsWith("@professor.barueri.br") ||
    email.endsWith("@educbarueri.sp.gov.br");

  if (!dominioPermitido) {
    supabase.auth.signOut();
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Acesso não autorizado</h2>
        <p>Email: {email}</p>
      </div>
    );
  }

  return <Outlet />;
}

export default App;