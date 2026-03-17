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
      console.log("🧪 getSession RESULT:");
      console.log("SESSION:", data.session);
      console.log("USER:", data.session?.user);

      setSession(data.session);
      setUser(data.session?.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        console.log("🔁 onAuthStateChange:", _event);
        console.log("SESSION:", session);
        console.log("USER:", session?.user);

        setSession(session);
        setUser(session?.user);
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  // 🔥 FORÇA PEGAR DIRETO DO SUPABASE
  useEffect(() => {
    const pegarUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      console.log("🧪 getUser RESULT:");
      console.log("DATA:", data);
      console.log("USER:", data?.user);
      console.log("EMAIL:", data?.user?.email);
      console.log("ERROR:", error);

      if (data?.user?.email) {
        localStorage.setItem("user_email", data.user.email);
        console.log("💾 SALVO VIA getUser:", data.user.email);
      }
    };

    pegarUser();
  }, []);

  console.log("APP: user atual:", user);

  if (session === undefined) return null;

  if (!session) return <Login />;

  const email = user?.email || "";

  const dominioPermitido =
    email.endsWith("@professor.barueri.br") ||
    email.endsWith("@educbarueri.sp.gov.br");

  if (!dominioPermitido) {
    supabase.auth.signOut();
    return <div>Acesso não autorizado</div>;
  }

  return <Outlet />;
}

export default App;