// ==========================================
// APP.JSX
// Página do Professor
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
  const [conteudo, setConteudo] = useState("");
  const [dataAvaliacao, setDataAvaliacao] = useState(semanasProva[1].inicio);
  const [mensagem, setMensagem] = useState("");

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

  const salvarConteudo = async () => {
    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma.");
      return;
    }

    await api.post("/conteudos", {
      atribuicao_id: atribuicaoSelecionada,
      bimestre,
      conteudo,
      data_avaliacao: dataAvaliacao
    });

    setMensagem("Conteúdo salvo com sucesso!");
  };

  return (
    <div>

      <h2>Painel do Professor</h2>

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

      <div style={{ marginTop: "20px" }}>
        <label>Conteúdo:</label><br />
        <textarea
          rows="6"
          cols="70"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={salvarConteudo}>
          Salvar
        </button>
      </div>

      <p>{mensagem}</p>

    </div>
  );
}

export default App;