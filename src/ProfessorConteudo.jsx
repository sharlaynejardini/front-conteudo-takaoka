import { useEffect, useState } from "react";
import api from "./api";

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

  const [bimestre, setBimestre] = useState(1);
  const [topicos, setTopicos] = useState([""]);
  const [dataAvaliacao, setDataAvaliacao] = useState(semanasProva[1].inicio);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState(""); // success | error | warning

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

  const converterConteudoParaArray = (conteudo) => {
    if (!conteudo) return [""];

    if (Array.isArray(conteudo)) return conteudo;

    if (typeof conteudo === "string") {
      try {
        const convertido = JSON.parse(conteudo);
        return Array.isArray(convertido) ? convertido : [convertido];
      } catch {
        return conteudo.includes(",")
          ? conteudo.split(",").map(t => t.trim())
          : [conteudo];
      }
    }

    return [String(conteudo)];
  };

  // ==========================
  // BUSCAR CONTEÚDO EXISTENTE
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
  // MANIPULAR TÓPICOS
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

      setMensagem("Conteúdo salvo com sucesso!");
      setTipoMensagem("success");
      setModoEdicao(false);

    } catch {
      setMensagem("Erro ao salvar conteúdo.");
      setTipoMensagem("error");
    }
  };

  // ==========================
  // ESTILO DA MENSAGEM
  // ==========================

  const mensagemBase = {
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "500",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    animation: "fadeIn 0.3s ease-in-out"
  };

  const estilosMensagem = {
    success: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb"
    },
    error: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb"
    },
    warning: {
      backgroundColor: "#fff3cd",
      color: "#856404",
      border: "1px solid #ffeeba"
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px"
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>

      <h2>Lançamento de Avaliação</h2>

      {mensagem && (
        <div
          style={{
            ...mensagemBase,
            ...estilosMensagem[tipoMensagem]
          }}
        >
          <span>
            {tipoMensagem === "success" && "✔ "}
            {tipoMensagem === "error" && "✖ "}
            {tipoMensagem === "warning" && "⚠ "}
            {mensagem}
          </span>

          <button
            onClick={() => setMensagem("")}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            ✖
          </button>
        </div>
      )}

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
        onChange={(e) => setDataAvaliacao(e.target.value)}
      />

      <h4>Conteúdos:</h4>

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

      <br /><br />

      <button onClick={salvarConteudo}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

    </div>
  );
}

export default ProfessorConteudo;