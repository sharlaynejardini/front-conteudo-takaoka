import { useCallback, useEffect, useMemo, useState } from "react";
import corretorApi from "./corretorApi";
import { getBimestreAtual } from "./utils/bimestreAtual";

const TAKAOKA_ESCOLA_ID = "8d869f43-cf96-4497-9257-0fb0450b4637";
const TAKAOKA_ESCOLA_NOME = "EMEF YOJIRO TAKAOKA";
const CORES_DISCIPLINA = {
  LP: "#4285f4",
  "Lingua Portuguesa": "#4285f4",
  "Língua Portuguesa": "#4285f4",
  Portugues: "#4285f4",
  Português: "#4285f4",
  Historia: "#fbbc04",
  História: "#fbbc04",
  Geografia: "#34a853",
  "Educação Física": "#ff7043",
  Matematica: "#a142f4",
  Matemática: "#a142f4",
  Ciencias: "#00acc1",
  Ciências: "#00acc1",
  Artes: "#ec407a",
  Ingles: "#7cb342",
  Inglês: "#7cb342"
};
const CORES_FALLBACK = [
  "#4285f4",
  "#fbbc04",
  "#34a853",
  "#ff7043",
  "#a142f4",
  "#00acc1",
  "#ec407a",
  "#7cb342",
  "#5c6bc0",
  "#8d6e63"
];
const ORDEM_DISCIPLINAS = [
  {
    nome: "Portugu\u00eas",
    aliases: ["lp", "lingua portuguesa", "l\u00edngua portuguesa", "portugues", "portugu\u00eas"]
  },
  { nome: "Hist\u00f3ria", aliases: ["historia", "hist\u00f3ria"] },
  { nome: "Geografia", aliases: ["geografia"] },
  {
    nome: "Ed. F\u00edsica",
    aliases: ["ed fisica", "ed. fisica", "ed f\u00edsica", "ed. f\u00edsica", "educacao fisica", "educa\u00e7\u00e3o f\u00edsica"]
  },
  { nome: "Matem\u00e1tica", aliases: ["matematica", "matem\u00e1tica"] },
  { nome: "Ci\u00eancias", aliases: ["ciencias", "ci\u00eancias"] },
  { nome: "Artes", aliases: ["arte", "artes"] },
  { nome: "Ingles", aliases: ["ingles", "ingl\u00eas"] }
];

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

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getDisciplinaOrdem(disciplina = "") {
  const normalizada = normalizarTexto(disciplina);
  const indice = ORDEM_DISCIPLINAS.findIndex((item) =>
    item.aliases.some((alias) => normalizarTexto(alias) === normalizada)
  );

  return indice >= 0 ? indice : ORDEM_DISCIPLINAS.length;
}

function ordenarDisciplinas(disciplinas = []) {
  return [...disciplinas].sort((a, b) => {
    const ordemA = getDisciplinaOrdem(a);
    const ordemB = getDisciplinaOrdem(b);

    if (ordemA !== ordemB) return ordemA - ordemB;
    return a.localeCompare(b, "pt-BR");
  });
}

function getNomeDisciplina(disciplina = "") {
  const normalizada = normalizarTexto(disciplina);
  const item = ORDEM_DISCIPLINAS.find((disciplinaOrdenada) =>
    disciplinaOrdenada.aliases.some((alias) => normalizarTexto(alias) === normalizada)
  );

  return item?.nome ?? disciplina;
}

function getCorDisciplina(disciplina = "") {
  if (CORES_DISCIPLINA[disciplina]) return CORES_DISCIPLINA[disciplina];

  const normalizada = normalizarTexto(disciplina);
  const chave = Object.keys(CORES_DISCIPLINA).find(
    (nome) => normalizarTexto(nome) === normalizada
  );

  if (chave) return CORES_DISCIPLINA[chave];

  const indice = Array.from(normalizada).reduce(
    (total, letra) => total + letra.charCodeAt(0),
    0
  );

  return CORES_FALLBACK[indice % CORES_FALLBACK.length];
}

function getAnoTurma(nome = "") {
  const numero = String(nome).replace(/\D/g, "");
  return numero ? Number(numero) : null;
}

function isNotaBaixa(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero < 5;
}

