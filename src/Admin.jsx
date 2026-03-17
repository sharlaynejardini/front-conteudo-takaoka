import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import api from "./api";

function Admin() {

  const [aba, setAba] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      setLoading(true);

      const { data } = await supabase
        .from("action_logs")
        .select("*")
        .order("created_at", { ascending: false });

      setLogs(data || []);

      const prof = await api.get("/professores");
      const tur = await api.get("/turmas");
      const disc = await api.get("/disciplinas");
      const atrib = await api.get("/atribuicoes");

      setProfessores(prof.data || []);
      setTurmas(tur.data || []);
      setDisciplinas(disc.data || []);
      setAtribuicoes(atrib.data || []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // 🔥 SAFE GET (NUNCA QUEBRA)
  const get = (obj, path) => {
    try {
      return path.split(".").reduce((o, k) => o?.[k], obj) ?? "-";
    } catch {
      return "-";
    }
  };

  // 🔥 FILTRO SEGURO (SEM JSON.stringify)
  const filtrar = (lista) => {
    if (!busca) return lista;

    return lista.filter(item => {
      return Object.values(item || {}).some(v =>
        String(v).toLowerCase().includes(busca.toLowerCase())
      );
    });
  };

  if (loading) return <div style={{ padding: 40 }}>Carregando...</div>;

  return (
    <div style={styles.page}>

      {/* MENU */}
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
            style={styles.input}
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
          <Table headers={["Nome","Email"]}>
            {filtrar(professores).map(p => (
              <tr key={p.id}>
                <td>{String(p.nome || "-")}</td>
                <td>{String(p.email || "-")}</td>
              </tr>
            ))}
          </Table>
        )}

        {/* TURMAS */}
        {aba === "turmas" && (
          <Table headers={["Nome"]}>
            {filtrar(turmas).map(t => (
              <tr key={t.id}>
                <td>{String(t.nome || "-")}</td>
              </tr>
            ))}
          </Table>
        )}

        {/* DISCIPLINAS */}
        {aba === "disciplinas" && (
          <Table headers={["Nome"]}>
            {filtrar(disciplinas).map(d => (
              <tr key={d.id}>
                <td>{String(d.nome || "-")}</td>
              </tr>
            ))}
          </Table>
        )}

        {/* ATRIBUIÇÕES */}
        {aba === "atribuicoes" && (
          <Table headers={["Professor","Turma","Disciplina"]}>
            {filtrar(atribuicoes).map(a => (
              <tr key={a.id}>
                <td>{String(get(a,"professor.nome"))}</td>
                <td>{String(get(a,"turma.nome"))}</td>
                <td>{String(get(a,"disciplina.nome"))}</td>
              </tr>
            ))}
          </Table>
        )}

        {/* LOGS */}
        {aba === "logs" && (
          <Table headers={["Email","Ação","Data"]}>
            {filtrar(logs).map(l => (
              <tr key={l.id}>
                <td>{String(l.email || "-")}</td>
                <td>{String(l.action || "-")}</td>
                <td>{new Date(l.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </Table>
        )}

      </div>
    </div>
  );
}

/* COMPONENTES */

const Card = ({ title, value }) => (
  <div style={styles.card}>
    <span>{title}</span>
    <h2>{value}</h2>
  </div>
);

const Table = ({ headers, children }) => (
  <table style={styles.table}>
    <thead>
      <tr>
        {headers.map((h,i) => <th key={i}>{String(h)}</th>)}
      </tr>
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
  input: { marginBottom:20, padding:10, width:"100%", borderRadius:8, border:"1px solid #ddd" },
  table: { width:"100%", marginTop:20, borderCollapse:"collapse" },
  card: { flex:1, padding:20, background:"white", borderRadius:12 }
};

export default Admin;