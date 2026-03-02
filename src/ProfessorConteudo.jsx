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

  // ==========================
  // CARREGAR PROFESSORES
  // ==========================

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

  const trocarProfessor = async (id) => {
    setProfessorSelecionado(id);
    setAtribuicoes([]);
    setAtribuicaoSelecionada("");
    setTopicos([""]);
    setModoEdicao(false);

    if (!id) return;

    try {
      const response = await api.get(`/atribuicoes/${id}`);
      setAtribuicoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar atribuições", error);
    }
  };

  // ==========================
  // DATA POR BIMESTRE
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

    setModoEdicao(false);

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

    } catch (error) {
      if (error.response?.status === 404) {
        // NÃO EXISTE → CAMPOS EM BRANCO
        setTopicos([""]);
        setModoEdicao(false);
      } else {
        console.error("Erro inesperado:", error);
      }
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

  const removerTopico = (index) => {
    const novos = topicos.filter((_, i) => i !== index);
    setTopicos(novos.length ? novos : [""]);
  };

  // ==========================
  // SALVAR
  // ==========================

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada) {
      alert("Selecione uma turma/disciplina.");
      return;
    }

    try {
      await api.post("/conteudos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        data_avaliacao: dataAvaliacao
      });

      if (!modoEdicao) {
        // PRIMEIRA VEZ
        alert("Salvo com sucesso!");
        setTopicos([""]);
      } else {
        alert("Atualizado com sucesso!");
      }

      setModoEdicao(true);

    } catch (error) {
      console.error("Erro ao salvar:", error.response?.data || error);
      alert("Erro ao salvar conteúdo.");
    }
  };

  // ==========================
  // RENDER
  // ==========================

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>
      <h2>Painel do Professor</h2>

      {modoEdicao && (
        <div style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeeba",
          padding: "10px",
          borderRadius: "5px",
          color: "#856404",
          marginBottom: "20px"
        }}>
          ⚠ Você está editando um conteúdo já existente.
        </div>
      )}

      <select
        value={professorSelecionado}
        onChange={(e) => trocarProfessor(e.target.value)}
      >
        <option value="">Selecione Professor</option>
        {professores.map(p => (
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
      </select>

      <br /><br />

      <select
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

      <br /><br />

      <select
        value={bimestre}
        onChange={(e) => setBimestre(Number(e.target.value))}
      >
        <option value={1}>1º</option>
        <option value={2}>2º</option>
        <option value={3}>3º</option>
        <option value={4}>4º</option>
      </select>

      <br /><br />

      {topicos.map((t, i) => (
        <div key={i}>
          <input
            type="text"
            value={t}
            onChange={(e) => atualizarTopico(i, e.target.value)}
          />
          <button onClick={() => removerTopico(i)}>❌</button>
        </div>
      ))}

      <button onClick={adicionarTopico}>➕ Adicionar</button>

      <br /><br />

      <button onClick={salvarConteudo}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

    </div>
  );
}

export default ProfessorConteudo;