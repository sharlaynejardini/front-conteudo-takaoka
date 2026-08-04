import { useEffect, useState } from "react";
import api from "./api";
import { logAction } from "./utils/logAction";
import { supabase } from "./supabaseClient"; // 🔥 NOVO

const DATAS_TRABALHO_FUND1_3BIMESTRE = {
  inicio: "2026-08-19",
  fim: "2026-08-21",
  texto: "19, 20 e 21/08/2026"
};

function normalizarNomeTurma(nome) {
  return (nome || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[º°ª]/g, "")
    .replace("ANO", "");
}

function turmaFundamental1(nome) {
  return /^[1-5][A-Z]?$/.test(normalizarNomeTurma(nome));
}

function trabalhoFund1Restrito(atribuicao, bimestre) {
  return bimestre === 3 && turmaFundamental1(atribuicao?.turma?.nome);
}

function dataTrabalhoFund1Permitida(data) {
  return (
    data >= DATAS_TRABALHO_FUND1_3BIMESTRE.inicio &&
    data <= DATAS_TRABALHO_FUND1_3BIMESTRE.fim
  );
}

function ProfessorTrabalho() {
  const bimestreDisponivel = 3;

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");

  const [atribuicoesSelecionadas, setAtribuicoesSelecionadas] = useState([]);

  const [bimestre] = useState(bimestreDisponivel);
  const [mostrarCopiar, setMostrarCopiar] = useState(false);

  const [topicos, setTopicos] = useState([""]);
  const [instrucoes, setInstrucoes] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  // 🔥 NOVO
  const [isAdmin, setIsAdmin] = useState(false);

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
    marginRight: "10px"
  };

  const limparFormulario = () => {
    setTopicos([""]);
    setInstrucoes("");
    setDataEntrega("");
    setModoEdicao(false);
  };

  const getIdsAtribuicoesParaSalvar = () =>
    atribuicoesSelecionadas.length > 0
      ? atribuicoesSelecionadas
      : atribuicaoSelecionada
      ? [atribuicaoSelecionada]
      : [];

  const getAtribuicoesParaSalvar = () => {
    const ids = getIdsAtribuicoesParaSalvar().map(String);
    return atribuicoes.filter(a => ids.includes(String(a.id)));
  };

  const temRestricaoTrabalhoFund1 = getAtribuicoesParaSalvar().some(a =>
    trabalhoFund1Restrito(a, bimestre)
  );
  const turmaSelecionadaParaData = getIdsAtribuicoesParaSalvar().length > 0;
  const dataEntregaBloqueada = !turmaSelecionadaParaData;

  const alterarDataEntrega = (valor) => {
    setDataEntrega(valor);

    if (temRestricaoTrabalhoFund1 && valor && !dataTrabalhoFund1Permitida(valor)) {
      setMensagem(
        `Para turmas do 1o ao 5o ano, os trabalhos do 3o bimestre devem ficar em ${DATAS_TRABALHO_FUND1_3BIMESTRE.texto}.`
      );
      setTipoMensagem("warning");
    } else if (tipoMensagem === "warning") {
      setMensagem("");
      setTipoMensagem("");
    }
  };

  useEffect(() => {
    if (temRestricaoTrabalhoFund1 && dataEntrega && !dataTrabalhoFund1Permitida(dataEntrega)) {
      setDataEntrega("");
      setMensagem(
        `Para turmas do 1o ao 5o ano, escolha apenas ${DATAS_TRABALHO_FUND1_3BIMESTRE.texto}.`
      );
      setTipoMensagem("warning");
    }
  }, [temRestricaoTrabalhoFund1, dataEntrega]);

  // =========================
  // CARREGAR PROFESSORES + ADMIN
  // =========================

  useEffect(() => {

    async function carregarProfessores() {

      const response = await api.get("/professores");

      const ordenados = [...response.data].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      );

      setProfessores(ordenados);

      const ADMIN_EMAIL = "sharlayne.fonseca@professor.barueri.br";

      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;

      console.log("EMAIL LOGADO:", email);

      // 🔥 ADMIN
      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }

      // 🔥 AUTO SELEÇÃO
      const professor = ordenados.find(
        p => p.email?.toLowerCase() === email?.toLowerCase()
      );

      if (professor) {
        setProfessorSelecionado(professor.id);
        carregarAtribuicoes(professor.id);
      }

    }

    carregarProfessores();

  }, []);

  // =========================
  // CARREGAR ATRIBUIÇÕES
  // =========================

  const carregarAtribuicoes = async (id) => {

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

  };

  // =========================
  // URL PARAMETROS
  // =========================

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const atribuicao = params.get("atribuicao");
    if (atribuicao) setAtribuicaoSelecionada(atribuicao);

  }, []);

  // =========================
  // BUSCAR TRABALHO
  // =========================

  useEffect(() => {

    if (!atribuicaoSelecionada) return;

    async function buscarTrabalho() {

      try {

        const response = await api.get("/trabalhos", {
          params: {
            atribuicao_id: atribuicaoSelecionada,
            bimestre
          }
        });

        const salvo = response.data;

        setDataEntrega(salvo.data_entrega?.split("T")[0]);
        setTopicos(Array.isArray(salvo.conteudo) ? salvo.conteudo : [salvo.conteudo]);
        setInstrucoes(salvo.instrucoes || "");

        setModoEdicao(true);

        setMensagem("Você está editando um trabalho existente.");
        setTipoMensagem("warning");

      } catch {

        limparFormulario();
        setMensagem("");

      }

    }

    buscarTrabalho();

  }, [atribuicaoSelecionada, bimestre]);

  // =========================
  // MULTI TURMAS
  // =========================

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

  // =========================
  // TÓPICOS
  // =========================

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

  // =========================
  // SALVAR TRABALHO
  // =========================

  const salvarTrabalho = async () => {

    if (!atribuicaoSelecionada && atribuicoesSelecionadas.length === 0) {

      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");

      return;

    }

    const atribuicoesParaSalvar = getIdsAtribuicoesParaSalvar();
    const temRestricao = getAtribuicoesParaSalvar().some(a =>
      trabalhoFund1Restrito(a, bimestre)
    );

    if (temRestricao && !dataTrabalhoFund1Permitida(dataEntrega)) {
      setMensagem(
        `Para turmas do 1o ao 5o ano, os trabalhos do 3o bimestre devem ficar em ${DATAS_TRABALHO_FUND1_3BIMESTRE.texto}.`
      );
      setTipoMensagem("error");
      return;
    }

    try {

      for (const atribuicaoId of atribuicoesParaSalvar) {

        await api.post("/trabalhos", {
          atribuicao_id: atribuicaoId,
          bimestre,
          conteudo: JSON.stringify(topicos),
          instrucoes,
          data_entrega: dataEntrega
        });

      }

      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoSelecionada);

      await logAction({
        action: modoEdicao ? "Atualizou trabalho mensal" : "Criou trabalho mensal",
        entidade: "Trabalho",
        turma: atribuicaoAtual?.turma?.nome,
        disciplina: atribuicaoAtual?.disciplina?.nome,
        bimestre,
        detalhes: `Conteúdo: ${topicos.join(", ")} | Entrega: ${dataEntrega}`
      });

      setMensagem(
        modoEdicao
          ? "Trabalho atualizado com sucesso!"
          : "Trabalho salvo com sucesso!"
      );

      setTipoMensagem("success");

      setTimeout(() => {

        limparFormulario();
        setMensagem("");

      }, 1200);

    } catch (error) {

      setMensagem(error.response?.data?.detail || "Erro ao salvar trabalho.");
      setTipoMensagem("error");

    }

  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0" }}>

      <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "20px" }}>
        Lançamento de Trabalho Mensal
      </h2>

      {mensagem && <div style={mensagemStyle}>{mensagem}</div>}

      {/* 🔥 ADMIN */}
      {isAdmin && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          🔥 Modo Administrador
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

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "10px",
            marginBottom: "15px",
            maxHeight: "200px",
            overflowY: "auto"
          }}
        >

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
        disabled
      >
        <option value={3}>3º Bimestre</option>
      </select>

      <input
        type="date"
        style={{
          ...inputStyle,
          cursor: dataEntregaBloqueada ? "not-allowed" : "pointer",
          opacity: dataEntregaBloqueada ? 0.65 : 1
        }}
        value={dataEntrega}
        disabled={dataEntregaBloqueada}
        min={temRestricaoTrabalhoFund1 ? DATAS_TRABALHO_FUND1_3BIMESTRE.inicio : undefined}
        max={temRestricaoTrabalhoFund1 ? DATAS_TRABALHO_FUND1_3BIMESTRE.fim : undefined}
        title={
          dataEntregaBloqueada
            ? "Selecione uma turma/disciplina antes de escolher a data."
            : temRestricaoTrabalhoFund1
            ? `Disponivel apenas em ${DATAS_TRABALHO_FUND1_3BIMESTRE.texto}.`
            : undefined
        }
        onChange={(e) => alterarDataEntrega(e.target.value)}
      />

      <h4>Conteúdo:</h4>

      {topicos.map((topico, index) => (

        <div key={index} style={{ display: "flex", gap: "10px" }}>

          <input
            type="text"
            value={topico}
            onChange={(e) => atualizarTopico(index, e.target.value)}
            style={{ ...inputStyle, marginBottom: "5px" }}
          />

          <button onClick={() => removerTopico(index)}>❌</button>

        </div>

      ))}

      <button onClick={adicionarTopico} style={buttonStyle}>
        + Adicionar Tópico
      </button>

      <h4 style={{ marginTop: "20px" }}>Instruções:</h4>

      <textarea
        style={{ ...inputStyle, height: "100px" }}
        value={instrucoes}
        onChange={(e) => setInstrucoes(e.target.value)}
      />

      <button onClick={salvarTrabalho} style={buttonStyle}>
        {modoEdicao ? "Atualizar Trabalho" : "Salvar Trabalho"}
      </button>

    </div>
  );
}

export default ProfessorTrabalho;
