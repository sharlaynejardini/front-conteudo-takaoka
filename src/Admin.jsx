// ==========================================
// ADMIN COMPLETO FINAL (TUDO INTEGRADO)
// ==========================================

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import api from "./api";

function Admin() {

  const [aba, setAba] = useState("dashboard");

  const [loading, setLoading] = useState(true);

  const [actions, setActions] = useState([]);

  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [novoProfessor, setNovoProfessor] = useState("");
  const [novoEmail, setNovoEmail] = useState("");

  const [novaTurma, setNovaTurma] = useState("");
  const [novaDisciplina, setNovaDisciplina] = useState("");

  const [professorAtrib, setProfessorAtrib] = useState("");
  const [turmaAtrib, setTurmaAtrib] = useState("");
  const [disciplinaAtrib, setDisciplinaAtrib] = useState("");

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, []);

  async function carregarDados() {

    setLoading(true);

    // LOGS
    const { data } = await supabase
      .from("action_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setActions(data || []);

    // BASE
    const prof = await api.get("/professores");
    const tur = await api.get("/turmas");
    const disc = await api.get("/disciplinas");

    setProfessores(prof.data);
    setTurmas(tur.data);
    setDisciplinas(disc.data);

    // ATRIBUIÇÕES
    const todas = [];

    for (const p of prof.data) {
      try {
        const res = await api.get(`/atribuicoes/${p.id}`);
        todas.push(...res.data);
      } catch {}
    }

    setAtribuicoes(todas);

    setLoading(false);
  }

  // =========================
  // FORMATAR DATA
  // =========================

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return "-";
    return new Date(dataISO).toLocaleString("pt-BR");
  };

  // =========================
  // FILTRO LOGS
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
  // EXPORTAR CSV
  // =========================

  const exportarCSV = () => {
    const linhas = [["Email", "Ação", "Turma", "Disciplina", "Data"]];

    actions.forEach(a => {
      linhas.push([
        a.email,
        a.action,
        a.turma || "",
        a.disciplina || "",
        formatarDataHora(a.created_at)
      ]);
    });

    const csv = linhas.map(l => l.join(";")).join("\n");

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.csv";
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
  // TURMA
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
  // DISCIPLINA
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
  // ATRIBUIÇÕES
  // =========================

  const criarAtribuicao = async () => {
    if (!professorAtrib || !turmaAtrib || !disciplinaAtrib) {
      alert("Preencha tudo");
      return;
    }

    await api.post("/atribuicoes", {
      professor_id: professorAtrib,
      turma_id: turmaAtrib,
      disciplina_id: disciplinaAtrib
    });

    carregarDados();
  };

  const deletarAtribuicao = async (id) => {
    if (!window.confirm("Excluir atribuição?")) return;
    await api.delete(`/atribuicoes/${id}`);
    carregarDados();
  };

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* MENU */}
      <div style={menuStyle}>
        <h2>Admin</h2>

        <button onClick={() => setAba("dashboard")} style={menuButton}>Dashboard</button>
        <button onClick={() => setAba("professores")} style={menuButton}>Professores</button>
        <button onClick={() => setAba("turmas")} style={menuButton}>Turmas</button>
        <button onClick={() => setAba("disciplinas")} style={menuButton}>Disciplinas</button>
        <button onClick={() => setAba("atribuicoes")} style={menuButton}>Atribuições</button>
        <button onClick={() => setAba("logs")} style={menuButton}>Logs</button>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: 30 }}>

        {aba === "dashboard" && (
          <>
            <h2>Dashboard</h2>
            <div style={cards}>
              <div style={card}>👨‍🏫 {professores.length}</div>
              <div style={card}>🏫 {turmas.length}</div>
              <div style={card}>📚 {disciplinas.length}</div>
              <div style={card}>🔗 {atribuicoes.length}</div>
            </div>
          </>
        )}

        {aba === "professores" && (
          <>
            <h2>Professores</h2>

            <input placeholder="Nome" value={novoProfessor} onChange={e => setNovoProfessor(e.target.value)} />
            <input placeholder="Email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} />
            <button onClick={adicionarProfessor}>Adicionar</button>

            {professores.map(p => (
              <div key={p.id}>
                {p.nome} - {p.email}
                <button onClick={() => deletarProfessor(p.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {aba === "turmas" && (
          <>
            <h2>Turmas</h2>

            <input value={novaTurma} onChange={e => setNovaTurma(e.target.value)} />
            <button onClick={adicionarTurma}>Adicionar</button>

            {turmas.map(t => (
              <div key={t.id}>
                {t.nome}
                <button onClick={() => deletarTurma(t.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {aba === "disciplinas" && (
          <>
            <h2>Disciplinas</h2>

            <input value={novaDisciplina} onChange={e => setNovaDisciplina(e.target.value)} />
            <button onClick={adicionarDisciplina}>Adicionar</button>

            {disciplinas.map(d => (
              <div key={d.id}>
                {d.nome}
                <button onClick={() => deletarDisciplina(d.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {aba === "atribuicoes" && (
          <>
            <h2>Atribuições</h2>

            <select onChange={e => setProfessorAtrib(e.target.value)}>
              <option>Professor</option>
              {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>

            <select onChange={e => setTurmaAtrib(e.target.value)}>
              <option>Turma</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>

            <select onChange={e => setDisciplinaAtrib(e.target.value)}>
              <option>Disciplina</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>

            <button onClick={criarAtribuicao}>Criar</button>

            {atribuicoes.map(a => (
              <div key={a.id}>
                {a.professor?.nome} - {a.turma?.nome} - {a.disciplina?.nome}
                <button onClick={() => deletarAtribuicao(a.id)}>❌</button>
              </div>
            ))}
          </>
        )}

        {aba === "logs" && (
          <>
            <h2>Logs</h2>

            <input placeholder="Email" value={filtroEmail} onChange={(e) => setFiltroEmail(e.target.value)} />
            <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
            <button onClick={exportarCSV}>Exportar</button>

            {filtrarLogs(actions).map(log => (
              <div key={log.id}>
                {log.email} - {log.action}
              </div>
            ))}
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
  width: 200,
  background: "#1e3a8a",
  color: "white",
  padding: 20
};

const menuButton = {
  display: "block",
  width: "100%",
  marginBottom: 10
};

const cards = {
  display: "flex",
  gap: 20
};

const card = {
  padding: 20,
  background: "#f1f5f9",
  borderRadius: 10
};

export default Admin;