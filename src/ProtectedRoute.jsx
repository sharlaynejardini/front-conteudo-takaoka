import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  if (loading) return <div>Carregando...</div>;

  if (!session) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;