import { Outlet, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function Layout() {

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {

    const checkAdmin = async () => {

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) return;

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionData.session.user.id)
        .single();

      if (data?.role === "admin") {
        setIsAdmin(true);
      }
    };

    checkAdmin();

  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>

      <div
        style={{
          backgroundColor: "#1e3a8a",
          padding: "15px 30px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", gap: "25px" }}>

          {/* PROVAS */}
          <Link to="/" style={linkStyle}>
            Provas
          </Link>

          <Link to="/cronograma" style={linkStyle}>
            Cronograma Provas
          </Link>

          {/* TRABALHOS */}
          <Link to="/trabalho" style={linkStyle}>
            Trabalhos
          </Link>

          <Link to="/cronograma-trabalho" style={linkStyle}>
            Cronograma Trabalhos
          </Link>

          {isAdmin && (
            <Link to="/admin" style={linkStyle}>
              Admin
            </Link>
          )}

        </div>

        <button onClick={logout} style={buttonStyle}>
          Sair
        </button>
      </div>

      <div style={{ padding: "30px" }}>
        <Outlet />
      </div>

    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "15px"
};

const buttonStyle = {
  backgroundColor: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

export default Layout;