import { useCallback, useEffect, useMemo, useState } from "react";
import corretorApi from "./corretorApi";
import { getBimestreAtual } from "./utils/bimestreAtual";

const TAKAOKA_ESCOLA_ID = "8d869f43-cf96-4497-9257-0fb0450b4637";
const TAKAOKA_ESCOLA_NOME = "EMEF YOJIRO TAKAOKA";

function listarResultados(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.resultados)) return payload.resultados;
  if (Array.isArray(payload.alunos)) return payload.alunos;
  if (Array.isArray(payload.planilha)) return payload.planilha;
  return [payload];
}

function getAcertos(resultado) {
  return (
    resultado?.acertos ??
    resultado?.total_acertos ??
    resultado?.quantidade_acertos ??
    resultado?.qtd_acertos ??
    null
  );
}

function getNotaGlobal(resultado) {
  return resultado?.nota_global ?? resultado?.nota ?? null;
}

function agruparDisciplinas(respostas = []) {
  return respostas.reduce((mapa, resposta) => {
    const disciplina = resposta.disciplina || "Sem disciplina";
    if (!mapa[disciplina]) mapa[disciplina] = { acertos: 0, total: 0, nota: 0 };

    mapa[disciplina].total += 1;
    if (resposta.acertou) mapa[disciplina].acertos += 1;
    mapa[disciplina].nota = mapa[disciplina].total
      ? Number(((mapa[disciplina].acertos / mapa[disciplina].total) * 10).toFixed(1))
      : 0;

    return mapa;
  }, {});
}

function normalizarResultados(payload) {
  const porAluno = {};

  listarResultados(payload).forEach((resultado) => {
    const alunoId = resultado.aluno_id ?? resultado.id_aluno ?? resultado.id;
    if (!alunoId) return;

    porAluno[String(alunoId)] = {
      acertos: getAcertos(resultado),
      nota: getNotaGlobal(resultado),
      disciplinas: agruparDisciplinas(resultado.respostas_salvas || []),
      totalQuestoesGlobal: resultado.total_questoes_global ?? resultado.total_questoes ?? null
    };
  });

  return porAluno;
}

function formatarNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero.toFixed(1).replace(".", ",") : valor;
}

