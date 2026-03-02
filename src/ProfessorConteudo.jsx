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
  // GERAR LISTA DE DATAS VÁLIDAS
  // ==========================================

  const gerarDatasValidas = (inicio, fim) => {
    const datas = [];
    let atual = new Date(inicio);
    const dataFim = new Date(fim);

    while (atual <= dataFim) {
      datas.push(atual.toISOString().split("T")[0]);
      atual.setDate(atual.getDate() + 1);
    }

    return datas;
  };

  const datasValidas = gerarDatasValidas(
    semanasProva[bimestre].inicio,
    semanasProva[bimestre].fim
  );

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
  // VALIDAR DATA AO ALTERAR
  // ==========================================

  const handleDataChange = (valor) => {

    if (!datasValidas.includes(valor)) {
      alert(
        "Data inválida.\n\n" +
        "As avaliações só podem ser agendadas dentro da semana oficial do bimestre."
      );
      return;
    }

    setDataAvaliacao(valor);
  };

  // ==========================================
  // SALVAR
  // ==========================================

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada) {
      alert("Selecione uma turma/disciplina antes de salvar.");
      return;
    }

    if (!datasValidas.includes(dataAvaliacao)) {
      alert(
        "A data escolhida não pertence à semana oficial de provas."
      );
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

      const detalhe = error.response?.data?.detail || "";

      if (detalhe.includes("duas avaliações")) {
        alert(
          "Já existem duas avaliações cadastradas para esta turma neste mesmo dia.\n\n" +
          "O máximo permitido é 2 avaliações por dia."
        );
      } else if (detalhe.includes("semana oficial")) {
        alert(
          "A avaliação deve ser marcada dentro da semana oficial do bimestre."
        );
      } else {
        alert("Erro ao salvar conteúdo.");
      }

      console.error("Erro ao salvar", error);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>

      <h2>Painel do Professor</h2>

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

      {/* DATA COM BLOQUEIO REAL */}
      <div style={{ marginBottom: "20px" }}>
        <label>Data da Avaliação:</label><br />
        <select
          value={dataAvaliacao}
          onChange={(e) => handleDataChange(e.target.value)}
        >
          {datasValidas.map((data) => (
            <option key={data} value={data}>
              {new Date(data).toLocaleDateString("pt-BR")}
            </option>
          ))}
        </select>
      </div>

      {/* CONTEÚDOS */}
      <div style={{ marginBottom: "20px" }}>
        <label>Conteúdos (Tópicos):</label>

        {topicos.map((topico, index) => (
          <div key={index} style={{ marginTop: "10px" }}>
            <input
              type="text"
              value={topico}
              onChange={(e) => {
                const novos = [...topicos];
                novos[index] = e.target.value;
                setTopicos(novos);
              }}
              style={{ width: "70%" }}
            />
            <button
              onClick={() =>
                setTopicos(topicos.filter((_, i) => i !== index))
              }
              style={{ marginLeft: "10px" }}
            >
              ❌
            </button>
          </div>
        ))}

        <div style={{ marginTop: "10px" }}>
          <button onClick={() => setTopicos([...topicos, ""])}>
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