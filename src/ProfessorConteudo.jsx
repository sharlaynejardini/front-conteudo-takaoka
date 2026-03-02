// ==========================================
// PROFESSORCONTEUDO.JSX
// Lançamento de Conteúdo por Professor
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

  const [mensagem, setMensagem] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);

  // ==========================================
  // CARREGAR PROFESSORES
  // ==========================================

  useEffect(() => {
    carregarProfessores();
  }, []);

  const carregarProfessores = async () => {
    try {
      const response = await api.get("/professores");
      setProfessores(response.data);
    } catch (error) {
      console.error("Erro ao carregar professores", error);
    }
  };

  // ==========================================
  // CARREGAR ATRIBUIÇÕES
  // ==========================================

  const carregarAtribuicoes = async (professorId) => {
    if (!professorId) return;

    try {
      const response = await api.get(`/atribuicoes/${professorId}`);
      setAtribuicoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar atribuições", error);
    }
  };

  // ==========================================
  // ATUALIZAR DATA QUANDO MUDAR BIMESTRE
  // ==========================================

  useEffect(() => {
    setDataAvaliacao(semanasProva[bimestre].inicio);
  }, [bimestre]);

  // ==========================================
  // BUSCAR CONTEÚDO EXISTENTE AUTOMATICAMENTE
  // ==========================================

  useEffect(() => {
    if (!atribuicaoSelecionada) return;
    buscarConteudoAutomatico();
  }, [atribuicaoSelecionada, bimestre]);

  const buscarConteudoAutomatico = async () => {
    try {
      const response = await api.get("/conteudos", {
        params: {
          atribuicao_id: atribuicaoSelecionada,
          bimestre
        }
      });

      const conteudoSalvo = response.data;

      setDataAvaliacao(conteudoSalvo.data_avaliacao);

      try {
        const convertido = JSON.parse(conteudoSalvo.conteudo);
        setTopicos(Array.isArray(convertido) ? convertido : [conteudoSalvo.conteudo]);
      } catch {
        setTopicos([conteudoSalvo.conteudo]);
      }

      setModoEdicao(true);
      setMensagem("Você está editando um conteúdo já existente.");

    } catch {
      setTopicos([""]);
      setModoEdicao(false);
      setMensagem("");
    }
  };

  // ==========================================
  // MANIPULAR TÓPICOS
  // ==========================================

  const adicionarTopico = () => {
    setTopicos([...topicos, ""]);
  };

  const atualizarTopico = (index, valor) => {
    const novos = [...topicos];
    novos[index] = valor;
    setTopicos(novos);
  };

  const removerTopico = (index) => {
    const novos = topicos.filter((_, i) => i !== index);
    setTopicos(novos.length ? novos : [""]);
  };

  // ==========================================
  // SALVAR
  // ==========================================

  const salvarConteudo = async () => {
    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma/disciplina.");
      return;
    }

    try {
      await api.post("/conteudos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        data_avaliacao: dataAvaliacao
      });

      setModoEdicao(true);
      setMensagem("Conteúdo salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar", error);
      setMensagem("Erro ao salvar conteúdo.");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>

      <h2>Painel do Professor</h2>

      {modoEdicao && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            padding: "10px",
            borderRadius: "5px",
            color: "#856404",
            marginBottom: "20px"
          }}
        >
          ⚠ Você está editando um conteúdo já existente.
        </div>
      )}

      {/* PROFESSOR */}
      <div style={{ marginBottom: "20px" }}>
        <label>Professor:</label><br />
        <select
          value={professorSelecionado}
          onChange={(e) => {
            setProfessorSelecionado(e.target.value);
            carregarAtribuicoes(e.target.value);
          }}
        >
          <option value="">Selecione</option>
          {professores.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.nome}
            </option>
          ))}
        </select>
      </div>

      {/* TURMA */}
      <div style={{ marginBottom: "20px" }}>
        <label>Turma / Disciplina:</label><br />
        <select
          value={atribuicaoSelecionada}
          onChange={(e) => setAtribuicaoSelecionada(e.target.value)}
        >
          <option value="">Selecione</option>
          {atribuicoes.map((atr) => (
            <option key={atr.id} value={atr.id}>
              {atr.turma.nome} - {atr.disciplina.nome}
            </option>
          ))}
        </select>
      </div>

      {/* BIMESTRE */}
      <div style={{ marginBottom: "20px" }}>
        <label>Bimestre:</label><br />
        <select
          value={bimestre}
          onChange={(e) => setBimestre(Number(e.target.value))}
        >
          <option value={1}>1º</option>
          <option value={2}>2º</option>
          <option value={3}>3º</option>
          <option value={4}>4º</option>
        </select>
      </div>

      {/* DATA */}
      <div style={{ marginBottom: "20px" }}>
        <label>Data da Avaliação:</label><br />
        <input
          type="date"
          value={dataAvaliacao}
          min={semanasProva[bimestre].inicio}
          max={semanasProva[bimestre].fim}
          onChange={(e) => setDataAvaliacao(e.target.value)}
        />
      </div>

      {/* CONTEÚDOS */}
      <div style={{ marginBottom: "20px" }}>
        <label>Conteúdos (Tópicos):</label>

        {topicos.map((topico, index) => (
          <div key={index} style={{ marginTop: "10px" }}>
            <input
              type="text"
              value={topico}
              onChange={(e) => atualizarTopico(index, e.target.value)}
              style={{ width: "70%" }}
            />
            <button
              onClick={() => removerTopico(index)}
              style={{ marginLeft: "10px" }}
            >
              ❌
            </button>
          </div>
        ))}

        <div style={{ marginTop: "10px" }}>
          <button onClick={adicionarTopico}>
            ➕ Adicionar Tópico
          </button>
        </div>
      </div>

      <button onClick={salvarConteudo}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

      <p style={{ marginTop: "20px" }}>{mensagem}</p>

    </div>
  );
}

export default ProfessorConteudo;