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

  const estadoInicial = {
    professorSelecionado: "",
    atribuicaoSelecionada: "",
    bimestre: 1,
    topicos: [""],
    dataAvaliacao: semanasProva[1].inicio
  };

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState(estadoInicial.professorSelecionado);
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState(estadoInicial.atribuicaoSelecionada);
  const [bimestre, setBimestre] = useState(estadoInicial.bimestre);
  const [topicos, setTopicos] = useState(estadoInicial.topicos);
  const [dataAvaliacao, setDataAvaliacao] = useState(estadoInicial.dataAvaliacao);

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

  const limparTudo = () => {
    setProfessorSelecionado("");
    setAtribuicaoSelecionada("");
    setBimestre(1);
    setTopicos([""]);
    setDataAvaliacao(semanasProva[1].inicio);
    setModoEdicao(false);
  };

  // ==========================
  // CARREGAR PROFESSORES
  // ==========================

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
  };

  // ==========================
  // ATUALIZA DATA QUANDO MUDA BIMESTRE
  // ==========================

  useEffect(() => {
    setDataAvaliacao(semanasProva[bimestre].inicio);
  }, [bimestre]);

  // ==========================
  // CONVERTER CONTEÚDO
  // ==========================

  const converterConteudoParaArray = (conteudo) => {
    if (!conteudo) return [""];

    if (Array.isArray(conteudo)) return conteudo;

    try {
      const convertido = JSON.parse(conteudo);
      return Array.isArray(convertido) ? convertido : [convertido];
    } catch {
      return conteudo.includes(",")
        ? conteudo.split(",").map(t => t.trim())
        : [conteudo];
    }
  };

  // ==========================
  // BUSCAR PARA EDIÇÃO
  // ==========================

  useEffect(() => {
    if (!atribuicaoSelecionada) return;

    async function buscarConteudo() {
      try {
        const response = await api.get("/conteudos", {
          params: {
            atribuicao_id: atribuicaoSelecionada,
            bimestre
          }
        });

        const salvo = response.data;

        setDataAvaliacao(salvo.data_avaliacao?.split("T")[0]);
        setTopicos(converterConteudoParaArray(salvo.conteudo));

        setModoEdicao(true);
        setMensagem("Você está editando um conteúdo existente.");
        setTipoMensagem("warning");

      } catch {
        setModoEdicao(false);
        setTopicos([""]);
        setMensagem("");
      }
    }

    buscarConteudo();

  }, [atribuicaoSelecionada, bimestre]);

  // ==========================
  // TÓPICOS
  // ==========================

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

  // ==========================
  // SALVAR / ATUALIZAR
  // ==========================

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    try {
      await api.post("/conteudos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        data_avaliacao: dataAvaliacao
      });

      await logAction("Criou ou atualizou avaliação");

      setMensagem(
        modoEdicao
          ? "Conteúdo atualizado com sucesso!"
          : "Conteúdo salvo com sucesso!"
      );

      setTipoMensagem("success");

      setTimeout(() => {
        limparTudo();
        setMensagem("");
      }, 1200);

    } catch {
      setMensagem("Já existem 2 provas para essa turma nesse dia.");
      setTipoMensagem("error");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>

      <h2>Lançamento de Avaliação</h2>

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
      >
        <option value="">Selecione Turma / Disciplina</option>
        {atribuicoes.map(a => (
          <option key={a.id} value={a.id}>
            {a.turma.nome} - {a.disciplina.nome}
          </option>
        ))}
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
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px"
          }}
        >
          <input
            type="text"
            value={topico}
            onChange={(e) => atualizarTopico(index, e.target.value)}
            style={{ ...inputStyle, marginBottom: "0" }}
          />

          <button
            onClick={() => removerTopico(index)}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 10px",
              cursor: "pointer",
              height: "38px"
            }}
          >
            ❌
          </button>
        </div>
      ))}

      <button onClick={adicionarTopico}>
        + Adicionar Tópico
      </button>

      <br /><br />

      <button onClick={salvarConteudo}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

    </div>
  );
}

export default ProfessorConteudo;