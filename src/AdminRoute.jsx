import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const checkAdmin = async () => {

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    checkAdmin();

  }, []);

  if (loading) return <div>Carregando...</div>;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;