import { useEffect, useState } from "react";
import api from "./api";
import { logAction } from "./utils/logAction";
import { supabase } from "./supabaseClient";

function ProfessorTrabalho() {

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [mostrarCopiar, setMostrarCopiar] = useState(false);

  const [topicos, setTopicos] = useState([""]);
  const [instrucoes, setInstrucoes] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

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
    setInstrucoes("");
    setDataEntrega("");
    setModoEdicao(false);
  };

  // ==========================
  // CARREGAR PROFESSORES
  // ==========================

  useEffect(() => {
    async function carregarProfessores() {
      try {
        // Pega o email do usuário logado
        const { data: sessionData } = await supabase.auth.getSession();
        const emailLogado = sessionData.session?.user?.email;
        console.log("Email logado:", emailLogado);

        const response = await api.get("/professores");

        // Filtra apenas o professor com email correspondente
        const professorLogado = response.data.find(p => 
          p.email?.toLowerCase() === emailLogado?.toLowerCase()
        );

        if (professorLogado) {
          console.log("Professor encontrado:", professorLogado);
          setProfessores([professorLogado]);
          setProfessorSelecionado(professorLogado.id);
          carregarAtribuicoes(professorLogado.id);
        } else {
          console.log("Professor não encontrado para o email:", emailLogado);
          // Fallback: mostra todos se não encontrar
          const ordenados = [...response.data].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
          );
          setProfessores(ordenados);
        }
      } catch (error) {
        console.error(error);
      }
    }

    carregarProfessores();
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
      limparFormulario();

    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // BUSCAR PARA EDIÇÃO
  // ==========================

  useEffect(() => {

    if (!atribuicaoSelecionada) return;

    async function buscarTrabalho() {
      try {
        const response = await api.get("/trabalhos", {
          params: {
            atribuicao_id: atribuicaoSelecionada,
            bimestre
          }
        });

        const salvo = response.data;

        setDataEntrega(salvo.data_entrega?.split("T")[0]);
        setTopicos(Array.isArray(salvo.conteudo) ? salvo.conteudo : [salvo.conteudo]);
        setInstrucoes(salvo.instrucoes || "");

        setModoEdicao(true);
        setMensagem("Você está editando um trabalho existente.");
        setTipoMensagem("warning");

      } catch {
        limparFormulario();
        setMensagem("");
      }
    }

    buscarTrabalho();

  }, [atribuicaoSelecionada, bimestre]);

  // ==========================
  // COPIAR CONTEÚDO
  // ==========================

  const copiarTrabalho = async (atribuicaoOrigemId) => {
    try {
      const response = await api.get("/trabalhos", {
        params: {
          atribuicao_id: atribuicaoOrigemId,
          bimestre
        }
      });

      const trabalhoOrigem = response.data;
      setTopicos(Array.isArray(trabalhoOrigem.conteudo) ? trabalhoOrigem.conteudo : [trabalhoOrigem.conteudo]);
      setInstrucoes(trabalhoOrigem.instrucoes || "");
      setMostrarCopiar(false);
      setMensagem("⚠️ Conteúdo copiado! NÃO ESQUEÇA de ajustar a data e CLICAR EM SALVAR!");
      setTipoMensagem("warning");
    } catch (error) {
      setMensagem("Nenhum trabalho encontrado para copiar.");
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
  // SALVAR / ATUALIZAR
  // ==========================

  const salvarTrabalho = async () => {

    if (!atribuicaoSelecionada) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    try {

      await api.post("/trabalhos", {
        atribuicao_id: atribuicaoSelecionada,
        bimestre,
        conteudo: JSON.stringify(topicos),
        instrucoes,
        data_entrega: dataEntrega
      });

      // 🔥 LOG DETALHADO
      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoSelecionada);

      await logAction({
        action: modoEdicao ? "Atualizou trabalho mensal" : "Criou trabalho mensal",
        entidade: "Trabalho",
        turma: atribuicaoAtual?.turma?.nome,
        disciplina: atribuicaoAtual?.disciplina?.nome,
        bimestre,
        detalhes: `Conteúdo: ${topicos.join(", ")} | Entrega: ${dataEntrega}`
      });

      setMensagem(
        modoEdicao
          ? "Trabalho atualizado com sucesso!"
          : "Trabalho salvo com sucesso!"
      );

      setTipoMensagem("success");

      setTimeout(() => {
        limparFormulario();
        setMensagem("");
      }, 1200);

    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar trabalho.");
      setTipoMensagem("error");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0" }}>

      <h2>Lançamento de Trabalho Mensal</h2>

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
        value={dataEntrega}
        onChange={(e) => setDataEntrega(e.target.value)}
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
                onClick={() => copiarTrabalho(a.id)}
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

      <h4>Conteúdo:</h4>

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

      <button onClick={adicionarTopico} style={buttonStyle}>
        + Adicionar Tópico
      </button>

      <h4 style={{ marginTop: "20px" }}>Instruções:</h4>

      <textarea
        style={{ ...inputStyle, height: "100px" }}
        value={instrucoes}
        onChange={(e) => setInstrucoes(e.target.value)}
      />

      <button onClick={salvarTrabalho} style={buttonStyle}>
        {modoEdicao ? "Atualizar Trabalho" : "Salvar Trabalho"}
      </button>

    </div>
  );
}

export default ProfessorTrabalho;