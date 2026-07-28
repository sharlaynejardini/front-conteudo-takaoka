import { useEffect, useState } from "react";
import api from "./api";
import { logAction } from "./utils/logAction";
import { supabase } from "./supabaseClient";
import { getBimestreAtual } from "./utils/bimestreAtual";

function ProfessorConteudo() {

  const anoAtual = new Date().getFullYear();
  const bimestreAtual = getBimestreAtual();

  const semanasProva = {
    1: { inicio: `${anoAtual}-04-13`, fim: `${anoAtual}-04-17` },
    2: { inicio: `${anoAtual}-06-08`, fim: `${anoAtual}-06-16` },
    3: { inicio: `${anoAtual}-09-14`, fim: `${anoAtual}-09-18` },
    4: { inicio: `${anoAtual}-11-13`, fim: `${anoAtual}-11-19` }
  };

  const semanasSimuladoFund2 = {
    2: { inicio: `${anoAtual}-05-20`, fim: `${anoAtual}-05-22` },
    3: { inicio: `${anoAtual}-08-19`, fim: `${anoAtual}-08-21` }
  };

  const turmasSimuladoFund2 = new Set(["6A", "6B", "7A", "7B", "8A", "8B", "8C", "9A", "9B", "9C"]);
  const turmasObmep2026 = new Set(["6A", "6B", "7A", "7B", "8A", "8B", "8C", "9A", "9B", "9C"]);
  const dataObmep2026 = `${anoAtual}-06-09`;
  const dataRemanejadaObmep2026 = `${anoAtual}-06-16`;

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");

  const [atribuicoesSelecionadas, setAtribuicoesSelecionadas] = useState([]);

  const tipoAvaliacaoInicial = bimestreAtual === 3 ? "simulado" : "regular";
  const periodoAvaliacaoInicial =
    tipoAvaliacaoInicial === "simulado" ? semanasSimuladoFund2[bimestreAtual] : semanasProva[bimestreAtual];

  const [bimestre, setBimestre] = useState(bimestreAtual);
  const [tipoAvaliacao, setTipoAvaliacao] = useState(tipoAvaliacaoInicial);
  const [mostrarCopiar, setMostrarCopiar] = useState(false);

  const [topicos, setTopicos] = useState([""]);
  const [dataAvaliacao, setDataAvaliacao] = useState(periodoAvaliacaoInicial.inicio);

  const [conteudoId, setConteudoId] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  // Copiar conteúdo
  const [atribuicaoCopiar, setAtribuicaoCopiar] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    boxSizing: "border-box"
  };

  const mensagemStyle = {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    backgroundColor:
      tipoMensagem === "success"
        ? "#d4edda"
        : tipoMensagem === "warning"
        ? "#fff3cd"
        : "#f8d7da"
  };

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "10px",
    marginRight: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const limparFormulario = () => {
    setTopicos([""]);
    setConteudoId(null);
    setModoEdicao(false);
  };

  const normalizarTurma = (nome = "") =>
    nome.toUpperCase().replace(/\s/g, "").replace(/[º°Â]/g, "").replace("ANO", "");
  const turmaTemObmep2026 = (nome = "") => turmasObmep2026.has(normalizarTurma(nome));
  const turmaPodeSimuladoFund2 = (nome = "") => turmasSimuladoFund2.has(normalizarTurma(nome));

  const atribuicoesAtivas =
    atribuicoesSelecionadas.length > 0
      ? atribuicoes.filter(a => atribuicoesSelecionadas.includes(a.id))
      : atribuicoes.filter(a => a.id === atribuicaoSelecionada);

  const bimestreTemSimuladoFund2 = [2, 3].includes(bimestre);
  const podeCadastrarSimuladoFund2 =
    bimestreTemSimuladoFund2 &&
    atribuicoesAtivas.length > 0 &&
    atribuicoesAtivas.every(a => turmaPodeSimuladoFund2(a.turma?.nome));

  const dataBloqueadaPorObmep =
    tipoAvaliacao === "regular" &&
    bimestre === 2 &&
    dataAvaliacao === dataObmep2026 &&
    atribuicoesAtivas.some(a => turmaTemObmep2026(a.turma?.nome));

  const periodoAvaliacao =
    tipoAvaliacao === "simulado" && semanasSimuladoFund2[bimestre]
      ? semanasSimuladoFund2[bimestre]
      : semanasProva[bimestre];

  const getDescricaoProvaRegular = () =>
    bimestre === 2
      ? "Prova bimestral - 08, 10 a 12/06 ou 16/06"
      : "Prova bimestral";

  const getDescricaoSimulado = () =>
    bimestre === 3 ? "Avaliação - Simulado - 19, 20 e 21/08" : "Simulado - 20 a 22/05";

  const alterarBimestre = (valor) => {
    setBimestre(valor);
    setTipoAvaliacao(valor === 3 ? "simulado" : "regular");
  };

  useEffect(() => {
    async function carregar() {

      const response = await api.get("/professores");

      const ordenados = [...response.data].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      );

      setProfessores(ordenados);

      const ADMIN_EMAIL = "sharlayne.fonseca@professor.barueri.br";

      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;

      console.log("EMAIL LOGADO:", email);

      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }

      const professor = ordenados.find(
        p => p.email?.toLowerCase() === email?.toLowerCase()
      );

      console.log("PROFESSOR ENCONTRADO:", professor);

      if (professor) {
        setProfessorSelecionado(professor.id);
        carregarAtribuicoes(professor.id);
      } else {
        console.warn("Nenhum professor com esse email");
      }

    }

    carregar();
  }, []);

  const carregarAtribuicoes = async (id) => {

    try {

      if (!id) {
        setAtribuicoes([]);
        return;
      }

      const response = await api.get(`/atribuicoes/${id}`);

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

      setAtribuicaoSelecionada("");
      setAtribuicoesSelecionadas([]);

      limparFormulario();

    } catch (err) {

      console.error(err);
      setAtribuicoes([]);

    }

  };

  useEffect(() => {
    if (!modoEdicao) {
      setDataAvaliacao(periodoAvaliacao.inicio);
    }
  }, [bimestre, tipoAvaliacao]);

  useEffect(() => {
    if (atribuicoesAtivas.length > 0 && !podeCadastrarSimuladoFund2 && tipoAvaliacao === "simulado") {
      setTipoAvaliacao("regular");
    }
  }, [atribuicoesAtivas.length, podeCadastrarSimuladoFund2, tipoAvaliacao]);

  useEffect(() => {

    if (!atribuicaoSelecionada) return;

    async function buscarConteudo() {

      try {

        const response = await api.get("/conteudos", {
          params: {
            atribuicao_id: atribuicaoSelecionada,
            bimestre,
            tipo_avaliacao: tipoAvaliacao
          }
        });

        const salvo = response.data;

        setModoEdicao(true);
        setConteudoId(salvo.id);
        setTopicos(Array.isArray(salvo.conteudo) ? salvo.conteudo : [salvo.conteudo]);
        setDataAvaliacao(salvo.data_avaliacao?.split("T")[0]);

        setMensagem("Você está editando uma avaliação existente.");
        setTipoMensagem("warning");

      } catch {

        setModoEdicao(false);
        setConteudoId(null);
        setTopicos([""]);
        setMensagem("");

      }

    }

    buscarConteudo();

  }, [atribuicaoSelecionada, bimestre, tipoAvaliacao]);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const atribuicao = params.get("atribuicao");
    const bimestreParam = params.get("bimestre");

    if (atribuicao) {
      setAtribuicaoSelecionada(atribuicao);
    }

    if (bimestreParam) {
      setBimestre(Number(bimestreParam));
    }

  }, []);

  const adicionarTopico = () => setTopicos([...topicos, ""]);

  const atualizarTopico = (index, valor) => {
    const novos = [...topicos];
    novos[index] = valor;
    setTopicos(novos);
  };

  const removerTopico = (index) => {
    const novos = topicos.filter((_, i) => i !== index);
    setTopicos(novos.length ? novos : [""]);
  };

  const toggleTurma = (id) => {

    let novas;

    if (atribuicoesSelecionadas.includes(id)) {
      novas = atribuicoesSelecionadas.filter(a => a !== id);
    } else {
      novas = [...atribuicoesSelecionadas, id];
    }

    setAtribuicoesSelecionadas(novas);
    setAtribuicaoSelecionada(novas[0] || "");

  };

  // Copiar conteúdo
  const copiarConteudo = async () => {
    if (!atribuicaoCopiar) return;

    try {
      const response = await api.get("/conteudos", {
        params: {
          atribuicao_id: atribuicaoCopiar,
          bimestre,
          tipo_avaliacao: tipoAvaliacao
        }
      });

      const salvo = response.data;

      setTopicos(
        Array.isArray(salvo.conteudo)
          ? salvo.conteudo
          : [salvo.conteudo]
      );

      setDataAvaliacao(salvo.data_avaliacao?.split("T")[0]);

      setMensagem("Conteúdo copiado com sucesso!");
      setTipoMensagem("success");

    } catch (err) {
      console.error(err);
      setMensagem("Erro ao copiar conteúdo.");
      setTipoMensagem("error");
    }
  };

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada && atribuicoesSelecionadas.length === 0) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    const atribuicoesParaSalvar =
      atribuicoesSelecionadas.length > 0
        ? atribuicoesSelecionadas
        : [atribuicaoSelecionada];

    if (tipoAvaliacao === "simulado" && !podeCadastrarSimuladoFund2) {
      setMensagem("O simulado esta liberado apenas para as turmas 6A, 6B, 7A, 7B, 8A, 8B, 8C, 9A, 9B e 9C no 2o e 3o bimestres.");
      setTipoMensagem("error");
      return;
    }

    if (dataBloqueadaPorObmep) {
      setMensagem("09/06/2026 sera OBMEP para essas turmas. A prova foi remanejada para 16/06/2026.");
      setTipoMensagem("error");
      setDataAvaliacao(dataRemanejadaObmep2026);
      return;
    }

    const topicosPreenchidos = topicos
      .map(topico => topico.trim())
      .filter(Boolean);

    if (topicosPreenchidos.length === 0) {
      setMensagem("Preencha ao menos um conteúdo.");
      setTipoMensagem("error");
      return;
    }

    let atribuicaoFalhou = null;

    try {

      for (const atribuicaoId of atribuicoesParaSalvar) {
        atribuicaoFalhou = atribuicoes.find(a => a.id === atribuicaoId);

        const editandoConteudoAtual =
          modoEdicao &&
          conteudoId &&
          atribuicoesParaSalvar.length === 1 &&
          atribuicaoId === atribuicaoSelecionada;

        await api.post("/conteudos", {
          ...(editandoConteudoAtual ? { id: conteudoId } : {}),
          atribuicao_id: atribuicaoId,
          bimestre,
          tipo_avaliacao: tipoAvaliacao,
          conteudo: topicosPreenchidos,
          data_avaliacao: dataAvaliacao
        });

      }

      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoSelecionada);

      try {
        await logAction({
          action: modoEdicao ? "UPDATE" : "CREATE",
          entidade: "Avaliação",
          turma: atribuicaoAtual?.turma?.nome,
          disciplina: atribuicaoAtual?.disciplina?.nome,
          bimestre,
          detalhes: `${tipoAvaliacao === "simulado" ? "Simulado" : "Prova bimestral"} | Conteúdo: ${topicosPreenchidos.join(", ")} | Data: ${dataAvaliacao}`
        });
      } catch (logError) {
        console.warn("Conteudo salvo, mas nao foi possivel registrar o log.", logError);
      }

      setMensagem("Conteúdo salvo com sucesso!");
      setTipoMensagem("success");

      limparFormulario();
      setAtribuicaoSelecionada("");
      setAtribuicoesSelecionadas([]);
      setDataAvaliacao(periodoAvaliacao.inicio);

    } catch (err) {

      console.error(err);
      const detalheErro = err.response?.data?.detail || err.message || "Erro ao salvar conteudo.";
      const contextoErro = atribuicaoFalhou
        ? `${atribuicaoFalhou.turma?.nome} - ${atribuicaoFalhou.disciplina?.nome}: `
        : "";

      setMensagem(`${contextoErro}${detalheErro}`);
      setTipoMensagem("error");

    }

  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0" }}>

      <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "20px" }}>
        Lançamento de Avaliação
      </h2>

      {mensagem && <div style={mensagemStyle}>{mensagem}</div>}

      {isAdmin && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Modo Administrador
        </p>
      )}

      <select
        style={inputStyle}
        value={professorSelecionado}
        disabled={!isAdmin}
        onChange={(e) => {
          setProfessorSelecionado(e.target.value);
          carregarAtribuicoes(e.target.value);
        }}
      >
        <option value="">Selecione Professor</option>

        {professores.map(p => (
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
      </select>

      {atribuicoes.length > 0 && (

        <div style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "15px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>

          <strong>Selecione as Turmas</strong>

          {atribuicoes.map(a => (
            <div key={a.id}>
              <label>
                <input
                  type="checkbox"
                  checked={atribuicoesSelecionadas.includes(a.id)}
                  onChange={() => toggleTurma(a.id)}
                />
                {" "}
                {a.turma.nome} - {a.disciplina.nome}
              </label>
            </div>
          ))}

        </div>

      )}

      <select
        style={inputStyle}
        value={bimestre}
        onChange={(e) => alterarBimestre(Number(e.target.value))}
      >
        <option value={1}>1º Bimestre</option>
        <option value={2}>2º Bimestre</option>
        <option value={3}>3º Bimestre</option>
        <option value={4}>4º Bimestre</option>
      </select>

      {bimestreTemSimuladoFund2 && (
        <select
          style={inputStyle}
          value={tipoAvaliacao}
          onChange={(e) => setTipoAvaliacao(e.target.value)}
          disabled={atribuicoesAtivas.length > 0 && !podeCadastrarSimuladoFund2}
        >
          <option value="regular">{getDescricaoProvaRegular()}</option>
          <option value="simulado">{getDescricaoSimulado()}</option>
        </select>
      )}

      <input
        type="date"
        style={inputStyle}
        value={dataAvaliacao}
        min={periodoAvaliacao.inicio}
        max={periodoAvaliacao.fim}
        onChange={(e) => {
          const novaData = e.target.value;

          if (
            tipoAvaliacao === "regular" &&
            bimestre === 2 &&
            novaData === dataObmep2026 &&
            atribuicoesAtivas.some(a => turmaTemObmep2026(a.turma?.nome))
          ) {
            setDataAvaliacao(dataRemanejadaObmep2026);
            setMensagem("09/06/2026 sera OBMEP para essas turmas. Use 16/06/2026.");
            setTipoMensagem("warning");
            return;
          }

          setDataAvaliacao(novaData);
        }}
      />

      <h4>Conteúdos:</h4>

      {topicos.map((topico, index) => (
        <div key={index} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={topico}
            onChange={(e) => atualizarTopico(index, e.target.value)}
            style={{ ...inputStyle, marginBottom: "0" }}
          />
          <button onClick={() => removerTopico(index)}>Remover</button>
        </div>
      ))}

      <button onClick={adicionarTopico} style={buttonStyle}>
        + Adicionar Tópico
      </button>

      <button onClick={salvarConteudo} style={buttonStyle}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

      {/* Copiar conteúdo */}
      <button onClick={() => setMostrarCopiar(!mostrarCopiar)} style={buttonStyle}>
        Copiar conteúdo de outra turma
      </button>

      {mostrarCopiar && (
        <div style={{ marginTop: "10px" }}>
          <select
            style={inputStyle}
            value={atribuicaoCopiar}
            onChange={(e) => setAtribuicaoCopiar(e.target.value)}
          >
            <option value="">Selecione a turma para copiar</option>

            {atribuicoes.map(a => (
              <option key={a.id} value={a.id}>
                {a.turma.nome} - {a.disciplina.nome}
              </option>
            ))}
          </select>

          <button onClick={copiarConteudo} style={buttonStyle}>
            Confirmar cópia
          </button>
        </div>
      )}

    </div>
  );
}

export default ProfessorConteudo;

