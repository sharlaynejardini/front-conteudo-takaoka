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
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", margin: 0, padding: 0 }}>

      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          padding: "18px 40px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>

          {/* PROVAS */}
          <Link to="/" style={linkStyle}>
            📝 Provas Bimestrais
          </Link>

          <Link to="/cronograma" style={linkStyle}>
            📅 Cronograma Provas
          </Link>

          {/* TRABALHOS */}
          <Link to="/trabalho" style={linkStyle}>
            📚 Trabalhos Mensais
          </Link>

          <Link to="/cronograma-trabalho" style={linkStyle}>
             📅 Cronograma Trabalhos
          </Link>

          {/* HORÁRIO */}
          <Link to="/horario" style={linkStyle}>
            🕒 Horário Escolar
          </Link>

          {isAdmin && (
            <Link to="/admin" style={linkStyle}>
              ⚙️ Admin
            </Link>
          )}

        </div>

        <button onClick={logout} style={buttonStyle}>
          🚪 Sair
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>

    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "15px",
  padding: "8px 16px",
  borderRadius: "6px",
  transition: "all 0.3s ease",
  display: "inline-block"
};

const buttonStyle = {
  backgroundColor: "white",
  color: "#1e3a8a",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

export default Layout;