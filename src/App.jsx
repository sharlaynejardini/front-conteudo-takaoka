// ==========================================
// APP.JSX
// Aviso quando estiver editando conteúdo existente
// ==========================================

import { useEffect, useState } from "react";
import api from "./api";

function App() {

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
  const [modoEdicao, setModoEdicao] = useState(false); // 🔥 NOVO ESTADO

  // ==========================================
  // CARREGAR PROFESSORES
  // ==========================================

  useEffect(() => {
    carregarProfessores();
  }, []);

  useEffect(() => {
    setDataAvaliacao(semanasProva[bimestre].inicio);
  }, [bimestre]);

  const carregarProfessores = async () => {
    const response = await api.get("/professores");
    setProfessores(response.data);
  };

  const carregarAtribuicoes = async (professorId) => {
    if (!professorId) return;
    const response = await api.get(`/atribuicoes/${professorId}`);
    setAtribuicoes(response.data);
  };

  // ==========================================
  // BUSCAR AUTOMATICAMENTE
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
        const topicosConvertidos = JSON.parse(conteudoSalvo.conteudo);
        setTopicos(
          Array.isArray(topicosConvertidos)
            ? topicosConvertidos
            : [conteudoSalvo.conteudo]
        );
      } catch {
        setTopicos([conteudoSalvo.conteudo]);
      }

      setModoEdicao(true); // 🔥 Está editando
      setMensagem("Você está editando um conteúdo já existente.");

    } catch {
      // Se não existir conteúdo
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
    setTopicos(novos.length > 0 ? novos : [""]);
  };

  // ==========================================
  // SALVAR
  // ==========================================

  const salvarConteudo = async () => {
    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma.");
      return;
    }

    await api.post("/conteudos", {
      atribuicao_id: atribuicaoSelecionada,
      bimestre,
      conteudo: JSON.stringify(topicos),
      data_avaliacao: dataAvaliacao
    });

    setModoEdicao(true);
    setMensagem("Conteúdo salvo com sucesso!");
  };

  return (
    <div>

      <h2>Painel do Professor</h2>

      {/* 🔥 ALERTA VISUAL DE EDIÇÃO */}
      {modoEdicao && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            padding: "10px",
            marginTop: "15px",
            borderRadius: "5px",
            color: "#856404"
          }}
        >
          ⚠ Você está editando um conteúdo já existente.
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
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

      <div style={{ marginTop: "20px" }}>
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

      <div style={{ marginTop: "20px" }}>
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

      <div style={{ marginTop: "20px" }}>
        <label>Data da Avaliação:</label><br />
        <input
          type="date"
          value={dataAvaliacao}
          min={semanasProva[bimestre].inicio}
          max={semanasProva[bimestre].fim}
          onChange={(e) => setDataAvaliacao(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "30px" }}>
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

      <div style={{ marginTop: "30px" }}>
        <button onClick={salvarConteudo}>
          {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
        </button>
      </div>

      <p>{mensagem}</p>

    </div>
  );
}

export default App;