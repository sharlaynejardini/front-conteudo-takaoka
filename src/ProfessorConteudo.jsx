import { useEffect, useState } from "react";
import api from "./api";
import { logAction } from "./utils/logAction";

function ProfessorConteudo() {

  const anoAtual = new Date().getFullYear();

  const semanasProva = {
    1: { inicio: `${anoAtual}-04-13`, fim: `${anoAtual}-04-17` },
    2: { inicio: `${anoAtual}-06-08`, fim: `${anoAtual}-06-12` },
    3: { inicio: `${anoAtual}-09-14`, fim: `${anoAtual}-09-18` },
    4: { inicio: `${anoAtual}-11-13`, fim: `${anoAtual}-11-19` }
  };

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");
  const [atribuicoesSelecionadas, setAtribuicoesSelecionadas] = useState([]);

  const [bimestre, setBimestre] = useState(1);
  const [mostrarCopiar, setMostrarCopiar] = useState(false);

  const [topicos, setTopicos] = useState([""]);
  const [dataAvaliacao, setDataAvaliacao] = useState(semanasProva[1].inicio);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

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
    setModoEdicao(false);
  };

  useEffect(() => {

    async function carregar() {

      const response = await api.get("/professores");

      const ordenados = [...response.data].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      );

      setProfessores(ordenados);

    }

    carregar();

  }, []);

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

  useEffect(() => {

    if (!modoEdicao) {
      setDataAvaliacao(semanasProva[bimestre].inicio);
    }

  }, [bimestre]);

  const verificarLimiteAvaliacoes = async () => {

    const atribuicoesParaSalvar =
      atribuicoesSelecionadas.length > 0
        ? atribuicoesSelecionadas
        : [atribuicaoSelecionada];

    for (const atribuicaoId of atribuicoesParaSalvar) {

      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoId);

      if (!atribuicaoAtual) continue;

      const turmaId = atribuicaoAtual.turma.id;

      const response = await api.get("/cronograma", {
        params: {
          turma_id: turmaId,
          bimestre
        }
      });

      const avaliacoesMesmoDia = response.data.filter(item =>
        item.data_avaliacao.split("T")[0] === dataAvaliacao
      );

      if (avaliacoesMesmoDia.length >= 2) {

        setMensagem(`⚠️ A turma ${atribuicaoAtual.turma.nome} já possui 2 avaliações neste dia.`);
        setTipoMensagem("error");

        return false;

      }

    }

    return true;

  };

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

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada && atribuicoesSelecionadas.length === 0) {

      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");

      return;

    }

    const podeSalvar = await verificarLimiteAvaliacoes();

    if (!podeSalvar) return;

    const atribuicoesParaSalvar =
      atribuicoesSelecionadas.length > 0
        ? atribuicoesSelecionadas
        : [atribuicaoSelecionada];

    try {

      for (const atribuicaoId of atribuicoesParaSalvar) {

        await api.post("/conteudos", {
          atribuicao_id: atribuicaoId,
          bimestre,
          conteudo: JSON.stringify(topicos),
          data_avaliacao: dataAvaliacao
        });

      }

      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoSelecionada);

      await logAction({
        action: modoEdicao ? "Atualizou avaliação" : "Criou avaliação",
        entidade: "Avaliação",
        turma: atribuicaoAtual?.turma?.nome,
        disciplina: atribuicaoAtual?.disciplina?.nome,
        bimestre,
        detalhes: `Conteúdo: ${topicos.join(", ")} | Data: ${dataAvaliacao}`
      });

      setMensagem(
        modoEdicao
          ? "Conteúdo atualizado com sucesso!"
          : "Conteúdo salvo com sucesso!"
      );

      setTipoMensagem("success");

      setTimeout(() => {

        limparFormulario();
        setMensagem("");

      }, 1200);

    } catch {

      setMensagem("Erro ao salvar conteúdo.");
      setTipoMensagem("error");

    }

  };

  return (

    <div style={{ maxWidth: "700px", margin: "0 auto" }}>

      <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "20px" }}>
        Lançamento de Avaliação
      </h2>

      {mensagem && <div style={mensagemStyle}>{mensagem}</div>}

      <select
        style={inputStyle}
        value={professorSelecionado}
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

      <select
        style={inputStyle}
        value={atribuicaoSelecionada}
        onChange={(e) => setAtribuicaoSelecionada(e.target.value)}
        disabled={!professorSelecionado}
      >

        <option value="">Selecione Turma / Disciplina</option>

        {atribuicoes.map(a => (
          <option key={a.id} value={a.id}>
            {a.turma.nome} - {a.disciplina.nome}
          </option>
        ))}

      </select>

      <select
        style={inputStyle}
        value={bimestre}
        onChange={(e) => setBimestre(Number(e.target.value))}
      >

        <option value={1}>1º Bimestre</option>
        <option value={2}>2º Bimestre</option>
        <option value={3}>3º Bimestre</option>
        <option value={4}>4º Bimestre</option>

      </select>

      <input
        type="date"
        style={inputStyle}
        value={dataAvaliacao}
        min={semanasProva[bimestre].inicio}
        max={semanasProva[bimestre].fim}
        onChange={(e) => setDataAvaliacao(e.target.value)}
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

          <button onClick={() => removerTopico(index)}>❌</button>

        </div>

      ))}

      <button onClick={adicionarTopico} style={buttonStyle}>
        + Adicionar Tópico
      </button>

      <button onClick={salvarConteudo} style={buttonStyle}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

    </div>

  );

}

export default ProfessorConteudo;