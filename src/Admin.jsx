// ==========================================
// ADMIN COMPLETO COM CRUD REAL
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
  }, []);

  async function carregarDados() {
    setLoading(true);

    const { data } = await supabase
      .from("action_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setActions(data || []);

    const prof = await api.get("/professores");
    const tur = await api.get("/turmas");
    const disc = await api.get("/disciplinas");

    setProfessores(prof.data);
    setTurmas(tur.data);
    setDisciplinas(disc.data);

    setLoading(false);
  }

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

  // =========================
  // UI
  // =========================

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* MENU */}
      <div style={menuStyle}>
        <h2>⚙️ Admin</h2>

        <button onClick={() => setAba("dashboard")} style={menuButton}>📊 Dashboard</button>
        <button onClick={() => setAba("professores")} style={menuButton}>👨‍🏫 Professores</button>
        <button onClick={() => setAba("turmas")} style={menuButton}>🏫 Turmas</button>
        <button onClick={() => setAba("disciplinas")} style={menuButton}>📚 Disciplinas</button>
        <button onClick={() => setAba("logs")} style={menuButton}>📋 Logs</button>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: "30px" }}>

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <div>
            <h2>📊 Dashboard</h2>

            <div style={cards}>
              <div style={card}>👨‍🏫 {professores.length} Professores</div>
              <div style={card}>🏫 {turmas.length} Turmas</div>
              <div style={card}>📚 {disciplinas.length} Disciplinas</div>
            </div>
          </div>
        )}

        {/* PROFESSORES */}
        {aba === "professores" && (
          <div>
            <h2>👨‍🏫 Professores</h2>

            <input placeholder="Nome" value={novoProfessor} onChange={e => setNovoProfessor(e.target.value)} style={inputStyle}/>
            <input placeholder="Email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={inputStyle}/>
            <button onClick={adicionarProfessor} style={buttonStyle}>Adicionar</button>

            {professores.map(p => (
              <div key={p.id} style={item}>
                {p.nome} - {p.email}
                <button onClick={() => deletarProfessor(p.id)}>❌</button>
              </div>
            ))}
          </div>
        )}

        {/* TURMAS */}
        {aba === "turmas" && (
          <div>
            <h2>🏫 Turmas</h2>

            <input placeholder="Nome" value={novaTurma} onChange={e => setNovaTurma(e.target.value)} style={inputStyle}/>
            <button onClick={adicionarTurma} style={buttonStyle}>Adicionar</button>

            {turmas.map(t => (
              <div key={t.id} style={item}>
                {t.nome}
                <button onClick={() => deletarTurma(t.id)}>❌</button>
              </div>
            ))}
          </div>
        )}

        {/* DISCIPLINAS */}
        {aba === "disciplinas" && (
          <div>
            <h2>📚 Disciplinas</h2>

            <input placeholder="Nome" value={novaDisciplina} onChange={e => setNovaDisciplina(e.target.value)} style={inputStyle}/>
            <button onClick={adicionarDisciplina} style={buttonStyle}>Adicionar</button>

            {disciplinas.map(d => (
              <div key={d.id} style={item}>
                {d.nome}
                <button onClick={() => deletarDisciplina(d.id)}>❌</button>
              </div>
            ))}
          </div>
        )}

        {/* LOGS (SEU ORIGINAL MANTIDO) */}
        {aba === "logs" && (
          <div>
            <h2>📋 Logs</h2>

            {actions.map(a => (
              <div key={a.id}>
                {a.email} - {a.action}
              </div>
            ))}
          </div>
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
  borderRadius: "10px"
};

const inputStyle = {
  padding: "8px",
  marginRight: "10px"
};

const buttonStyle = {
  padding: "8px 12px",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  borderRadius: "6px"
};

const item = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px"
};

export default Admin;