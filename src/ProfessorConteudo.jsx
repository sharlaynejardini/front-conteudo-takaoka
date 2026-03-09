import { useEffect, useState } from "react";
import api from "./api";
import { logAction } from "./utils/logAction";

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
  const [mostrarCopiar, setMostrarCopiar] = useState(false);

  const [topicos, setTopicos] = useState([""]);
  const [dataAvaliacao, setDataAvaliacao] = useState(semanasProva[1].inicio);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  // ==========================
  // ESTILOS
  // ==========================

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

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "10px",
    marginRight: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  // ==========================
  // LIMPAR FORMULÁRIO
  // ==========================

  const limparFormulario = () => {
    setTopicos([""]);
    setModoEdicao(false);
  };

  // ==========================
  // CARREGAR PROFESSORES
  // ==========================

  useEffect(() => {
    async function carregar() {
      try {
        console.log("Carregando professores...");
        const response = await api.get("/professores");
        console.log("Professores carregados:", response.data);

        const ordenados = [...response.data].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );

        setProfessores(ordenados);
      } catch (error) {
        console.error("ERRO ao carregar professores:", error);
        console.error("Stack trace:", error.stack);
      }
    }

    carregar();
  }, []);

  // ==========================
  // CARREGAR ATRIBUIÇÕES
  // ==========================

  const carregarAtribuicoes = async (id) => {
    try {
      console.log("Carregando atribuições para professor ID:", id);
      
      if (!id) {
        setAtribuicoes([]);
        return;
      }

      const response = await api.get(`/atribuicoes/${id}`);
      console.log("Atribuições carregadas:", response.data);

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

      // limpa turma e formulário ao trocar professor
      setAtribuicaoSelecionada("");
      limparFormulario();
    } catch (error) {
      console.error("ERRO ao carregar atribuições:", error);
      console.error("Stack trace:", error.stack);
      setAtribuicoes([]);
    }
  };

  // ==========================
  // ATUALIZA DATA SOMENTE SE NÃO ESTIVER EDITANDO
  // ==========================

  useEffect(() => {
    if (!modoEdicao) {
      setDataAvaliacao(semanasProva[bimestre].inicio);
    }
  }, [bimestre]);

  // ==========================
  // BUSCAR PARA EDIÇÃO
  // ==========================

  useEffect(() => {

    if (!atribuicaoSelecionada) return;

    async function buscarConteudo() {
      try {
        console.log("Buscando conteúdo para edição:", { atribuicao_id: atribuicaoSelecionada, bimestre });

        const response = await api.get("/conteudos", {
          params: {
            atribuicao_id: atribuicaoSelecionada,
            bimestre
          }
        });

        const salvo = response.data;
        console.log("Conteúdo encontrado:", salvo);

        setModoEdicao(true);
        setTopicos(Array.isArray(salvo.conteudo) ? salvo.conteudo : [salvo.conteudo]);
        setDataAvaliacao(salvo.data_avaliacao?.split("T")[0]);

        setMensagem("Você está editando uma avaliação existente.");
        setTipoMensagem("warning");

      } catch (error) {
        console.log("Nenhum conteúdo encontrado (normal para novo):", error.message);
        setModoEdicao(false);
        setTopicos([""]);
        setMensagem("");
      }
    }

    buscarConteudo();

  }, [atribuicaoSelecionada, bimestre]);

  // ==========================
  // COPIAR CONTEÚDO
  // ==========================

  const copiarConteudo = async (atribuicaoOrigemId) => {
    try {
      const response = await api.get("/conteudos", {
        params: {
          atribuicao_id: atribuicaoOrigemId,
          bimestre
        }
      });

      const conteudoOrigem = response.data;
      setTopicos(Array.isArray(conteudoOrigem.conteudo) ? conteudoOrigem.conteudo : [conteudoOrigem.conteudo]);
      setMostrarCopiar(false);
      setMensagem("⚠️ Conteúdo copiado! NÃO ESQUEÇA de ajustar a data e CLICAR EM SALVAR!");
      setTipoMensagem("warning");
    } catch (error) {
      setMensagem("Nenhum conteúdo encontrado para copiar.");
      setTipoMensagem("error");
    }
  };

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

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    try {
      console.log("Salvando conteúdo:", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        data_avaliacao: dataAvaliacao
      });

      await api.post("/conteudos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        data_avaliacao: dataAvaliacao
      });

      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoSelecionada);

      await logAction({
        action: modoEdicao ? "Atualizou avaliação" : "Criou avaliação",
        entidade: "Avaliação",
        turma: atribuicaoAtual?.turma?.nome,
        disciplina: atribuicaoAtual?.disciplina?.nome,
        bimestre,
        detalhes: `Conteúdo: ${topicos.join(", ")} | Data: ${dataAvaliacao}`
      });

      console.log("Conteúdo salvo com sucesso!");

      setMensagem(
        modoEdicao
          ? "Conteúdo atualizado com sucesso!"
          : "Conteúdo salvo com sucesso!"
      );

      setTipoMensagem("success");

      setTimeout(() => {
        limparFormulario();
        setMensagem("");
      }, 1200);

    } catch (error) {
      console.error("ERRO ao salvar conteúdo:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
      console.error("Stack trace:", error.stack);
      
      setMensagem("Já existem 2 provas para essa turma nesse dia.");
      setTipoMensagem("error");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0" }}>

      <h2>Lançamento de Avaliação</h2>

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
        disabled={!professorSelecionado}
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

      {!modoEdicao && atribuicaoSelecionada && (
        <button 
          onClick={() => setMostrarCopiar(!mostrarCopiar)} 
          style={{...buttonStyle, backgroundColor: "#059669", marginBottom: "10px"}}
        >
          {mostrarCopiar ? "Cancelar Cópia" : "📋 Copiar de Outra Turma"}
        </button>
      )}

      {mostrarCopiar && (
        <div style={{padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px", marginBottom: "15px", border: "2px solid #ffc107"}}>
          <h4 style={{marginTop: 0, color: "#856404"}}>⚠️ Selecione a turma para copiar:</h4>
          <p style={{fontSize: "13px", color: "#856404", marginBottom: "10px"}}>
            <strong>ATENÇÃO:</strong> Após copiar, ajuste a data e clique em SALVAR!
          </p>
          {atribuicoes
            .filter(a => a.id !== atribuicaoSelecionada)
            .map(a => (
              <button
                key={a.id}
                onClick={() => copiarConteudo(a.id)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#3b82f6",
                  width: "100%",
                  marginBottom: "5px",
                  textAlign: "left"
                }}
              >
                {a.turma.nome} - {a.disciplina.nome}
              </button>
            ))
          }
        </div>
      )}

      <h4>Conteúdos:</h4>

      {topicos.map((topico, index) => (
        <div key={index} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={topico}
            onChange={(e) => atualizarTopico(index, e.target.value)}
            style={{ ...inputStyle, marginBottom: "0" }}
          />
          <button onClick={() => removerTopico(index)}>❌</button>
        </div>
      ))}

      <button onClick={adicionarTopico} style={buttonStyle}>
        + Adicionar Tópico
      </button>

      <button onClick={salvarConteudo} style={buttonStyle}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

    </div>
  );
}

export default ProfessorConteudo;