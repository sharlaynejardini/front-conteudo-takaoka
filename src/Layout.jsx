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
          padding: "15px",
          color: "white",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <div>
          <Link to="/" style={linkStyle}>Painel</Link>
          <Link to="/cronograma" style={linkStyle}>Cronograma</Link>

          {isAdmin && (
            <Link to="/admin" style={linkStyle}>Admin</Link>
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
  marginRight: "20px",
  textDecoration: "none"
};

const buttonStyle = {
  backgroundColor: "white",
  border: "none",
  padding: "5px 10px",
  cursor: "pointer"
};

export default Layout;