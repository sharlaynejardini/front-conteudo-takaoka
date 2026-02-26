import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./Login";

function App() {

  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user);
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  if (session === undefined) return null;

  if (!session) return <Login />;

  const email = user?.email || "";

  const dominioPermitido =
    email.endsWith("@professor.barueri.br") ||
    email.endsWith("@educbarueri.sp.gov.br");

  if (!dominioPermitido) {
    supabase.auth.signOut();
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Acesso não autorizado</h2>
        <p>Use um email institucional.</p>
      </div>
    );
  }

  return <Outlet />;
}

export default App;