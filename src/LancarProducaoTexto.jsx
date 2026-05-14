import { useMemo, useState } from "react";
import api from "./api";

const TURMAS = [
  { nome: "6A", turmaId: "18cfb171-2893-4c5e-a3c2-c1111589dc8b", atribuicaoId: "b0a39639-fdae-49e5-94b5-26151120d010" },
  { nome: "6B", turmaId: "7b6ab56c-0597-4bd0-9b85-1201e1819653", atribuicaoId: "1e00f931-7bf1-45c4-b019-5230eda2d0a1" },
  { nome: "7A", turmaId: "1677a604-a002-499e-9b9b-13ab25e9ec80", atribuicaoId: "3f8be744-8433-4c6f-b81e-0d9cffb4cd96" },
  { nome: "7B", turmaId: "de6b8961-c124-4bfe-b75a-deca7f9d2e92", atribuicaoId: "7d367dd1-a2cf-417c-b0f5-7e4eda6be04c" },
  { nome: "8A", turmaId: "161b3912-c32f-443d-8133-c1fbcfe9387d", atribuicaoId: "8a20a49c-8dbb-4c3b-a6d7-d755def5d149" },
  { nome: "8B", turmaId: "f8f6d5eb-0038-4142-875f-a252ff1fa058", atribuicaoId: "b7a5b3b9-8a08-44cc-9481-ff315ee5b16f" },
  { nome: "8C", turmaId: "b54603c5-3013-420f-9ce1-102cac5c3a92", atribuicaoId: "ae823961-8d5e-44b6-9f9f-a83ed2471678" },
  { nome: "9A", turmaId: "d663cd59-6544-4900-923f-ffc16c4bd493", atribuicaoId: "d78cc11f-f22d-4edc-a593-6cc1fbf1ff2a" },
  { nome: "9B", turmaId: "a71db3b3-3c43-4059-826f-5259c189d5b2", atribuicaoId: "c4af5d24-bd6b-46a0-8b86-8f02c9ab0fed" },
  { nome: "9C", turmaId: "5d0c1549-5a58-422f-a7e2-4ab146baba0b", atribuicaoId: "6b476982-539b-4827-b03b-bcaee54ac36b" }
];

const BIMESTRE = 2;
const DATA_AVALIACAO = "2026-05-19";
const CONTEUDO = "Produção de texto";

function LancarProducaoTexto() {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState([]);
  const [erro, setErro] = useState("");

  const resumo = useMemo(() => {
    const criados = resultado.filter(item => item.status === "criado").length;
    const existentes = resultado.filter(item => item.status === "existente").length;
    const erros = resultado.filter(item => item.status === "erro").length;

    return { criados, existentes, erros };
  }, [resultado]);

  const jaExisteLancamento = async (turma) => {
    const response = await api.get("/cronograma", {
      params: {
        turma_id: turma.turmaId,
        bimestre: BIMESTRE
      }
    });

    return response.data.some(item => {
      const data = item.data_avaliacao?.split("T")[0];
      const disciplina = item.atribuicao?.disciplina?.nome || "";
      const conteudos = Array.isArray(item.conteudo) ? item.conteudo : [item.conteudo];

      return (
        data === DATA_AVALIACAO &&
        disciplina.toLowerCase().includes("portugu") &&
        conteudos.some(conteudo =>
          String(conteudo || "").toLowerCase().includes("produção de texto")
        )
      );
    });
  };

  const executarLancamento = async () => {
    const confirmar = window.confirm(
      "Cadastrar Produção de texto em Língua Portuguesa para 6A, 6B, 7A, 7B, 8A, 8B, 8C, 9A, 9B e 9C no dia 19/05/2026?"
    );

    if (!confirmar) return;

    setExecutando(true);
    setErro("");
    setResultado([]);

    const novosResultados = [];

    for (const turma of TURMAS) {
      try {
        const existe = await jaExisteLancamento(turma);

        if (existe) {
          novosResultados.push({
            turma: turma.nome,
            status: "existente",
            mensagem: "Já estava cadastrado."
          });
          setResultado([...novosResultados]);
          continue;
        }

        const response = await api.post("/conteudos", {
          atribuicao_id: turma.atribuicaoId,
          bimestre: BIMESTRE,
          conteudo: JSON.stringify([CONTEUDO]),
          data_avaliacao: DATA_AVALIACAO
        });

        novosResultados.push({
          turma: turma.nome,
          status: "criado",
          mensagem: `Cadastrado com ID ${response.data?.id || "-"}`
        });
      } catch (error) {
        novosResultados.push({
          turma: turma.nome,
          status: "erro",
          mensagem: error.response?.data?.detail || error.response?.data?.error || error.message
        });
      }

      setResultado([...novosResultados]);
    }

    setExecutando(false);
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Lançamento em lote</h2>
      <p style={styles.text}>
        Língua Portuguesa: Produção de texto, 2º bimestre, 19/05/2026.
      </p>

      <div style={styles.box}>
        <strong>Turmas:</strong> {TURMAS.map(turma => turma.nome).join(", ")}
      </div>

      <button
        style={styles.button}
        onClick={executarLancamento}
        disabled={executando}
      >
        {executando ? "Cadastrando..." : "Cadastrar avaliações"}
      </button>

      {erro && <div style={styles.error}>{erro}</div>}

      {resultado.length > 0 && (
        <>
          <div style={styles.summary}>
            Criados: {resumo.criados} | Já existentes: {resumo.existentes} | Erros: {resumo.erros}
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map(item => (
                <tr key={item.turma}>
                  <td style={styles.td}>{item.turma}</td>
                  <td style={styles.td}>{item.status}</td>
                  <td style={styles.td}>{item.mensagem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "white",
    padding: "28px",
    borderRadius: "8px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  title: {
    color: "#1e3a8a",
    marginBottom: "8px"
  },
  text: {
    color: "#334155",
    marginBottom: "16px"
  },
  box: {
    padding: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    background: "#f8fafc",
    marginBottom: "16px"
  },
  button: {
    padding: "12px 18px",
    background: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700
  },
  summary: {
    marginTop: "20px",
    marginBottom: "10px",
    fontWeight: 700,
    color: "#334155"
  },
  error: {
    marginTop: "16px",
    padding: "12px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px"
  },
  th: {
    textAlign: "left",
    padding: "10px",
    background: "#1e3a8a",
    color: "white"
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #e2e8f0"
  }
};

export default LancarProducaoTexto;
