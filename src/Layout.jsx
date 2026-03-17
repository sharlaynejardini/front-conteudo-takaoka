import { Outlet, Link, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function Layout() {

  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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
    window.location.href = "/login";
  };

  const menu = [
    { path: "/", label: "Provas", icon: "📝" },
    { path: "/cronograma", label: "Cronograma Provas", icon: "📅" },
    { path: "/trabalho", label: "Trabalhos", icon: "📚" },
    { path: "/cronograma-trabalho", label: "Cronograma Trabalhos", icon: "🗂️" },
    { path: "/horario", label: "Horário", icon: "🕒" },
  ];

  if (isAdmin) {
    menu.push({ path: "/admin", label: "Admin", icon: "⚙️" });
  }

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={{
        ...styles.sidebar,
        ...(menuOpen ? styles.sidebarMobileOpen : {})
      }}>

        <h2 style={styles.logo}>Sistema</h2>

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              ...(location.pathname === item.path ? styles.active : {})
            }}
            onClick={() => setMenuOpen(false)}
          >
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}

      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>

          <button
            style={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <button onClick={logout} style={styles.logout}>
            🚪 Sair
          </button>

        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          <Outlet />
        </div>

      </div>

    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    height: "100vh",
    width: "100%"
  },

  /* SIDEBAR */
  sidebar: {
    width: "240px",
    background: "#1e293b",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "0.3s"
  },

  sidebarMobileOpen: {
    position: "absolute",
    zIndex: 1000,
    height: "100%"
  },

  logo: {
    marginBottom: "20px"
  },

  link: {
    color: "#cbd5f5",
    textDecoration: "none",
    padding: "10px",
    borderRadius: "8px",
    display: "flex",
    gap: "10px",
    fontSize: "14px"
  },

  active: {
    background: "#2563eb",
    color: "white"
  },

  /* MAIN */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  header: {
    height: "60px",
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px"
  },

  menuButton: {
    fontSize: "20px",
    background: "none",
    border: "none",
    cursor: "pointer"
  },

  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  /* CONTENT */
  content: {
    flex: 1,
    padding: "20px",
    background: "#f1f5f9",
    overflow: "auto"
  }
};

export default Layout;