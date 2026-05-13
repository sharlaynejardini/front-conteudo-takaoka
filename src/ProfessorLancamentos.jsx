import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api";
import { supabase } from "./supabaseClient";

async function buscarItem(endpoint, params) {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

function transformarConteudoEmLista(conteudo) {
  if (!conteudo) return [];
  if (Array.isArray(conteudo)) return conteudo;

  if (typeof conteudo === "string") {
    try {
      const convertido = JSON.parse(conteudo);
      return Array.isArray(convertido) ? convertido : [convertido];
    } catch {
      return conteudo
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  return [String(conteudo)];
}

function formatarData(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
}

function ProfessorLancamentos() {
  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const carregarAtribuicoes = useCallback(async (professorId) => {
    if (!professorId) {
      setAtribuicoes([]);
      setLancamentos([]);
      return;
    }

    try {
      const response = await api.get(`/atribuicoes/${professorId}`);

      const ordenadas = [...response.data].sort((a, b) => {
        const turmaCompare = a.turma.nome.localeCompare(
          b.turma.nome,
          "pt-BR",
          { sensitivity: "base" }
        );

        if (turmaCompare !== 0) return turmaCompare;

        return a.disciplina.nome.localeCompare(
          b.disciplina.nome,
          "pt-BR",
          { sensitivity: "base" }
        );
      });

      setAtribuicoes(ordenadas);
      setMensagem("");
    } catch (error) {
      console.error(error);
      setAtribuicoes([]);
      setLancamentos([]);
      setMensagem("Erro ao carregar turmas e disciplinas.");
    }
  }, []);

  const buscarLancamentos = useCallback(async (listaAtribuicoes = atribuicoes) => {
    if (listaAtribuicoes.length === 0) return;

    setCarregando(true);
    setMensagem("");

    const consultas = listaAtribuicoes.map(async (atribuicao) => {
      const params = {
        atribuicao_id: atribuicao.id,
        bimestre
      };

      const [avaliacao, trabalho] = await Promise.all([
        buscarItem("/conteudos", params),
        buscarItem("/trabalhos", params)
      ]);

      return {
        atribuicao,
        avaliacao,
        trabalho
      };
    });

    try {
      const resultados = await Promise.all(consultas);
      setLancamentos(resultados);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao buscar lancamentos.");
    } finally {
      setCarregando(false);
    }
  }, [atribuicoes, bimestre]);

  useEffect(() => {
    async function carregarProfessores() {
      try {
        const response = await api.get("/professores");

        const ordenados = [...response.data].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );

        setProfessores(ordenados);

        const ADMIN_EMAIL = "sharlayne.fonseca@professor.barueri.br";
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;

        if (email === ADMIN_EMAIL) {
          setIsAdmin(true);
        }

        const professor = ordenados.find(
          p => p.email?.toLowerCase() === email?.toLowerCase()
        );

        if (professor) {
          setProfessorSelecionado(professor.id);
          await carregarAtribuicoes(professor.id);
        } else {
          setMensagem("Professor nao encontrado para o email logado.");
        }
      } catch (error) {
        console.error(error);
        setMensagem("Erro ao carregar professores.");
      }
    }

    carregarProfessores();
  }, [carregarAtribuicoes]);

  useEffect(() => {
    if (atribuicoes.length > 0) {
      buscarLancamentos(atribuicoes);
    } else {
      setLancamentos([]);
    }
  }, [atribuicoes, buscarLancamentos]);

  const resumo = useMemo(() => {
    const avaliacoes = lancamentos.filter(item => item.avaliacao).length;
    const trabalhos = lancamentos.filter(item => item.trabalho).length;

    return {
      turmas: lancamentos.length,
      avaliacoes,
      trabalhos,
      pendenciasAvaliacao: Math.max(lancamentos.length - avaliacoes, 0),
      pendenciasTrabalho: Math.max(lancamentos.length - trabalhos, 0)
    };
  }, [lancamentos]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Meus Lancamentos</h2>
          <p style={styles.subtitle}>
            Consulte avaliacoes e trabalhos cadastrados por bimestre.
          </p>
        </div>

        <button
          style={styles.button}
          onClick={() => buscarLancamentos()}
          disabled={carregando || atribuicoes.length === 0}
        >
          {carregando ? "Buscando..." : "Atualizar"}
        </button>
      </div>

      {mensagem && <div style={styles.alert}>{mensagem}</div>}

      <div style={styles.filters}>
        <select
          style={styles.select}
          value={professorSelecionado}
          disabled={!isAdmin}
          onChange={(e) => {
            setProfessorSelecionado(e.target.value);
            carregarAtribuicoes(e.target.value);
          }}
        >
          <option value="">Selecione Professor</option>
          {professores.map(professor => (
            <option key={professor.id} value={professor.id}>
              {professor.nome}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={bimestre}
          onChange={(e) => setBimestre(Number(e.target.value))}
        >
          <option value={1}>1o Bimestre</option>
          <option value={2}>2o Bimestre</option>
          <option value={3}>3o Bimestre</option>
          <option value={4}>4o Bimestre</option>
        </select>
      </div>

      <div style={styles.summaryGrid}>
        <ResumoCard label="Turmas/disciplinas" value={resumo.turmas} />
        <ResumoCard label="Avaliacoes lancadas" value={resumo.avaliacoes} />
        <ResumoCard label="Trabalhos lancados" value={resumo.trabalhos} />
        <ResumoCard label="Pendencias" value={resumo.pendenciasAvaliacao + resumo.pendenciasTrabalho} />
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Turma</th>
              <th style={styles.th}>Disciplina</th>
              <th style={styles.th}>Avaliacao</th>
              <th style={styles.th}>Trabalho</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td style={styles.empty} colSpan={4}>Carregando lancamentos...</td>
              </tr>
            )}

            {!carregando && lancamentos.length === 0 && (
              <tr>
                <td style={styles.empty} colSpan={4}>
                  Nenhuma atribuicao encontrada para listar.
                </td>
              </tr>
            )}

            {!carregando && lancamentos.map(({ atribuicao, avaliacao, trabalho }) => (
              <tr key={atribuicao.id}>
                <td style={styles.td}>{atribuicao.turma?.nome}</td>
                <td style={styles.td}>{atribuicao.disciplina?.nome}</td>
                <td style={styles.td}>
                  <LancamentoCell
                    item={avaliacao}
                    data={formatarData(avaliacao?.data_avaliacao)}
                    conteudos={transformarConteudoEmLista(avaliacao?.conteudo)}
                    editPath={`/?atribuicao=${atribuicao.id}&bimestre=${bimestre}`}
                  />
                </td>
                <td style={styles.td}>
                  <LancamentoCell
                    item={trabalho}
                    data={formatarData(trabalho?.data_entrega)}
                    conteudos={transformarConteudoEmLista(trabalho?.conteudo)}
                    detalhe={trabalho?.instrucoes}
                    editPath={`/trabalho?atribuicao=${atribuicao.id}&bimestre=${bimestre}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResumoCard({ label, value }) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryValue}>{value}</div>
      <div style={styles.summaryLabel}>{label}</div>
    </div>
  );
}

function LancamentoCell({ item, data, conteudos, detalhe, editPath }) {
  if (!item) {
    return (
      <div style={styles.pending}>
        <span style={styles.badgePendente}>Pendente</span>
        <Link style={styles.link} to={editPath}>Lancar</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.cellHeader}>
        <span style={styles.badgeLancado}>Lancado</span>
        <Link style={styles.link} to={editPath}>Editar</Link>
      </div>

      <div style={styles.date}>Data: {data}</div>

      {conteudos.map((topico, index) => (
        <div key={index} style={styles.topic}>- {topico}</div>
      ))}

      {detalhe && <div style={styles.detail}>{detalhe}</div>}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    backgroundColor: "white",
    padding: "28px",
    borderRadius: "8px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "20px"
  },
  title: {
    color: "#1e3a8a",
    margin: 0,
    fontSize: "24px"
  },
  subtitle: {
    color: "#64748b",
    marginTop: "6px",
    fontSize: "14px"
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "18px"
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white"
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1e3a8a",
    color: "white",
    cursor: "pointer",
    fontWeight: 600
  },
  alert: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "16px"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "20px"
  },
  summaryCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
    backgroundColor: "#f8fafc"
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1e3a8a"
  },
  summaryLabel: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px"
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px"
  },
  th: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "14px"
  },
  td: {
    padding: "12px",
    borderTop: "1px solid #e2e8f0",
    verticalAlign: "top",
    fontSize: "14px"
  },
  empty: {
    padding: "24px",
    textAlign: "center",
    color: "#64748b"
  },
  cellHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px"
  },
  pending: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center"
  },
  badgeLancado: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "999px",
    padding: "3px 8px",
    fontSize: "12px",
    fontWeight: 700
  },
  badgePendente: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "999px",
    padding: "3px 8px",
    fontSize: "12px",
    fontWeight: 700
  },
  link: {
    color: "#1d4ed8",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "13px"
  },
  date: {
    color: "#334155",
    fontWeight: 600,
    marginBottom: "6px"
  },
  topic: {
    color: "#334155",
    marginTop: "3px"
  },
  detail: {
    color: "#64748b",
    marginTop: "8px",
    fontSize: "13px"
  }
};

export default ProfessorLancamentos;
