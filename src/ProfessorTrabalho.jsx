import { useEffect, useState } from "react";
import api from "./api";

function ProfessorTrabalho() {

  const estadoInicial = {
    professorSelecionado: "",
    atribuicaoSelecionada: "",
    topicos: [""],
    instrucoes: "",
    dataEntrega: ""
  };

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState(estadoInicial.professorSelecionado);
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState(estadoInicial.atribuicaoSelecionada);
  const [topicos, setTopicos] = useState(estadoInicial.topicos);
  const [instrucoes, setInstrucoes] = useState(estadoInicial.instrucoes);
  const [dataEntrega, setDataEntrega] = useState(estadoInicial.dataEntrega);

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
    setTopicos([""]);
    setInstrucoes("");
    setDataEntrega("");
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
  // CONVERTER CONTEÚDO
  // ==========================

  const converterParaArray = (conteudo) => {
    if (!conteudo) return [""];

    if (Array.isArray(conteudo)) return conteudo;

    try {
      const convertido = JSON.parse(conteudo);
      return Array.isArray(convertido) ? convertido : [convertido];
    } catch {
      return [conteudo];
    }
  };

  // ==========================
  // BUSCAR PARA EDIÇÃO
  // ==========================

  useEffect(() => {
    if (!atribuicaoSelecionada) return;

    async function buscarTrabalho() {
      try {
        const response = await api.get("/trabalhos", {
          params: { atribuicao_id: atribuicaoSelecionada }
        });

        const salvo = response.data;

        setDataEntrega(salvo.data_entrega?.split("T")[0]);
        setTopicos(converterParaArray(salvo.conteudo));
        setInstrucoes(salvo.instrucoes || "");

        setModoEdicao(true);
        setMensagem("Você está editando um trabalho existente.");
        setTipoMensagem("warning");

      } catch {
        setModoEdicao(false);
        setTopicos([""]);
        setInstrucoes("");
        setMensagem("");
      }
    }

    buscarTrabalho();

  }, [atribuicaoSelecionada]);

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
  // SALVAR
  // ==========================

  const salvarTrabalho = async () => {

    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    try {
      await api.post("/trabalhos", {
        atribuicao_id: atribuicaoSelecionada,
        conteudo: JSON.stringify(topicos),
        instrucoes,
        data_entrega: dataEntrega
      });

      setMensagem(
        modoEdicao
          ? "Trabalho atualizado com sucesso!"
          : "Trabalho salvo com sucesso!"
      );

      setTipoMensagem("success");

      setTimeout(() => {
        limparTudo();
        setMensagem("");
      }, 1200);

    } catch {
      setMensagem("Erro ao salvar trabalho.");
      setTipoMensagem("error");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>

      <h2>Lançamento de Trabalho Mensal</h2>

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
        value={dataEntrega}
        onChange={(e) => setDataEntrega(e.target.value)}
      />

      <h4>Conteúdo do Trabalho:</h4>

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

      <button onClick={adicionarTopico}>
        + Adicionar Tópico
      </button>

      <h4 style={{ marginTop: "20px" }}>Instruções:</h4>

      <textarea
        style={{ ...inputStyle, height: "100px" }}
        value={instrucoes}
        onChange={(e) => setInstrucoes(e.target.value)}
      />

      <br />

      <button onClick={salvarTrabalho}>
        {modoEdicao ? "Atualizar Trabalho" : "Salvar Trabalho"}
      </button>

    </div>
  );
}

export default ProfessorTrabalho;