import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import api from "./api";

function Admin() {

  const [aba, setAba] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");

  const [actions, setActions] = useState([]);
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

  const filtrar = (lista) =>
    lista.filter(item =>
      JSON.stringify(item).toLowerCase().includes(busca.toLowerCase())
    );

  const formatarData = (d) =>
    new Date(d).toLocaleString("pt-BR");

  const exportarCSV = () => {
    const linhas = [["Email","Ação","Data"]];
    actions.forEach(a => {
      linhas.push([a.email, a.action, formatarData(a.created_at)]);
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
    await api.post("/professores", { nome: novoProfessor, email: novoEmail });
    setNovoProfessor(""); setNovoEmail("");
    carregarDados();
  };

  const deletarProfessor = async (id) => {
    if (!window.confirm("Excluir?")) return;
    await api.delete(`/professores/${id}`);
    carregarDados();
  };

  const adicionarTurma = async () => {
    if (!novaTurma) return;
    await api.post("/turmas", { nome: novaTurma });
    setNovaTurma("");
    carregarDados();
  };

  const adicionarDisciplina = async () => {
    if (!novaDisciplina) return;
    await api.post("/disciplinas", { nome: novaDisciplina });
    setNovaDisciplina("");
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

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>⚙️ Admin</h2>

        {["dashboard","professores","turmas","disciplinas","atribuicoes","logs"].map(a => (
          <button
            key={a}
            onClick={() => setAba(a)}
            style={{
              ...styles.menuBtn,
              ...(aba === a ? styles.active : {})
            }}
          >
            {a.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {aba !== "dashboard" && (
          <input
            placeholder="🔍 Buscar..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={styles.search}
          />
        )}

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <div style={styles.cards}>
            <Card title="Professores" value={professores.length}/>
            <Card title="Turmas" value={turmas.length}/>
            <Card title="Disciplinas" value={disciplinas.length}/>
            <Card title="Atribuições" value={atribuicoes.length}/>
          </div>
        )}

        {/* PROFESSORES */}
        {aba === "professores" && (
          <>
            <Form>
              <input placeholder="Nome" value={novoProfessor} onChange={e => setNovoProfessor(e.target.value)} style={styles.input}/>
              <input placeholder="Email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} style={styles.input}/>
              <button onClick={adicionarProfessor} style={styles.primary}>Adicionar</button>
            </Form>

            <Table headers={["Nome","Email",""]}>
              {filtrar(professores).map(p => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.email}</td>
                  <td><button style={styles.danger} onClick={()=>deletarProfessor(p.id)}>Excluir</button></td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {/* TURMAS */}
        {aba === "turmas" && (
          <>
            <Form>
              <input value={novaTurma} onChange={e => setNovaTurma(e.target.value)} style={styles.input}/>
              <button onClick={adicionarTurma} style={styles.primary}>Adicionar</button>
            </Form>

            <Table headers={["Nome"]}>
              {filtrar(turmas).map(t => (
                <tr key={t.id}><td>{t.nome}</td></tr>
              ))}
            </Table>
          </>
        )}

        {/* DISCIPLINAS */}
        {aba === "disciplinas" && (
          <>
            <Form>
              <input value={novaDisciplina} onChange={e => setNovaDisciplina(e.target.value)} style={styles.input}/>
              <button onClick={adicionarDisciplina} style={styles.primary}>Adicionar</button>
            </Form>

            <Table headers={["Nome"]}>
              {filtrar(disciplinas).map(d => (
                <tr key={d.id}><td>{d.nome}</td></tr>
              ))}
            </Table>
          </>
        )}

        {/* ATRIBUIÇÕES */}
        {aba === "atribuicoes" && (
          <>
            <Form>
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
            </Form>

            <Table headers={["Professor","Turma","Disciplina"]}>
              {filtrar(atribuicoes).map(a => (
                <tr key={a.id}>
                  <td>{a.professor?.nome}</td>
                  <td>{a.turma?.nome}</td>
                  <td>{a.disciplina?.nome}</td>
                </tr>
              ))}
            </Table>
          </>
        )}

        {/* LOGS */}
        {aba === "logs" && (
          <>
            <button onClick={exportarCSV} style={styles.primary}>Exportar CSV</button>

            <Table headers={["Email","Ação","Data"]}>
              {filtrar(actions).map(l => (
                <tr key={l.id}>
                  <td>{l.email}</td>
                  <td>{l.action}</td>
                  <td>{formatarData(l.created_at)}</td>
                </tr>
              ))}
            </Table>
          </>
        )}

      </div>
    </div>
  );
}

/* COMPONENTES */

const Card = ({ title, value }) => (
  <div style={{
    flex:1,
    padding:20,
    background:"white",
    borderRadius:12,
    boxShadow:"0 5px 20px rgba(0,0,0,0.05)"
  }}>
    <span>{title}</span>
    <h2>{value}</h2>
  </div>
);

const Form = ({ children }) => (
  <div style={{ display:"flex", gap:10, marginBottom:20 }}>{children}</div>
);

const Table = ({ headers, children }) => (
  <table style={{ width:"100%", marginTop:20 }}>
    <thead>
      <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

/* ESTILOS */

const styles = {
  page: { display:"flex", gap:20 },
  sidebar: { width:220, background:"#0f172a", color:"white", padding:20, borderRadius:12 },
  menuBtn: { width:"100%", padding:10, marginBottom:10, background:"transparent", color:"white", border:"none", cursor:"pointer" },
  active: { background:"#2563eb", borderRadius:6 },
  content: { flex:1 },
  cards: { display:"flex", gap:20 },
  search: { marginBottom:20, padding:10, width:"100%", borderRadius:8, border:"1px solid #ddd" },
  input: { flex:1, padding:10, borderRadius:8, border:"1px solid #ddd" },
  primary: { background:"#2563eb", color:"white", border:"none", padding:"10px 16px", borderRadius:8, cursor:"pointer" },
  danger: { background:"#ef4444", color:"white", border:"none", padding:"6px 10px", borderRadius:6 }
};

export default Admin;