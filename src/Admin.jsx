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
    const atrib = await api.get("/atribuicoes");

    setProfessores(prof.data);
    setTurmas(tur.data);
    setDisciplinas(disc.data);
    setAtribuicoes(atrib.data);

    setLoading(false);
  }

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return "-";
    return new Date(dataISO).toLocaleString("pt-BR");
  };

  const filtrarLogs = (logs) => {
    return logs.filter(log => {
      const matchEmail =
        !filtroEmail || log.email?.toLowerCase().includes(filtroEmail.toLowerCase());

      const matchData =
        !filtroData || log.created_at?.startsWith(filtroData);

      return matchEmail && matchData;
    });
  };

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

  if (loading) return <div style={styles.loading}>Carregando...</div>;

  return (
    <div style={styles.container}>

      {/* MENU */}
      <div style={styles.menu}>
        <h2 style={{ marginBottom: 20 }}>Admin</h2>

        {["dashboard","professores","turmas","disciplinas","atribuicoes","logs"].map(a => (
          <button
            key={a}
            onClick={() => setAba(a)}
            style={{
              ...styles.menuButton,
              ...(aba === a ? styles.menuActive : {})
            }}
          >
            {a.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div style={styles.content}>

        {aba === "dashboard" && (
          <div style={styles.cards}>
            <Card title="Professores" value={professores.length} />
            <Card title="Turmas" value={turmas.length} />
            <Card title="Disciplinas" value={disciplinas.length} />
            <Card title="Atribuições" value={atribuicoes.length} />
          </div>
        )}

        {aba === "professores" && (
          <>
            <FormRow>
              <input placeholder="Nome" value={novoProfessor} onChange={e => setNovoProfessor(e.target.value)} style={styles.input}/>
              <input placeholder="Email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={styles.input}/>
              <button onClick={adicionarProfessor} style={styles.primary}>Adicionar</button>
            </FormRow>

            <Table headers={["Nome","Email",""]}>
              {professores.map(p => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.email}</td>
                  <td><button onClick={() => deletarProfessor(p.id)} style={styles.danger}>Excluir</button></td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {aba === "turmas" && (
          <>
            <FormRow>
              <input value={novaTurma} onChange={e => setNovaTurma(e.target.value)} style={styles.input}/>
              <button onClick={adicionarTurma} style={styles.primary}>Adicionar</button>
            </FormRow>

            <Table headers={["Nome",""]}>
              {turmas.map(t => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td><button onClick={() => deletarTurma(t.id)} style={styles.danger}>Excluir</button></td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {aba === "disciplinas" && (
          <>
            <FormRow>
              <input value={novaDisciplina} onChange={e => setNovaDisciplina(e.target.value)} style={styles.input}/>
              <button onClick={adicionarDisciplina} style={styles.primary}>Adicionar</button>
            </FormRow>

            <Table headers={["Nome",""]}>
              {disciplinas.map(d => (
                <tr key={d.id}>
                  <td>{d.nome}</td>
                  <td><button onClick={() => deletarDisciplina(d.id)} style={styles.danger}>Excluir</button></td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {aba === "atribuicoes" && (
          <>
            <FormRow>
              <select onChange={e => setProfessorAtrib(e.target.value)} style={styles.input}>
                <option>Professor</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <select onChange={e => setTurmaAtrib(e.target.value)} style={styles.input}>
                <option>Turma</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>

              <select onChange={e => setDisciplinaAtrib(e.target.value)} style={styles.input}>
                <option>Disciplina</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>

              <button onClick={criarAtribuicao} style={styles.primary}>Criar</button>
            </FormRow>

            <Table headers={["Professor","Turma","Disciplina",""]}>
              {atribuicoes.map(a => (
                <tr key={a.id}>
                  <td>{a.professor?.nome}</td>
                  <td>{a.turma?.nome}</td>
                  <td>{a.disciplina?.nome}</td>
                  <td><button onClick={() => deletarAtribuicao(a.id)} style={styles.danger}>Excluir</button></td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {aba === "logs" && (
          <>
            <FormRow>
              <input placeholder="Email" value={filtroEmail} onChange={e => setFiltroEmail(e.target.value)} style={styles.input}/>
              <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} style={styles.input}/>
              <button onClick={exportarCSV} style={styles.primary}>Exportar CSV</button>
            </FormRow>

            <Table headers={["Email","Ação","Data"]}>
              {filtrarLogs(actions).map(log => (
                <tr key={log.id}>
                  <td>{log.email}</td>
                  <td>{log.action}</td>
                  <td>{formatarDataHora(log.created_at)}</td>
                </tr>
              ))}
            </Table>
          </>
        )}

      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES

const Card = ({ title, value }) => (
  <div style={styles.card}>
    <span>{title}</span>
    <h2>{value}</h2>
  </div>
);

const FormRow = ({ children }) => (
  <div style={styles.formRow}>{children}</div>
);

const Table = ({ headers, children }) => (
  <table style={styles.table}>
    <thead>
      <tr>
        {headers.map(h => <th key={h}>{h}</th>)}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

// ESTILOS

const styles = {
  container: { display: "flex", gap: 20 },

  menu: {
    width: 200,
    background: "#0f172a",
    color: "white",
    padding: 20,
    borderRadius: 10
  },

  menuButton: {
    width: "100%",
    padding: 10,
    marginBottom: 8,
    background: "transparent",
    color: "white",
    border: "none",
    cursor: "pointer",
    textAlign: "left"
  },

  menuActive: {
    background: "#2563eb",
    borderRadius: 6
  },

  content: { flex: 1 },

  cards: { display: "flex", gap: 20 },

  card: {
    flex: 1,
    padding: 20,
    background: "white",
    borderRadius: 10,
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
  },

  formRow: { display: "flex", gap: 10, marginBottom: 20 },

  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
    flex: 1
  },

  primary: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 6,
    cursor: "pointer"
  },

  danger: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer"
  },

  table: {
    width: "100%",
    background: "white",
    borderRadius: 10,
    overflow: "hidden",
    borderCollapse: "collapse"
  },

  loading: { padding: 40 }
};

export default Admin;