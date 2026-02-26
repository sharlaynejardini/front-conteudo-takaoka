// ==========================================
// LAYOUT.JSX
// Estrutura visual principal do sistema
// ==========================================

import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* HEADER */}
      <header
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2 style={{ margin: 0 }}>Sistema de Conteúdos</h2>

        {/* MENU */}
        <nav>
          <Link
            to="/"
            style={{ color: "white", marginRight: "20px", textDecoration: "none" }}
          >
            Agendamento Av. Bimestral
          </Link>

          <Link
            to="/cronograma"
            style={{ color: "white", textDecoration: "none" }}
          >
            Cronograma Bimestral
          </Link>
        </nav>
      </header>

      {/* CONTEÚDO */}
      <main
        style={{
          padding: "30px",
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;