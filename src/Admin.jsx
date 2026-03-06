// ==========================================
// ADMIN.JSX
// Painel Administrativo
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Admin() {

  const [logins, setLogins] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroData, setFiltroData] = useState("");

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, []);

  async function carregarDados() {
    setLoading(true);

    const { data: loginData } = await supabase
      .from("login_logs")
      .select("*")
      .order("login_at", { ascending: false });

    const { data: actionData } = await supabase
      .from("action_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setLogins(loginData || []);
    setActions(actionData || []);
    setLoading(false);
  }

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return "-";
    const partes = dataISO.split("T");
    const data = partes[0];
    const [ano, mes, dia] = data.split("-");
    
    if (partes[1]) {
      const horaFormatada = partes[1].split(".")[0];
      return `${dia}/${mes}/${ano} ${horaFormatada}`;
    }
    
    return `${dia}/${mes}/${ano}`;
  };

  const filtrarLogs = (logs, campoData) => {
    return logs.filter(log => {
      const matchEmail =
        !filtroEmail || log.email?.toLowerCase().includes(filtroEmail.toLowerCase());

      const matchData =
        !filtroData || log[campoData]?.startsWith(filtroData);

      return matchEmail && matchData;
    });
  };

  const exportarCSV = () => {
    const linhas = [
      ["Tipo", "Email", "Ação", "Turma", "Disciplina", "Bimestre", "Detalhes", "Data"]
    ];

    actions.forEach(a => {
      linhas.push([
        "AÇÃO",
        a.email,
        a.action,
        a.turma || "",
        a.disciplina || "",
        a.bimestre ? `${a.bimestre}º` : "",
        a.detalhes || "",
        formatarDataHora(a.created_at)
      ]);
    });

    logins.forEach(l => {
      linhas.push([
        "LOGIN",
        l.email,
        "Login no sistema",
        "",
        "",
        "",
        "",
        formatarDataHora(l.login_at)
      ]);
    });

    const csv = linhas.map(l => l.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_logs.csv";
    a.click();
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Carregando dados...</div>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "auto" }}>

      <h2 style={{ marginBottom: "20px" }}>Painel Administrativo</h2>

      {/* FILTROS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Filtrar por email"
          value={filtroEmail}
          onChange={(e) => setFiltroEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          style={inputStyle}
        />

        <button onClick={carregarDados} style={buttonStyle}>
          🔄 Atualizar
        </button>

        <button onClick={exportarCSV} style={buttonStyle}>
          Exportar CSV
        </button>
      </div>

      {/* LOGINS */}
      <h3>Histórico de Logins</h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Data</th>
          </tr>
        </thead>
        <tbody>
          {filtrarLogs(logins, "login_at").map(log => (
            <tr key={log.id}>
              <td style={tdStyle}>{log.email}</td>
              <td style={tdStyle}>
                {formatarDataHora(log.login_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br /><br />

      {/* AÇÕES */}
      <h3>Histórico de Ações</h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Ação</th>
            <th style={thStyle}>Turma</th>
            <th style={thStyle}>Disciplina</th>
            <th style={thStyle}>Bimestre</th>
            <th style={thStyle}>Detalhes</th>
            <th style={thStyle}>Data</th>
          </tr>
        </thead>
        <tbody>
          {filtrarLogs(actions, "created_at").map(log => (
            <tr key={log.id}>
              <td style={tdStyle}>{log.email}</td>
              <td style={tdStyle}>{log.action}</td>
              <td style={tdStyle}>{log.turma || "-"}</td>
              <td style={tdStyle}>{log.disciplina || "-"}</td>
              <td style={tdStyle}>
                {log.bimestre ? `${log.bimestre}º` : "-"}
              </td>
              <td style={tdStyle}>{log.detalhes || "-"}</td>
              <td style={tdStyle}>
                {formatarDataHora(log.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#1e3a8a",
  color: "white",
  textAlign: "left"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px"
};

const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  padding: "8px 14px",
  backgroundColor: "#1e3a8a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default Admin;