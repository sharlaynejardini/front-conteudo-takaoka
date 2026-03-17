import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import api from "./api";

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

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);

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

  const chartData = {
    labels: ["Professores", "Turmas", "Disciplinas", "Atribuições"],
    datasets: [
      {
        label: "Dados do Sistema",
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

        {["dashboard","professores","turmas","disciplinas","atribuicoes"].map(a => (
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
          <>
            <div style={styles.cards}>
              <Card title="Professores" value={professores.length} color="#3b82f6"/>
              <Card title="Turmas" value={turmas.length} color="#22c55e"/>
              <Card title="Disciplinas" value={disciplinas.length} color="#f59e0b"/>
              <Card title="Atribuições" value={atribuicoes.length} color="#ef4444"/>
            </div>

            <div style={styles.chart}>
              <Bar data={chartData} />
            </div>
          </>
        )}

        {/* PROFESSORES */}
        {aba === "professores" && (
          <Table
            data={filtrar(professores)}
            cols={["nome","email"]}
          />
        )}

        {/* TURMAS */}
        {aba === "turmas" && (
          <Table data={filtrar(turmas)} cols={["nome"]} />
        )}

        {/* DISCIPLINAS */}
        {aba === "disciplinas" && (
          <Table data={filtrar(disciplinas)} cols={["nome"]} />
        )}

        {/* ATRIBUIÇÕES */}
        {aba === "atribuicoes" && (
          <Table
            data={filtrar(atribuicoes)}
            cols={["professor.nome","turma.nome","disciplina.nome"]}
          />
        )}

      </div>
    </div>
  );
}

/* COMPONENTES */

const Card = ({ title, value, color }) => (
  <div style={{
    flex: 1,
    padding: 20,
    borderRadius: 12,
    background: "white",
    borderLeft: `6px solid ${color}`,
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
  }}>
    <span>{title}</span>
    <h2>{value}</h2>
  </div>
);

const Table = ({ data, cols }) => (
  <div style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ background: "#f1f5f9" }}>
        <tr>
          {cols.map(c => <th key={c} style={styles.th}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i} style={{ background: i % 2 ? "#f9fafb" : "white" }}>
            {cols.map(c => (
              <td key={c} style={styles.td}>
                {c.split(".").reduce((o,k)=>o?.[k], item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ESTILOS */

const styles = {
  page: { display: "flex", gap: 20 },

  sidebar: {
    width: 220,
    background: "#0f172a",
    color: "white",
    padding: 20,
    borderRadius: 12
  },

  menuBtn: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "transparent",
    color: "white",
    border: "none",
    cursor: "pointer"
  },

  active: {
    background: "#2563eb",
    borderRadius: 6
  },

  content: { flex: 1 },

  cards: { display: "flex", gap: 20 },

  chart: {
    marginTop: 30,
    background: "white",
    padding: 20,
    borderRadius: 12
  },

  search: {
    marginBottom: 20,
    padding: 10,
    width: "100%",
    borderRadius: 8,
    border: "1px solid #ddd"
  },

  th: { textAlign: "left", padding: 10 },
  td: { padding: 10 }
};

export default Admin;