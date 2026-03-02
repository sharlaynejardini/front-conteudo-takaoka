// ==========================================
// PROFESSORCONTEUDO.JSX
// Layout moderno + Regra 2 provas por dia
// ==========================================

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
  const [tipoMensagem, setTipoMensagem] = useState(""); // success | warning | error

  // ==========================
  // CARREGAR PROFESSORES
  // ==========================

  useEffect(() => {
    async function carregar() {
      try {
        const response = await api.get("/professores");
        setProfessores(response.data);
      } catch (error) {
        console.error("Erro ao carregar professores:", error);
      }
    }
    carregar();
  }, []);

  // ==========================
  // CARREGAR ATRIBUIÇÕES
  // ==========================

  const carregarAtribuicoes = async (id) => {
    if (!id) {
      setAtribuicoes([]);
      return;
    }

    try {
      const response = await api.get(`/atribuicoes/${id}`);
      setAtribuicoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar atribuições:", error);
    }
  };

  // ==========================
  // DATA AUTOMÁTICA POR BIMESTRE
  // ==========================

  useEffect(() => {
    setDataAvaliacao(semanasProva[bimestre].inicio);
  }, [bimestre]);

  // ==========================
  // BUSCAR CONTEÚDO EXISTENTE
  // ==========================

  useEffect(() => {
    if (!atribuicaoSelecionada) return;
    buscarConteudo();
  }, [atribuicaoSelecionada, bimestre]);

  const buscarConteudo = async () => {
    try {
      const response = await api.get("/conteudos", {
        params: {
          atribuicao_id: atribuicaoSelecionada,
          bimestre
        }
      });

      const salvo = response.data;

      setDataAvaliacao(salvo.data_avaliacao);

      try {
        const convertido = JSON.parse(salvo.conteudo);
        setTopicos(Array.isArray(convertido) ? convertido : [salvo.conteudo]);
      } catch {
        setTopicos([salvo.conteudo]);
      }

      setModoEdicao(true);
      setMensagem("Você está editando um conteúdo existente.");
      setTipoMensagem("warning");

    } catch {
      setModoEdicao(false);
      setTopicos([""]);
      setMensagem("");
    }
  };

  // ==========================
  // MANIPULAR TÓPICOS
  // ==========================

  const adicionarTopico = () => {
    setTopicos([...topicos, ""]);
  };

  const atualizarTopico = (index, valor) => {
    const novos = [...topicos];
    novos[index] = valor;
    setTopicos(novos);
  };

  // ==========================
  // SALVAR COM REGRA DE 2 PROVAS
  // ==========================

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    try {

      const atribuicao = atribuicoes.find(
        a => String(a.id) === String(atribuicaoSelecionada)
      );

      if (!atribuicao || !atribuicao.turma?.id) {
        setMensagem("Erro interno: turma não encontrada.");
        setTipoMensagem("error");
        return;
      }

      const responseCronograma = await api.get("/cronograma", {
        params: {
          turma_id: atribuicao.turma.id,
          bimestre
        }
      });

      const provasMesmoDia = responseCronograma.data.filter(
        item => item.data_avaliacao === dataAvaliacao
      );

      if (!modoEdicao && provasMesmoDia.length >= 2) {
        setMensagem("Já existem 2 provas agendadas para esse dia nesta turma.");
        setTipoMensagem("error");
        return;
      }

      await api.post("/conteudos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos || []),
        data_avaliacao: dataAvaliacao
      });

      setMensagem("Conteúdo salvo com sucesso!");
      setTipoMensagem("success");
      setModoEdicao(false);
      setTopicos([""]);

    } catch (error) {
      console.error("Erro real:", error);
      setMensagem("Erro ao salvar conteúdo.");
      setTipoMensagem("error");
    }
  };

  // ==========================
  // ESTILOS
  // ==========================

  const pageStyle = {
    backgroundColor: "#f4f6fa",
    minHeight: "100vh",
    padding: "40px"
  };

  const cardStyle = {
    maxWidth: "700px",
    margin: "auto",
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "15px"
  };

  const buttonStyle = {
    padding: "10px 15px",
    backgroundColor: "#2c4a8a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  };

  const mensagemStyle = {
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "20px",
    backgroundColor:
      tipoMensagem === "success"
        ? "#d4edda"
        : tipoMensagem === "warning"
        ? "#fff3cd"
        : "#f8d7da",
    color:
      tipoMensagem === "success"
        ? "#155724"
        : tipoMensagem === "warning"
        ? "#856404"
        : "#721c24"
  };

  // ==========================
  // RENDER
  // ==========================

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2 style={{ marginBottom: "20px", color: "#2c4a8a" }}>
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

        {topicos.map((t, i) => (
          <input
            key={i}
            type="text"
            style={inputStyle}
            value={t}
            onChange={(e) => atualizarTopico(i, e.target.value)}
          />
        ))}

        <button
          style={{ ...buttonStyle, backgroundColor: "#6c757d", marginRight: "10px" }}
          onClick={adicionarTopico}
        >
          + Adicionar Tópico
        </button>

        <button style={buttonStyle} onClick={salvarConteudo}>
          {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
        </button>

      </div>
    </div>
  );
}

export default ProfessorConteudo;