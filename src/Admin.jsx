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
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [bimestreCal, setBimestreCal] = useState(1);
  const [calendarioFund1, setCalendarioFund1] = useState({});
  const [calendarioFund2, setCalendarioFund2] = useState({});
  const [loadingCal, setLoadingCal] = useState(false);

  // FORM STATES
  const [nomeProf, setNomeProf] = useState("");
  const [emailProf, setEmailProf] = useState("");

  const [nomeTurma, setNomeTurma] = useState("");
  const [nomeDisc, setNomeDisc] = useState("");

  const [profId, setProfId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [discId, setDiscId] = useState("");

  const FUND1 = ["1","2","3","4","5"];
  const FUND2 = ["6","7","8","9"];

  const pertenceAo = (nomeTurma, anos) => anos.some(a => nomeTurma.startsWith(a));

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const transformarConteudo = (conteudo) => {
    if (!conteudo) return [];
    if (Array.isArray(conteudo)) return conteudo;
    try { const c = JSON.parse(conteudo); return Array.isArray(c) ? c : [c]; }
    catch { return conteudo.split(",").map(i => i.trim()).filter(Boolean); }
  };

  const buscarCalendario = async (bim) => {
    setLoadingCal(true);

    try {
      const turmasF1 = turmas.filter(t => pertenceAo(t.nome, FUND1));
      const turmasF2 = turmas.filter(t => pertenceAo(t.nome, FUND2));

      const fetchTurma = async (turma) => {
        try {
          const res = await api.get("/cronograma", { params: { turma_id: turma.id, bimestre: bim } });
          return res.data.map(item => ({ ...item, turmaNome: turma.nome }));
        } catch { return []; }
      };

      const agruparPorData = (itens) => {
        const mapa = {};
        itens.forEach(item => {
          const data = item.data_avaliacao?.split("T")[0];
          if (!data) return;
          if (!mapa[data]) mapa[data] = [];
          mapa[data].push(item);
        });
        return mapa;
      };

      const [r1, r2] = await Promise.all([
        Promise.all(turmasF1.map(fetchTurma)),
        Promise.all(turmasF2.map(fetchTurma))
      ]);

      setCalendarioFund1(agruparPorData(r1.flat()));
      setCalendarioFund2(agruparPorData(r2.flat()));
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar o calendÃ¡rio do admin.");
    } finally {
      setLoadingCal(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setErro("");

    try {
      const [prof, tur, disc, atrib] = await Promise.all([
        api.get("/professores"),
        api.get("/turmas"),
        api.get("/disciplinas"),
        api.get("/atribuicoes")
      ]);

      const { data: logsData, error: logsError } = await supabase
        .from("action_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logsError) {
        console.error(logsError);
      }

      setProfessores(prof.data || []);
      setTurmas(tur.data || []);
      setDisciplinas(disc.data || []);
      setAtribuicoes(atrib.data || []);
      setLogs(logsData || []);
    } catch (error) {
      console.error(error);
      setErro(error.response?.data?.detail || "Erro ao carregar dados do admin.");
    } finally {
      setLoading(false);
    }
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

  if (erro) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Erro na tela do admin</h2>
        <p>{erro}</p>
        <button onClick={carregarDados}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>⚙️ Admin</h2>

        {["dashboard","professores","turmas","disciplinas","atribuicoes","historico","calendario"].map(a => (
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

        {/* CALENDÁRIO */}
        {aba === "calendario" && (
          <>
            <h2>📅 Calendário Geral de Provas</h2>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
              <select
                value={bimestreCal}
                onChange={e => setBimestreCal(Number(e.target.value))}
                style={{ padding:"8px 12px", borderRadius:8, border:"1px solid #cbd5e1" }}
              >
                {[1,2,3,4].map(b => <option key={b} value={b}>{b}º Bimestre</option>)}
              </select>
              <button
                onClick={() => buscarCalendario(bimestreCal)}
                style={{ padding:"8px 20px", background:"#2563eb", color:"white", border:"none", borderRadius:8, cursor:"pointer" }}
              >
                Buscar
              </button>
            </div>

            {loadingCal && <div>Carregando...</div>}

            {!loadingCal && Object.keys(calendarioFund1).length > 0 && (
              <>
                <h3 style={{ color:"#1e3a8a", marginBottom:12 }}>📚 1º ao 5º ano</h3>
                <CalendarioSegmento dados={calendarioFund1} formatarData={formatarData} />
              </>
            )}

            {!loadingCal && Object.keys(calendarioFund2).length > 0 && (
              <>
                <h3 style={{ color:"#1e3a8a", margin:"32px 0 12px" }}>📚 6º ao 9º ano</h3>
                <CalendarioSegmento dados={calendarioFund2} formatarData={formatarData} />
              </>
            )}
          </>
        )}

        {/* HISTÓRICO */}
        {aba === "historico" && (
          <>
            <h2>📜 Histórico de Ações</h2>
            <select
              value={filtroProfessor}
              onChange={e => setFiltroProfessor(e.target.value)}
              style={{ marginBottom:16, padding:"8px 12px", borderRadius:8, border:"1px solid #cbd5e1", minWidth:260 }}
            >
              <option value="">Todos os professores</option>
              {[...new Set(logs.map(l => l.email).filter(Boolean))].sort().map(email => {
                const prof = professores.find(p => p.email?.toLowerCase() === email.toLowerCase());
                return <option key={email} value={email}>{prof ? prof.nome : email}</option>;
              })}
            </select>
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
                {filtrar(logs).filter(log => !filtroProfessor || log.email === filtroProfessor).map((log, i) => (
                  <tr key={i} style={{ borderBottom:"1px solid #e2e8f0" }}>
                    <td style={styles.td}>{professores.find(p => p.email?.toLowerCase() === log.email?.toLowerCase())?.nome || log.email || "-"}</td>
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

const CORES_DISCIPLINA = [
  { bg:"#dbeafe", color:"#1e40af" },
  { bg:"#dcfce7", color:"#166534" },
  { bg:"#fef9c3", color:"#854d0e" },
  { bg:"#fce7f3", color:"#9d174d" },
  { bg:"#ede9fe", color:"#5b21b6" },
  { bg:"#ffedd5", color:"#9a3412" },
  { bg:"#cffafe", color:"#155e75" },
  { bg:"#f1f5f9", color:"#334155" },
];

const CalendarioSegmento = ({ dados, formatarData, refEl }) => {
  const datasOrdenadas = Object.keys(dados).sort();
  if (datasOrdenadas.length === 0) return <p style={{ color:"#94a3b8" }}>Nenhuma avaliação lançada.</p>;

  const turmasNomes = [...new Set(Object.values(dados).flat().map(i => i.turmaNome))]
    .sort((a,b) => a.localeCompare(b, "pt-BR"));

  const todasDisciplinas = [...new Set(Object.values(dados).flat().map(i => i.atribuicao?.disciplina?.nome).filter(Boolean))];
  const mapaCores = Object.fromEntries(todasDisciplinas.map((d, i) => [d, CORES_DISCIPLINA[i % CORES_DISCIPLINA.length]]));

  return (
    <div ref={refEl}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
        {todasDisciplinas.map(d => {
          const cor = mapaCores[d];
          return (
            <span key={d} style={{ background:cor.bg, color:cor.color, padding:"3px 10px", borderRadius:6, fontWeight:500, fontSize:12 }}>
              {d}
            </span>
          );
        })}
      </div>
      <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr>
            <th style={thCal}>Data</th>
            {turmasNomes.map(t => <th key={t} style={thCal}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {datasOrdenadas.map((data, i) => {
            const itens = dados[data];
            return (
              <tr key={data} style={{ background: i%2===0 ? "#f8fafc" : "white" }}>
                <td style={{ ...tdCal, fontWeight:"600", whiteSpace:"nowrap", color:"#1e3a8a" }}>
                  {formatarData(data)}
                </td>
                {turmasNomes.map(turma => {
                  const provas = itens.filter(it => it.turmaNome === turma);
                  return (
                    <td key={turma} style={{ ...tdCal, verticalAlign:"top" }}>
                      {provas.length === 0 ? <span style={{ color:"#cbd5e1" }}>—</span> :
                        provas.map((p, j) => {
                          const disc = p.atribuicao?.disciplina?.nome || "-";
                          const cor = mapaCores[disc] || CORES_DISCIPLINA[0];
                          return (
                            <div key={j} style={{
                              background: cor.bg, borderRadius:6, padding:"3px 7px",
                              marginBottom:3, color: cor.color, fontWeight:500
                            }}>
                              {disc}
                            </div>
                          );
                        })
                      }
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
};

const thCal = {
  padding:"10px 12px", background:"#1e3a8a", color:"white",
  textAlign:"center", fontWeight:"600", whiteSpace:"nowrap",
  border:"1px solid #1e40af"
};

const tdCal = {
  padding:"8px 10px", border:"1px solid #e2e8f0", textAlign:"center"
};

export default Admin;
