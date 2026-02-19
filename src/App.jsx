// ==========================================
// COMPONENTE PRINCIPAL DO SISTEMA
// ==========================================

import { useEffect, useState } from "react";
import api from "./api";

function App() {

  // ==========================================
  // ESTADOS DA APLICAÇÃO
  // ==========================================

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");

  const [bimestre, setBimestre] = useState(1);
  const [conteudo, setConteudo] = useState("");
  const [mensagem, setMensagem] = useState("");

  // ==========================================
  // CARREGAR PROFESSORES AO INICIAR
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
  // CARREGAR ATRIBUIÇÕES AO SELECIONAR PROFESSOR
  // ==========================================

  const carregarAtribuicoes = async (professorId) => {
    try {
      const response = await api.get(`/atribuicoes/${professorId}`);
      setAtribuicoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar atribuições", error);
    }
  };

  // ==========================================
  // BUSCAR CONTEÚDO
  // ==========================================

  const buscarConteudo = async () => {
    try {
      const response = await api.get("/conteudo", {
        params: {
          atribuicao_id: atribuicaoSelecionada,
          bimestre: bimestre
        }
      });

      setConteudo(response.data.conteudo);
      setMensagem("Conteúdo carregado com sucesso!");
    } catch (error) {
      setConteudo("");
      setMensagem("Nenhum conteúdo encontrado. Você pode criar um novo.");
    }
  };

  // ==========================================
  // SALVAR CONTEÚDO
  // ==========================================

  const salvarConteudo = async () => {
    try {
      await api.post("/conteudo", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre: bimestre,
        conteudo: conteudo
      });

      setMensagem("Conteúdo salvo com sucesso!");
    } catch (error) {
      setMensagem("Erro ao salvar conteúdo.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>Sistema de Conteúdos Essenciais</h2>

      {/* ==========================================
          SELEÇÃO DE PROFESSOR
      ========================================== */}
      <div>
        <label>Professor:</label>
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

      {/* ==========================================
          SELEÇÃO DE ATRIBUIÇÃO (TURMA + DISCIPLINA)
      ========================================== */}
      <div>
        <label>Turma / Disciplina:</label>
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

      {/* ==========================================
          SELEÇÃO DE BIMESTRE
      ========================================== */}
      <div>
        <label>Bimestre:</label>
        <select
          value={bimestre}
          onChange={(e) => setBimestre(Number(e.target.value))}
        >
          <option value={1}>1º Bimestre</option>
          <option value={2}>2º Bimestre</option>
          <option value={3}>3º Bimestre</option>
          <option value={4}>4º Bimestre</option>
        </select>

        <button onClick={buscarConteudo}>Buscar</button>
      </div>

      {/* ==========================================
          CAMPO DE TEXTO DO CONTEÚDO
      ========================================== */}
      <div style={{ marginTop: "20px" }}>
        <textarea
          rows="10"
          cols="80"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="Digite o conteúdo essencial aqui..."
        />
      </div>

      {/* ==========================================
          BOTÃO SALVAR
      ========================================== */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={salvarConteudo}>Salvar</button>
      </div>

      {/* ==========================================
          MENSAGEM DE RETORNO
      ========================================== */}
      <p>{mensagem}</p>
    </div>
  );
}

export default App;
