// ==========================================
// ADMIN ROUTE
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {

  const ADMIN_EMAILS = [
    "sharlayne.fonseca@professor.barueri.br",
    "wilber.garcia@professor.barueri.br"
  ];

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    async function checkAdmin() {

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const user = sessionData.session.user;
      const userId = user.id;
      const email = user.email?.toLowerCase();

      console.log("User ID:", userId);

      if (ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("Profile data:", data);
      console.log("Profile error:", error);

      if (data && data.role === "admin") {
        setIsAdmin(true);
      }

      setLoading(false);
    }

    checkAdmin();

  }, []);

  if (loading) return <div style={{ padding: "40px" }}>Carregando...</div>;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;
