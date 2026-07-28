import { Outlet, Link, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

function Layout() {

  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

      if (data?.role === "admin") setIsAdmin(true);
    };

    checkAdmin();

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
      if (!mobile) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const menu = [
    { path: "/", label: "Provas", icon: "📝" },
    { path: "/cronograma", label: "Cronograma", icon: "📅" },
    { path: "/trabalho", label: "Trabalhos", icon: "📚" },
    { path: "/cronograma-trabalho", label: "Cronograma Trab.", icon: "🗂️" },
    { path: "/calendario-escolar", label: "Calendário Escolar", icon: "📅" },
    { path: "/lancamentos", label: "Lançamentos", icon: "📋" },
    { path: "/horario", label: "Horário", icon: "🕒" },
    { path: "/notas-corretor", label: "Resultado das Avaliações", icon: "📊" },
  ];

  if (isAdmin) {
    menu.push({ path: "/admin", label: "Admin", icon: "⚙️" });
  }

  const getTitle = () => {
    const current = menu.find(m => m.path === location.pathname);
    return current ? current.label : "Sistema";
  };

  return (
    <div style={styles.container}>

      {/* OVERLAY MOBILE */}
      {menuOpen && isMobile && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          width: isMobile ? "240px" : (collapsed ? "70px" : "240px"),
          ...(isMobile
            ? (menuOpen ? styles.sidebarOpen : styles.sidebarClosed)
            : {})
        }}
      >

        <div style={styles.sidebarTop}>
          <span style={styles.logo}>📘</span>

          {!collapsed && <span>Sistema</span>}
        </div>

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
            <span>{item.icon}</span>
            {!collapsed && item.label}
          </Link>
        ))}

        {/* COLAPSAR */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseBtn}
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        )}

      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>

          <button
            style={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            ☰
          </button>

          <h3 style={styles.title}>{getTitle()}</h3>

          <button onClick={logout} style={styles.logout}>
            Sair
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
    width: "100%",
    background: "#f1f5f9"
  },

  overlay: {
    position: "fixed",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    zIndex: 999
  },

  sidebar: {
    background: "#0f172a",
    color: "white",
    padding: "20px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "0.3s",
    zIndex: 1000
  },

  sidebarOpen: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    height: "100vh",
    transform: "translateX(0)",
    boxShadow: "12px 0 30px rgba(15, 23, 42, 0.24)"
  },

  sidebarClosed: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    height: "100vh",
    transform: "translateX(-105%)",
    boxShadow: "none"
  },

  sidebarTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontWeight: "bold"
  },

  logo: {
    fontSize: "20px"
  },

  link: {
    color: "#cbd5f5",
    textDecoration: "none",
    padding: "10px",
    borderRadius: "8px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    fontSize: "14px"
  },

  active: {
    background: "#2563eb",
    color: "white"
  },

  collapseBtn: {
    marginTop: "auto",
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer"
  },

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

  title: {
    margin: 0,
    fontSize: "16px"
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

  content: {
    flex: 1,
    padding: "20px",
    overflow: "auto"
  }
};

export default Layout;
