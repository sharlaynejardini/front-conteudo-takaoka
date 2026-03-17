// ==========================================
// ADMIN COMPLETO (LOGS + DASHBOARD + CRUD REAL)
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import api from "./api";

function Admin() {

  const [aba, setAba] = useState("dashboard");

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [novoProfessor, setNovoProfessor] = useState("");
  const [novoEmail, setNovoEmail] = useState("");

  const [novaTurma, setNovaTurma] = useState("");
  const [novaDisciplina, setNovaDisciplina] = useState("");

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, []);

  async function carregarDados() {
    setLoading(true);

    // LOGS (mantido)
    const { data: actionData } = await supabase
      .from("action_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setActions(actionData || []);

    // CRUD
    const prof = await api.get("/professores");
    const tur = await api.get("/turmas");
    const disc = await api.get("/disciplinas");

    setProfessores(prof.data);
    setTurmas(tur.data);
    setDisciplinas(disc.data);

    setLoading(false);
  }

  // =========================
  // FORMATAR DATA (SEU ORIGINAL)
  // =========================

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return "-";

    try {
      const date = new Date(dataISO);

      const dia = String(date.getDate()).padStart(2, "0");
      const mes = String(date.getMonth() + 1).padStart(2, "0");
      const ano = date.getFullYear();
      const hora = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const seg = String(date.getSeconds()).padStart(2, "0");

      return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
    } catch {
      return dataISO;
    }
  };

  // =========================
  // FILTRO LOGS (SEU ORIGINAL)
  // =========================

  const filtrarLogs = (logs) => {
    return logs.filter(log => {
      const matchEmail =
        !filtroEmail || log.email?.toLowerCase().includes(filtroEmail.toLowerCase());

      const matchData =
        !filtroData || log.created_at?.startsWith(filtroData);

      return matchEmail && matchData;
    });
  };

  // =========================
  // EXPORTAR CSV (SEU ORIGINAL)
  // =========================

  const exportarCSV = () => {
    const linhas = [
      ["Email", "Ação", "Turma", "Disciplina", "Bimestre", "Detalhes", "Data"]
    ];

    actions.forEach(a => {
      linhas.push([
        a.email,
        a.action,
        a.turma || "",
        a.disciplina || "",
        a.bimestre ? `${a.bimestre}º` : "",
        a.detalhes || "",
        formatarDataHora(a.created_at)
      ]);
    });

    const csv = linhas.map(l => l.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_acoes.csv";
    a.click();
  };

  // =========================
  // CRUD PROFESSOR
  // =========================

  const adicionarProfessor = async () => {
    if (!novoProfessor || !novoEmail) return;

    await api.post("/professores", {
      nome: novoProfessor,
      email: novoEmail
    });

    setNovoProfessor("");
    setNovoEmail("");
    carregarDados();
  };

  const deletarProfessor = async (id) => {
    if (!window.confirm("Excluir professor?")) return;

    await api.delete(`/professores/${id}`);
    carregarDados();
  };

  // =========================
  // CRUD TURMA
  // =========================

  const adicionarTurma = async () => {
    if (!novaTurma) return;

    await api.post("/turmas", { nome: novaTurma });

    setNovaTurma("");
    carregarDados();
  };

  const deletarTurma = async (id) => {
    if (!window.confirm("Excluir turma?")) return;

    await api.delete(`/turmas/${id}`);
    carregarDados();
  };

  // =========================
  // CRUD DISCIPLINA
  // =========================

  const adicionarDisciplina = async () => {
    if (!novaDisciplina) return;

    await api.post("/disciplinas", { nome: novaDisciplina });

    setNovaDisciplina("");
    carregarDados();
  };

  const deletarDisciplina = async (id) => {
    if (!window.confirm("Excluir disciplina?")) return;

    await api.delete(`/disciplinas/${id}`);
    carregarDados();
  };

  if (loading) {
    return <div style={{ padding: "40px" }}>Carregando...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* MENU */}
      <div style={menuStyle}>
        <h2>Painel</h2>

        <button onClick={() => setAba("dashboard")} style={menuButton}>📊 Dashboard</button>
        <button onClick={() => setAba("professores")} style={menuButton}>👨‍🏫 Professores</button>
        <button onClick={() => setAba("turmas")} style={menuButton}>🏫 Turmas</button>
        <button onClick={() => setAba("disciplinas")} style={menuButton}>📚 Disciplinas</button>
        <button onClick={() => setAba("logs")} style={menuButton}>📋 Logs</button>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: "40px", maxWidth: "1200px", margin: "auto" }}>

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <>
            <h2>📊 Visão Geral</h2>

            <div style={cards}>
              <div style={card}>👨‍🏫 {professores.length}</div>
              <div style={card}>🏫 {turmas.length}</div>
              <div style={card}>📚 {disciplinas.length}</div>
            </div>
          </>
        )}

        {/* PROFESSORES */}
        {aba === "professores" && (
          <>
            <h2>Professores</h2>

            <input placeholder="Nome" value={novoProfessor} onChange={e => setNovoProfessor(e.target.value)} style={inputStyle}/>
            <input placeholder="Email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={inputStyle}/>
            <button onClick={adicionarProfessor} style={buttonStyle}>Adicionar</button>

            {professores.map(p => (
              <div key={p.id} style={item}>
                {p.nome} - {p.email}
                <button onClick={() => deletarProfessor(p.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {/* TURMAS */}
        {aba === "turmas" && (
          <>
            <h2>Turmas</h2>

            <input placeholder="Nome" value={novaTurma} onChange={e => setNovaTurma(e.target.value)} style={inputStyle}/>
            <button onClick={adicionarTurma} style={buttonStyle}>Adicionar</button>

            {turmas.map(t => (
              <div key={t.id} style={item}>
                {t.nome}
                <button onClick={() => deletarTurma(t.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {/* DISCIPLINAS */}
        {aba === "disciplinas" && (
          <>
            <h2>Disciplinas</h2>

            <input placeholder="Nome" value={novaDisciplina} onChange={e => setNovaDisciplina(e.target.value)} style={inputStyle}/>
            <button onClick={adicionarDisciplina} style={buttonStyle}>Adicionar</button>

            {disciplinas.map(d => (
              <div key={d.id} style={item}>
                {d.nome}
                <button onClick={() => deletarDisciplina(d.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {/* LOGS (SEU ORIGINAL INTACTO) */}
        {aba === "logs" && (
          <>
            <h3>Histórico de Ações</h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input placeholder="Filtrar email" value={filtroEmail} onChange={(e) => setFiltroEmail(e.target.value)} style={inputStyle}/>
              <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} style={inputStyle}/>
              <button onClick={exportarCSV} style={buttonStyle}>Exportar CSV</button>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Ação</th>
                  <th>Turma</th>
                  <th>Disciplina</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {filtrarLogs(actions).map(log => (
                  <tr key={log.id}>
                    <td>{log.email}</td>
                    <td>{log.action}</td>
                    <td>{log.turma}</td>
                    <td>{log.disciplina}</td>
                    <td>{formatarDataHora(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

      </div>
    </div>
  );
}

// =========================
// ESTILOS
// =========================

const menuStyle = {
  width: "220px",
  background: "#1e3a8a",
  color: "white",
  padding: "20px"
};

const menuButton = {
  display: "block",
  width: "100%",
  marginBottom: "10px",
  padding: "10px",
  background: "white",
  color: "#1e3a8a",
  border: "none",
  borderRadius: "6px"
};

const cards = {
  display: "flex",
  gap: "20px"
};

const card = {
  padding: "20px",
  background: "#f1f5f9",
  borderRadius: "10px",
  fontSize: "22px"
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
  borderRadius: "6px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const item = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px"
};

export default Admin;