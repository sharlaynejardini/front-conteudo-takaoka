// ==========================================
// LAYOUT.JSX
// Layout global protegido
// ==========================================

import { Outlet, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Layout() {

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