function calcularAnaliseTurma(turma, alunosTurma, resultadosTurma) {
  const disciplinas = {};
  let somaGeral = 0;
  let alunosComNotaGeral = 0;

  alunosTurma.forEach((aluno) => {
    const resultado = resultadosTurma[String(aluno.id)];
    if (!resultado) return;

    const notaGeral = Number(resultado.nota);
    if (Number.isFinite(notaGeral)) {
      somaGeral += notaGeral;
      alunosComNotaGeral += 1;
    }

    Object.entries(resultado.disciplinas || {}).forEach(([disciplina, dados]) => {
      const nota = Number(dados?.nota);
      if (!Number.isFinite(nota)) return;

      if (!disciplinas[disciplina]) {
        disciplinas[disciplina] = { soma: 0, quantidade: 0 };
      }

      disciplinas[disciplina].soma += nota;
      disciplinas[disciplina].quantidade += 1;
    });
  });

  return {
    turma,
    totalAlunos: alunosTurma.length,
    alunosComNotaGeral,
    mediaGeral: alunosComNotaGeral ? somaGeral / alunosComNotaGeral : null,
    mediasDisciplinas: Object.entries(disciplinas)
      .map(([disciplina, dados]) => ({
        disciplina,
        media: dados.quantidade ? dados.soma / dados.quantidade : null,
        quantidade: dados.quantidade
      }))
      .sort((a, b) => {
        const ordemA = getDisciplinaOrdem(a.disciplina);
        const ordemB = getDisciplinaOrdem(b.disciplina);

        if (ordemA !== ordemB) return ordemA - ordemB;
        return a.disciplina.localeCompare(b.disciplina, "pt-BR");
      })
  };
}