function NotasCorretor() {
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [resultados, setResultados] = useState({});
  const [escolaId] = useState(TAKAOKA_ESCOLA_ID);
  const [turmaId, setTurmaId] = useState("");
  const [bimestre, setBimestre] = useState(getBimestreAtual());
  const [aba, setAba] = useState("resultado");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregarTurmas = useCallback(async (id) => {
    setTurmaId("");
    setTurmas([]);
    setAlunos([]);
    setResultados({});

    if (!id) return;

    try {
      const response = await corretorApi.get(`/turmas/${id}`);
      setTurmas(response.data || []);
      setMensagem("");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao carregar turmas do corretor.");
    }
  }, []);

  useEffect(() => {
    carregarTurmas(TAKAOKA_ESCOLA_ID);
  }, [carregarTurmas]);

  const carregarDadosTurma = useCallback(async () => {
    if (!escolaId || !turmaId) return;

    setCarregando(true);
    setMensagem("");

    try {
      const [alunosResponse, resultadosResponse] = await Promise.all([
        corretorApi.get(`/alunos/${turmaId}`),
        corretorApi.get("/resultados-alunos", {
          params: { turma_id: turmaId, escola_id: escolaId, bimestre }
        }).catch((error) => {
          if (error.response?.status === 404) return { data: [] };
          throw error;
        })
      ]);

      setAlunos(alunosResponse.data || []);
      setResultados(normalizarResultados(resultadosResponse.data));
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao carregar notas do corretor.");
    } finally {
      setCarregando(false);
    }
  }, [bimestre, escolaId, turmaId]);

  useEffect(() => {
    carregarDadosTurma();
  }, [carregarDadosTurma]);

  const disciplinas = useMemo(() => {
    const nomes = new Set();
    Object.values(resultados).forEach((resultado) => {
      Object.keys(resultado.disciplinas || {}).forEach((disciplina) => nomes.add(disciplina));
    });
    return [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [resultados]);

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return alunos
      .map((aluno) => {
        const resultado = resultados[String(aluno.id)];
        return {
          aluno,
          resultado,
          corrigido: resultado?.nota != null || resultado?.acertos != null
        };
      })
      .filter(({ aluno, corrigido }) => {
        const texto = `${aluno.numero_chamada ?? ""} ${aluno.nome ?? ""}`.toLowerCase();
        const combinaBusca = !termo || texto.includes(termo);
        const combinaStatus =
          status === "todos" ||
          (status === "corrigidos" && corrigido) ||
          (status === "pendentes" && !corrigido);

        return combinaBusca && combinaStatus;
      });
  }, [alunos, busca, resultados, status]);

  const resumo = useMemo(() => {
    const corrigidos = alunos.filter((aluno) => {
      const resultado = resultados[String(aluno.id)];
      return resultado?.nota != null || resultado?.acertos != null;
    });

    const notas = corrigidos
      .map((aluno) => Number(resultados[String(aluno.id)]?.nota))
      .filter(Number.isFinite);

    const media = notas.length
      ? notas.reduce((total, nota) => total + nota, 0) / notas.length
      : null;

    return {
      total: alunos.length,
      corrigidos: corrigidos.length,
      pendentes: Math.max(alunos.length - corrigidos.length, 0),
      media
    };
  }, [alunos, resultados]);

  const analiseDisciplinas = useMemo(() => {
    return disciplinas.map((disciplina) => {
      const notas = alunos
        .map((aluno) => resultados[String(aluno.id)]?.disciplinas?.[disciplina]?.nota)
        .map(Number)
        .filter(Number.isFinite);

      return {
        disciplina,
        media: notas.length ? notas.reduce((total, nota) => total + nota, 0) / notas.length : null,
        avaliados: notas.length
      };
    });
  }, [alunos, disciplinas, resultados]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Notas do Corretor</h2>
          <p style={styles.subtitle}>
            Resultado final e análise de dados vindos do corretor de gabarito.
          </p>
        </div>

        <a
          href="https://corretor-front-kappa.vercel.app/"
          target="_blank"
          rel="noreferrer"
          style={styles.externalLink}
        >
          Abrir corretor
        </a>
      </div>

      {mensagem && <div style={styles.alert}>{mensagem}</div>}

      <div style={styles.filters}>
        <div style={styles.readOnlyField}>
          <span style={styles.readOnlyLabel}>Escola</span>
          <strong>{TAKAOKA_ESCOLA_NOME}</strong>
        </div>

        <select
          style={styles.select}
          value={turmaId}
          disabled={!escolaId}
          onChange={(event) => setTurmaId(event.target.value)}
        >
          <option value="">Selecione a turma</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>{turma.nome}</option>
          ))}
        </select>

        <select
          style={styles.select}
          value={bimestre}
          onChange={(event) => setBimestre(Number(event.target.value))}
        >
          <option value={1}>1º Bimestre</option>
          <option value={2}>2º Bimestre</option>
          <option value={3}>3º Bimestre</option>
          <option value={4}>4º Bimestre</option>
        </select>

        <button
          style={styles.button}
          onClick={carregarDadosTurma}
          disabled={!escolaId || !turmaId || carregando}
        >
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(aba === "resultado" ? styles.activeTab : {}) }}
          onClick={() => setAba("resultado")}
        >
          Resultado final
        </button>
        <button
          style={{ ...styles.tab, ...(aba === "analise" ? styles.activeTab : {}) }}
          onClick={() => setAba("analise")}
        >
          Análise de dados
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <ResumoCard label="Alunos" value={resumo.total} />
        <ResumoCard label="Corrigidos" value={resumo.corrigidos} />
        <ResumoCard label="Pendentes" value={resumo.pendentes} />
        <ResumoCard label="Média global" value={formatarNumero(resumo.media)} />
      </div>

      {aba === "resultado" && (
        <>
          <div style={styles.resultFilters}>
            <input
              type="search"
              placeholder="Buscar aluno"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              style={styles.input}
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos</option>
              <option value="corrigidos">Corrigidos</option>
              <option value="pendentes">Pendentes</option>
            </select>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nº</th>
                  <th style={styles.th}>Aluno</th>
                  {disciplinas.map((disciplina) => (
                    <th key={disciplina} style={styles.th}>{disciplina}</th>
                  ))}
                  <th style={styles.th}>Nota global</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {carregando && (
                  <tr>
                    <td style={styles.empty} colSpan={disciplinas.length + 4}>Carregando notas...</td>
                  </tr>
                )}

                {!carregando && linhas.length === 0 && (
                  <tr>
                    <td style={styles.empty} colSpan={disciplinas.length + 4}>
                      Selecione uma turma para ver o resultado final.
                    </td>
                  </tr>
                )}

                {!carregando && linhas.map(({ aluno, resultado, corrigido }) => (
                  <tr key={aluno.id}>
                    <td style={styles.td}>{aluno.numero_chamada ?? "-"}</td>
                    <td style={styles.tdStrong}>{aluno.nome}</td>
                    {disciplinas.map((disciplina) => (
                      <td key={disciplina} style={styles.td}>
                        {formatarNumero(resultado?.disciplinas?.[disciplina]?.nota)}
                      </td>
                    ))}
                    <td style={styles.tdStrong}>{formatarNumero(resultado?.nota)}</td>
                    <td style={styles.td}>
                      <span style={corrigido ? styles.badgeOk : styles.badgePending}>
                        {corrigido ? "Corrigido" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {aba === "analise" && (
        <div style={styles.analysis}>
          {analiseDisciplinas.length === 0 ? (
            <div style={styles.emptyBox}>Nenhuma disciplina encontrada nos resultados da turma.</div>
          ) : (
            <>
              <div style={styles.analysisGrid}>
                {analiseDisciplinas.map((item) => (
                  <div key={item.disciplina} style={styles.analysisCard}>
                    <strong>{item.disciplina}</strong>
                    <span>{formatarNumero(item.media)}</span>
                    <small>{item.avaliados} aluno(s) com nota</small>
                  </div>
                ))}
              </div>

              <div style={styles.chartBlock}>
                {analiseDisciplinas.map((item) => {
                  const largura = Math.max(0, Math.min(Number(item.media || 0) * 10, 100));
                  return (
                    <div key={item.disciplina} style={styles.barRow}>
                      <strong>{item.disciplina}</strong>
                      <div style={styles.barTrack}>
                        <span style={{ ...styles.barFill, width: `${largura}%` }} />
                      </div>
                      <em>{formatarNumero(item.media)}</em>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
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

const styles = {
  page: {
    maxWidth: "1180px",
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
  externalLink: {
    backgroundColor: "#0f172a",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "14px",
    whiteSpace: "nowrap"
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
    marginBottom: "16px"
  },
  resultFilters: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 1fr) minmax(160px, 220px)",
    gap: "12px",
    marginBottom: "14px"
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "white"
  },
  readOnlyField: {
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    justifyContent: "center",
    minHeight: "40px"
  },
  readOnlyLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1"
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
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px"
  },
  tab: {
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#334155",
    padding: "9px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700
  },
  activeTab: {
    backgroundColor: "#2563eb",
    color: "white",
    borderColor: "#2563eb"
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
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
    minWidth: "900px"
  },
  th: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    whiteSpace: "nowrap"
  },
  td: {
    padding: "12px",
    borderTop: "1px solid #e2e8f0",
    verticalAlign: "top",
    fontSize: "14px",
    color: "#334155"
  },
  tdStrong: {
    padding: "12px",
    borderTop: "1px solid #e2e8f0",
    verticalAlign: "top",
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: 700
  },
  empty: {
    padding: "24px",
    textAlign: "center",
    color: "#64748b"
  },
  emptyBox: {
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#64748b",
    textAlign: "center"
  },
  badgeOk: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 700
  },
  badgePending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 700
  },
  analysis: {
    display: "grid",
    gap: "16px"
  },
  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },
  analysisCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
    backgroundColor: "white"
  },
  chartBlock: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    display: "grid",
    gap: "12px"
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "minmax(120px, 210px) minmax(160px, 1fr) 48px",
    alignItems: "center",
    gap: "12px",
    color: "#334155"
  },
  barTrack: {
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    height: "16px",
    overflow: "hidden"
  },
  barFill: {
    display: "block",
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "999px"
  }
};

export default NotasCorretor;
