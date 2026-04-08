import { useEffect, useState } from "react";
import api from "./api";
import { supabase } from "./supabaseClient";
import { logAction } from "./utils/logAction";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Admin() {

  const [aba, setAba] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [logs, setLogs] = useState([]);

  // FORM STATES
  const [nomeProf, setNomeProf] = useState("");
  const [emailProf, setEmailProf] = useState("");

  const [nomeTurma, setNomeTurma] = useState("");
  const [nomeDisc, setNomeDisc] = useState("");

  const [profId, setProfId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [discId, setDiscId] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);

    const prof = await api.get("/professores");
    const tur = await api.get("/turmas");
    const disc = await api.get("/disciplinas");
    const atrib = await api.get("/atribuicoes");
    const { data: logsData } = await supabase
      .from("action_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setProfessores(prof.data || []);
    setTurmas(tur.data || []);
    setDisciplinas(disc.data || []);
    setAtribuicoes(atrib.data || []);
    setLogs(logsData || []);

    setLoading(false);
  }

  // ================= CRUD =================

  const addProfessor = async () => {
    if (!nomeProf || !emailProf) return;
    await api.post("/professores", { nome: nomeProf, email: emailProf });
    await logAction({ action: "CREATE", entidade: "Professor", detalhes: `Nome: ${nomeProf}` });
    setNomeProf(""); setEmailProf("");
    carregarDados();
  };

  const delProfessor = async (id) => {
    if (!window.confirm("Excluir?")) return;
    const prof = professores.find(p => p.id === id);
    await api.delete(`/professores/${id}`);
    await logAction({ action: "DELETE", entidade: "Professor", detalhes: `Nome: ${prof?.nome}` });
    carregarDados();
  };

  const addTurma = async () => {
    if (!nomeTurma) return;
    await api.post("/turmas", { nome: nomeTurma });
    await logAction({ action: "CREATE", entidade: "Turma", detalhes: `Nome: ${nomeTurma}` });
    setNomeTurma("");
    carregarDados();
  };

  const delTurma = async (id) => {
    if (!window.confirm("Excluir?")) return;
    const turma = turmas.find(t => t.id === id);
    await api.delete(`/turmas/${id}`);
    await logAction({ action: "DELETE", entidade: "Turma", detalhes: `Nome: ${turma?.nome}` });
    carregarDados();
  };

  const addDisc = async () => {
    if (!nomeDisc) return;
    await api.post("/disciplinas", { nome: nomeDisc });
    await logAction({ action: "CREATE", entidade: "Disciplina", detalhes: `Nome: ${nomeDisc}` });
    setNomeDisc("");
    carregarDados();
  };

  const delDisc = async (id) => {
    if (!window.confirm("Excluir?")) return;
    const disc = disciplinas.find(d => d.id === id);
    await api.delete(`/disciplinas/${id}`);
    await logAction({ action: "DELETE", entidade: "Disciplina", detalhes: `Nome: ${disc?.nome}` });
    carregarDados();
  };

  const addAtrib = async () => {
    if (!profId || !turmaId || !discId) return;
    const prof = professores.find(p => p.id == profId);
    const turma = turmas.find(t => t.id == turmaId);
    const disc = disciplinas.find(d => d.id == discId);
    await api.post("/atribuicoes", { professor_id: profId, turma_id: turmaId, disciplina_id: discId });
    await logAction({ action: "CREATE", entidade: "Atribuição", detalhes: `${prof?.nome} → ${turma?.nome} / ${disc?.nome}` });
    carregarDados();
  };

  const delAtrib = async (id) => {
    if (!window.confirm("Excluir?")) return;
    const atrib = atribuicoes.find(a => a.id === id);
    await api.delete(`/atribuicoes/${id}`);
    await logAction({ action: "DELETE", entidade: "Atribuição", detalhes: `ID: ${id}` });
    carregarDados();
  };

  // ================= HELPERS =================

  const filtrar = (lista) =>
    lista.filter(item =>
      JSON.stringify(item || "")
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

  const safe = (v) => String(v ?? "-");

  const get = (obj, path) =>
    path.split(".").reduce((o,k)=>o?.[k], obj) ?? "-";

  const chartData = {
    labels: ["Professores", "Turmas", "Disciplinas", "Atribuições"],
    datasets: [
      {
        label: "Dados",
        data: [
          professores.length,
          turmas.length,
          disciplinas.length,
          atribuicoes.length,
        ],
      },
    ],
  };

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>⚙️ Admin</h2>

        {["dashboard","professores","turmas","disciplinas","atribuicoes","historico"].map(a => (
          <button key={a} onClick={()=>setAba(a)}
            style={{...styles.menuBtn, ...(aba===a?styles.active:{})}}>
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
            onChange={e=>setBusca(e.target.value)}
            style={styles.search}
          />
        )}

        {/* DASHBOARD */}
        {aba === "dashboard" && (
          <>
            <div style={styles.cards}>
              <Card title="Professores" value={professores.length} />
              <Card title="Turmas" value={turmas.length} />
              <Card title="Disciplinas" value={disciplinas.length} />
              <Card title="Atribuições" value={atribuicoes.length} />
            </div>

            <div style={styles.chart}>
              <Bar data={chartData} />
            </div>
          </>
        )}

        {/* PROFESSORES */}
        {aba === "professores" && (
          <>
            <div style={styles.form}>
              <input placeholder="Nome" value={nomeProf} onChange={e=>setNomeProf(e.target.value)} />
              <input placeholder="Email" value={emailProf} onChange={e=>setEmailProf(e.target.value)} />
              <button onClick={addProfessor}>Adicionar</button>
            </div>

            <Table data={filtrar(professores)} cols={["nome","email"]} onDelete={delProfessor}/>
          </>
        )}

        {/* TURMAS */}
        {aba === "turmas" && (
          <>
            <div style={styles.form}>
              <input value={nomeTurma} onChange={e=>setNomeTurma(e.target.value)} />
              <button onClick={addTurma}>Adicionar</button>
            </div>

            <Table data={filtrar(turmas)} cols={["nome"]} onDelete={delTurma}/>
          </>
        )}

        {/* DISCIPLINAS */}
        {aba === "disciplinas" && (
          <>
            <div style={styles.form}>
              <input value={nomeDisc} onChange={e=>setNomeDisc(e.target.value)} />
              <button onClick={addDisc}>Adicionar</button>
            </div>

            <Table data={filtrar(disciplinas)} cols={["nome"]} onDelete={delDisc}/>
          </>
        )}

        {/* HISTÓRICO */}
        {aba === "historico" && (
          <>
            <h2>📜 Histórico de Ações</h2>
            <table style={{ width:"100%", marginTop:20, borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f1f5f9" }}>
                  <th style={styles.th}>Usuário</th>
                  <th style={styles.th}>Ação</th>
                  <th style={styles.th}>Entidade</th>
                  <th style={styles.th}>Turma</th>
                  <th style={styles.th}>Disciplina</th>
                  <th style={styles.th}>Bimestre</th>
                  <th style={styles.th}>Detalhes</th>
                  <th style={styles.th}>Data</th>
                </tr>
              </thead>
              <tbody>
                {filtrar(logs).map((log, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid #e2e8f0" }}>
                    <td style={styles.td}>{log.email || "-"}</td>
                    <td style={{ ...styles.td, fontWeight:"bold",
                      color: log.action==="CREATE"?"green": log.action==="DELETE"?"red":"orange" }}>
                      {log.action === "CREATE" && "🟢 Criou"}
                      {log.action === "DELETE" && "🔴 Excluiu"}
                      {log.action === "UPDATE" && "🟡 Alterou"}
                      {log.action !== "CREATE" && log.action !== "DELETE" && log.action !== "UPDATE" && `🟡 ${log.action}`}
                    </td>
                    <td style={styles.td}>{log.entidade || "-"}</td>
                    <td style={styles.td}>{log.turma || "-"}</td>
                    <td style={styles.td}>{log.disciplina || "-"}</td>
                    <td style={styles.td}>{log.bimestre ? `${log.bimestre}º` : "-"}</td>
                    <td style={styles.td}>{log.detalhes || "-"}</td>
                    <td style={styles.td}>{new Date(log.created_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ATRIBUIÇÕES */}
        {aba === "atribuicoes" && (
          <>
            <div style={styles.form}>
              <select onChange={e=>setProfId(e.target.value)}>
                <option>Professor</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <select onChange={e=>setTurmaId(e.target.value)}>
                <option>Turma</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>

              <select onChange={e=>setDiscId(e.target.value)}>
                <option>Disciplina</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>

              <button onClick={addAtrib}>Criar</button>
            </div>

            <Table data={filtrar(atribuicoes)} cols={["professor.nome","turma.nome","disciplina.nome"]} onDelete={delAtrib}/>
          </>
        )}

      </div>
    </div>
  );
}

/* COMPONENTES */

const Card = ({ title, value }) => (
  <div style={{ flex:1, padding:20, background:"white", borderRadius:12 }}>
    <span>{title}</span>
    <h2>{value}</h2>
  </div>
);

const Table = ({ data, cols, onDelete }) => (
  <table style={{ width:"100%", marginTop:20 }}>
    <thead>
      <tr>{cols.map(c => <th key={c}>{c}</th>)}<th></th></tr>
    </thead>
    <tbody>
      {data.map((item,i)=>(
        <tr key={i}>
          {cols.map(c=>(
            <td key={c}>
              {c.split(".").reduce((o,k)=>o?.[k], item) || "-"}
            </td>
          ))}
          <td>
            {onDelete && <button onClick={()=>onDelete(item.id)}>❌</button>}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ESTILOS */

const styles = {
  page:{display:"flex",gap:20},
  sidebar:{width:220,background:"#0f172a",color:"white",padding:20},
  menuBtn:{width:"100%",padding:10,marginBottom:10,background:"transparent",color:"white",border:"none"},
  active:{background:"#2563eb"},
  content:{flex:1},
  cards:{display:"flex",gap:20},
  chart:{marginTop:20,background:"white",padding:20},
  form:{display:"flex",gap:10,marginBottom:10},
  search:{marginBottom:20,padding:10,width:"100%"},
  th:{padding:"10px 12px",textAlign:"left",fontWeight:"bold"},
  td:{padding:"10px 12px"}
};

export default Admin;