function NotasCorretor() {
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [resultados, setResultados] = useState({});
  const [analiseTurmas, setAnaliseTurmas] = useState([]);
  const [escolaId] = useState(TAKAOKA_ESCOLA_ID);
  const [turmaId, setTurmaId] = useState("");
  const [bimestre, setBimestre] = useState(getBimestreAtual());
  const [aba, setAba] = useState("resultado");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [carregando, setCarregando] = useState(false);
  const [carregandoAnalise, setCarregandoAnalise] = useState(false);
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

  const carregarAnaliseEscola = useCallback(async () => {
    if (!escolaId || turmas.length === 0) {
      setAnaliseTurmas([]);
      return;
    }

    setCarregandoAnalise(true);

    try {
      const dados = await Promise.all(
        turmas.map(async (turma) => {
          const [alunosResponse, resultadosResponse] = await Promise.all([
            corretorApi.get(`/alunos/${turma.id}`),
            corretorApi.get("/resultados-alunos", {
              params: { turma_id: turma.id, escola_id: escolaId, bimestre }
            }).catch((error) => {
              if (error.response?.status === 404) return { data: [] };
              throw error;
            })
          ]);

          return calcularAnaliseTurma(
            turma,
            alunosResponse.data || [],
            normalizarResultados(resultadosResponse.data)
          );
        })
      );

      setAnaliseTurmas(
        dados.sort((a, b) => a.turma.nome.localeCompare(b.turma.nome, "pt-BR"))
      );
    } catch (error) {
      console.error(error);
      setAnaliseTurmas([]);
      setMensagem("Erro ao carregar os gráficos do corretor.");
    } finally {
      setCarregandoAnalise(false);
    }
  }, [bimestre, escolaId, turmas]);

  useEffect(() => {
    carregarAnaliseEscola();
  }, [carregarAnaliseEscola]);

  const disciplinas = useMemo(() => {
    const nomes = new Set();
    Object.values(resultados).forEach((resultado) => {
      Object.keys(resultado.disciplinas || {}).forEach((disciplina) => nomes.add(disciplina));
    });
    return ordenarDisciplinas([...nomes]);
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

  const resumoAnalise = useMemo(() => {
    const turmasComMedia = analiseTurmas.filter((turma) =>
      Number.isFinite(turma.mediaGeral)
    );
    const totalAlunos = analiseTurmas.reduce((total, turma) => total + turma.totalAlunos, 0);
    const alunosComNota = analiseTurmas.reduce(
      (total, turma) => total + turma.alunosComNotaGeral,
      0
    );
    const mediaGeral = turmasComMedia.length
      ? turmasComMedia.reduce((total, turma) => total + turma.mediaGeral, 0) /
        turmasComMedia.length
      : null;

    return { totalAlunos, alunosComNota, mediaGeral };
  }, [analiseTurmas]);

  const disciplinasAnalise = useMemo(() => {
    return ordenarDisciplinas([
      ...new Set(
        analiseTurmas.flatMap((turma) =>
          turma.mediasDisciplinas.map((disciplina) => disciplina.disciplina)
        )
      )
    ]);
  }, [analiseTurmas]);

  const analisePorAno = useMemo(() => {
    return analiseTurmas.reduce((mapa, turma) => {
      const ano = getAnoTurma(turma.turma.nome) || "Sem ano";
      if (!mapa[ano]) mapa[ano] = [];
      mapa[ano].push(turma);
      return mapa;
    }, {});
  }, [analiseTurmas]);

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
                    <th key={disciplina} style={styles.th}>{getNomeDisciplina(disciplina)}</th>
                  ))}
                  <th style={styles.th}>Média geral</th>
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
                        <NotaValor valor={resultado?.disciplinas?.[disciplina]?.nota} />
                      </td>
                    ))}
                    <td style={styles.tdStrong}>
                      <NotaValor valor={resultado?.nota} destaque />
                    </td>
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
          {carregandoAnalise ? (
            <div style={styles.emptyBox}>Carregando gráficos da escola...</div>
          ) : analiseTurmas.length === 0 ? (
            <div style={styles.emptyBox}>Ainda não há turmas com dados para esta escola.</div>
          ) : (
            <>
              <div style={styles.summaryGrid}>
                <ResumoCard label="Escola" value={TAKAOKA_ESCOLA_NOME} />
                <ResumoCard label="Média geral" value={formatarNumero(resumoAnalise.mediaGeral)} />
                <ResumoCard
                  label="Alunos com nota"
                  value={`${resumoAnalise.alunosComNota}/${resumoAnalise.totalAlunos}`}
                />
              </div>

              <div style={styles.classChartsGrid}>
                {analiseTurmas.map((turma) => (
                  <div key={turma.turma.id} style={styles.classChart}>
                    <h3 style={styles.chartTitle}>{turma.turma.nome}</h3>
                    {turma.mediasDisciplinas.length === 0 ? (
                      <p style={styles.emptySmall}>Sem notas por disciplina.</p>
                    ) : (
                      <div style={styles.subjectColumns}>
                        {turma.mediasDisciplinas.map((item) => {
                          const media = Number(item.media || 0);
                          const cor = isNotaBaixa(item.media)
                            ? "#dc2626"
                            : getCorDisciplina(item.disciplina);

                          return (
                            <div key={item.disciplina} style={styles.subjectColumn}>
                              <strong style={{ ...styles.subjectScore, color: cor }}>
                                {formatarNumero(item.media)}
                              </strong>
                              <div style={styles.columnTrack}>
                                <span
                                  style={{
                                    ...styles.subjectFill,
                                    backgroundColor: cor,
                                    height: `${Math.max(4, Math.min(100, (media / 10) * 100))}%`
                                  }}
                                />
                              </div>
                              <small title={getNomeDisciplina(item.disciplina)} style={styles.columnLabel}>
                                {getNomeDisciplina(item.disciplina)}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.chartSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Média global por sala</h3>
                  <span>{analiseTurmas.length} turma(s)</span>
                </div>

                <div style={styles.globalColumns}>
                  {analiseTurmas.map((turma) => (
                    <div key={turma.turma.id} style={styles.globalColumn}>
                      <div style={styles.globalTrack}>
                        <span
                          style={{
                            ...styles.globalFill,
                            backgroundColor: isNotaBaixa(turma.mediaGeral) ? "#dc2626" : "#16a34a",
                            height: `${Math.max(4, (Number(turma.mediaGeral || 0) / 10) * 100)}%`
                          }}
                        >
                          {formatarNumero(turma.mediaGeral)}
                        </span>
                      </div>
                      <small style={styles.columnLabel}>{turma.turma.nome}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Turma</th>
                      {disciplinasAnalise.map((disciplina) => (
                        <th key={disciplina} style={styles.th}>{getNomeDisciplina(disciplina)}</th>
                      ))}
                      <th style={styles.th}>Média geral</th>
                      <th style={styles.th}>Alunos considerados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analiseTurmas.map((turma) => (
                      <tr key={turma.turma.id}>
                        <td style={styles.tdStrong}>{turma.turma.nome}</td>
                        {disciplinasAnalise.map((disciplina) => (
                          <td key={disciplina} style={styles.td}>
                            <NotaValor
                              valor={
                                turma.mediasDisciplinas.find(
                                  (item) => item.disciplina === disciplina
                                )?.media
                              }
                            />
                          </td>
                        ))}
                        <td style={styles.tdStrong}>
                          <NotaValor valor={turma.mediaGeral} destaque />
                        </td>
                        <td style={styles.td}>
                          {turma.alunosComNotaGeral}/{turma.totalAlunos}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.chartSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Comparação entre turmas do mesmo ano</h3>
                  <span>Agrupado por ano</span>
                </div>

                <div style={styles.yearGrid}>
                  {Object.entries(analisePorAno).map(([ano, turmasAno]) => (
                    <div key={ano} style={styles.yearChart}>
                      <h3 style={styles.chartTitle}>
                        {ano === "Sem ano" ? "Sem ano identificado" : `${ano}º ano`}
                      </h3>
                      <div style={styles.yearColumns}>
                        {turmasAno.map((turma) => (
                          <div key={turma.turma.id} style={styles.yearColumn}>
                            <div style={styles.yearTrack}>
                              <span
                                style={{
                                  ...styles.yearFill,
                                  backgroundColor: isNotaBaixa(turma.mediaGeral)
                                    ? "#dc2626"
                                    : "#16a34a",
                                  height: `${Math.max(4, (Number(turma.mediaGeral || 0) / 10) * 100)}%`
                                }}
                              >
                                {formatarNumero(turma.mediaGeral)}
                              </span>
                            </div>
                            <small style={styles.columnLabel}>{turma.turma.nome}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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

function NotaValor({ valor, destaque = false }) {
  const baixa = isNotaBaixa(valor);
  const style = {
    ...(destaque ? styles.noteStrong : styles.note),
    ...(baixa ? styles.noteLow : {})
  };

  return <span style={style}>{formatarNumero(valor)}</span>;
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
  classChartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px"
  },
  classChart: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "18px",
    backgroundColor: "white",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)"
  },
  chartTitle: {
    color: "#0f172a",
    fontSize: "18px",
    margin: "0 0 14px",
    letterSpacing: 0
  },
  subjectBars: {
    display: "grid",
    gap: "12px"
  },
  subjectBarRow: {
    display: "grid",
    gridTemplateColumns: "minmax(90px, 0.9fr) minmax(80px, 1.4fr) 40px",
    alignItems: "center",
    gap: "10px"
  },
  subjectBarMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: 0
  },
  subjectDot: {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    flex: "0 0 auto"
  },
  subjectName: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 800,
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  subjectBarTrack: {
    height: "12px",
    backgroundColor: "#eef2f7",
    borderRadius: "999px",
    overflow: "hidden",
    boxShadow: "inset 0 0 0 1px rgba(148, 163, 184, 0.18)"
  },
  subjectBarFill: {
    display: "block",
    height: "100%",
    borderRadius: "999px"
  },
  subjectScore: {
    justifySelf: "end",
    fontSize: "13px",
    fontWeight: 900,
    fontVariantNumeric: "tabular-nums"
  },
  subjectColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(32px, 1fr))",
    alignItems: "end",
    gap: "8px",
    minHeight: "188px"
  },
  subjectColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "end",
    gap: "6px",
    justifyItems: "center",
    minWidth: 0,
    height: "188px"
  },
  columnTrack: {
    width: "28px",
    height: "124px",
    backgroundColor: "#e6edf5",
    borderRadius: "8px 8px 4px 4px",
    display: "flex",
    alignItems: "end",
    overflow: "hidden"
  },
  subjectFill: {
    width: "100%",
    borderRadius: "inherit",
    display: "block",
    minHeight: "4px"
  },
  columnLabel: {
    color: "#64748b",
    textAlign: "center",
    fontSize: "10px",
    fontWeight: 700,
    lineHeight: 1.1,
    width: "100%",
    maxWidth: "48px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  chartSection: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "white",
    display: "grid",
    gap: "14px"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: "18px",
    margin: 0
  },
  globalColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(78px, 1fr))",
    alignItems: "end",
    gap: "12px",
    minHeight: "210px"
  },
  globalColumn: {
    display: "grid",
    gridTemplateRows: "150px auto",
    gap: "8px",
    justifyItems: "center",
    minWidth: 0
  },
  globalTrack: {
    width: "44px",
    height: "150px",
    backgroundColor: "#e6edf5",
    borderRadius: "8px 8px 4px 4px",
    display: "flex",
    alignItems: "end",
    overflow: "hidden"
  },
  globalFill: {
    width: "100%",
    borderRadius: "inherit",
    color: "white",
    fontSize: "11px",
    fontWeight: 800,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "4px"
  },
  yearGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px"
  },
  yearChart: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "14px",
    backgroundColor: "#f8fafc"
  },
  yearColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(52px, 1fr))",
    alignItems: "end",
    gap: "12px",
    minHeight: "176px",
    paddingTop: "6px"
  },
  yearColumn: {
    display: "grid",
    gridTemplateRows: "132px auto",
    gap: "8px",
    justifyItems: "center",
    minWidth: 0
  },
  yearTrack: {
    width: "42px",
    height: "132px",
    backgroundColor: "#e6edf5",
    borderRadius: "8px 8px 4px 4px",
    display: "flex",
    alignItems: "end",
    overflow: "hidden"
  },
  yearFill: {
    width: "100%",
    borderRadius: "inherit",
    color: "white",
    fontSize: "11px",
    fontWeight: 800,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "4px"
  },
  emptySmall: {
    color: "#64748b",
    fontSize: "14px"
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
  },
  note: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "34px",
    borderRadius: "6px",
    padding: "3px 7px",
    fontWeight: 700
  },
  noteStrong: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "38px",
    borderRadius: "6px",
    padding: "4px 8px",
    fontWeight: 800
  },
  noteLow: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c"
  }
};

export default NotasCorretor;
