// ==========================================
// PROFESSORCONTEUDO.JSX
// Layout moderno + limpeza automática
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
  const [tipoMensagem, setTipoMensagem] = useState("");

  // ==========================
  // CARREGAR PROFESSORES
  // ==========================

  useEffect(() => {
    async function carregar() {
      const response = await api.get("/professores");
      setProfessores(response.data);
    }
    carregar();
  }, []);

  const carregarAtribuicoes = async (id) => {
    if (!id) {
      setAtribuicoes([]);
      return;
    }
    const response = await api.get(`/atribuicoes/${id}`);
    setAtribuicoes(response.data);
  };

  useEffect(() => {
    setDataAvaliacao(semanasProva[bimestre].inicio);
  }, [bimestre]);

  useEffect(() => {
    if (!atribuicaoSelecionada) return;
    buscarConteudo();
  }, [atribuicaoSelecionada, bimestre]);

  // ==========================
  // LIMPAR FORMULÁRIO
  // ==========================

  const limparFormulario = () => {
    setAtribuicaoSelecionada("");
    setBimestre(1);
    setDataAvaliacao(semanasProva[1].inicio);
    setTopicos([""]);
    setModoEdicao(false);
    setMensagem("");
    setTipoMensagem("");
  };

  // ==========================
  // RECONSTRUÇÃO DOS TÓPICOS
  // ==========================

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

      let listaFinal = [];

      if (Array.isArray(salvo.conteudo)) {
        listaFinal = salvo.conteudo;
      } else if (typeof salvo.conteudo === "string") {
        try {
          const convertido = JSON.parse(salvo.conteudo);
          listaFinal = Array.isArray(convertido) ? convertido : [salvo.conteudo];
        } catch {
          listaFinal = [salvo.conteudo];
        }
      } else {
        listaFinal = [String(salvo.conteudo)];
      }

      setTopicos(listaFinal.length ? listaFinal : [""]);
      setModoEdicao(true);
      setMensagem("Você está editando um conteúdo existente.");
      setTipoMensagem("warning");

    } catch {
      setModoEdicao(false);
      setTopicos([""]);
      setMensagem("");
    }
  };

  const adicionarTopico = () => setTopicos([...topicos, ""]);

  const atualizarTopico = (i, v) => {
    const novos = [...topicos];
    novos[i] = v;
    setTopicos(novos);
  };

  // ==========================
  // SALVAR
  // ==========================

  const salvarConteudo = async () => {
    try {
      await api.post("/conteudos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        data_avaliacao: dataAvaliacao
      });

      setMensagem("Conteúdo salvo com sucesso!");
      setTipoMensagem("success");

      // 🔥 LIMPA APÓS SALVAR
      setTimeout(() => {
        limparFormulario();
      }, 800);

    } catch {
      setMensagem("Erro ao salvar conteúdo.");
      setTipoMensagem("error");
    }
  };

  // ==========================
  // ESTILOS
  // ==========================

  const pageStyle = {
    backgroundColor: "#f2f5fa",
    minHeight: "100vh",
    padding: "50px 20px"
  };

  const cardStyle = {
    maxWidth: "650px",
    margin: "auto",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d0d7e2",
    marginBottom: "15px"
  };

  const buttonPrimary = {
    backgroundColor: "#2c4a8a",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginRight: "10px"
  };

  const buttonSecondary = {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
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

  // ==========================
  // RENDER
  // ==========================

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2 style={{ textAlign: "center", color: "#2c4a8a", marginBottom: "25px" }}>
          Lançamento de Avaliação
        </h2>

        {mensagem && <div style={mensagemStyle}>{mensagem}</div>}

        <select
          style={inputStyle}
          value={professorSelecionado}
          onChange={(e) => {
            setProfessorSelecionado(e.target.value);
            carregarAtribuicoes(e.target.value);
            limparFormulario(); // 🔥 limpa ao trocar professor
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
            placeholder={`Tópico ${i + 1}`}
            style={inputStyle}
            value={t}
            onChange={(e) => atualizarTopico(i, e.target.value)}
          />
        ))}

        <button style={buttonSecondary} onClick={adicionarTopico}>
          + Adicionar Tópico
        </button>

        <br /><br />

        <button style={buttonPrimary} onClick={salvarConteudo}>
          {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
        </button>

      </div>
    </div>
  );
}

export default ProfessorConteudo;