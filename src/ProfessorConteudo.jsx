import { useEffect, useState } from "react";
import api from "./api";
import { logAction } from "./utils/logAction";
import { supabase } from "./supabaseClient";

function ProfessorConteudo() {

  const anoAtual = new Date().getFullYear();

  const semanasProva = {
    1: { inicio: `${anoAtual}-04-13`, fim: `${anoAtual}-04-17` },
    2: { inicio: `${anoAtual}-05-18`, fim: `${anoAtual}-05-20` },
    3: { inicio: `${anoAtual}-09-14`, fim: `${anoAtual}-09-18` },
    4: { inicio: `${anoAtual}-11-13`, fim: `${anoAtual}-11-19` }
  };

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");

  const [atribuicoesSelecionadas, setAtribuicoesSelecionadas] = useState([]);

  const [bimestre, setBimestre] = useState(1);
  const [mostrarCopiar, setMostrarCopiar] = useState(false);

  const [topicos, setTopicos] = useState([""]);
  const [dataAvaliacao, setDataAvaliacao] = useState(semanasProva[1].inicio);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  // 🔥 NOVO
  const [atribuicaoCopiar, setAtribuicaoCopiar] = useState("");

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

  const limparFormulario = () => {
    setTopicos([""]);
    setModoEdicao(false);
  };

  useEffect(() => {
    async function carregar() {

      const response = await api.get("/professores");

      const ordenados = [...response.data].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      );

      setProfessores(ordenados);

      const ADMIN_EMAIL = "sharlayne.fonseca@professor.barueri.br";

      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;

      console.log("EMAIL LOGADO:", email);

      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }

      const professor = ordenados.find(
        p => p.email?.toLowerCase() === email?.toLowerCase()
      );

      console.log("PROFESSOR ENCONTRADO:", professor);

      if (professor) {
        setProfessorSelecionado(professor.id);
        carregarAtribuicoes(professor.id);
      } else {
        console.warn("❌ Nenhum professor com esse email");
      }

    }

    carregar();
  }, []);

  const carregarAtribuicoes = async (id) => {

    try {

      if (!id) {
        setAtribuicoes([]);
        return;
      }

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

      setAtribuicaoSelecionada("");
      setAtribuicoesSelecionadas([]);

      limparFormulario();

    } catch (err) {

      console.error(err);
      setAtribuicoes([]);

    }

  };

  useEffect(() => {
    if (!modoEdicao) {
      setDataAvaliacao(semanasProva[bimestre].inicio);
    }
  }, [bimestre]);

  useEffect(() => {

    if (!atribuicaoSelecionada) return;

    async function buscarConteudo() {

      try {

        const response = await api.get("/conteudos", {
          params: {
            atribuicao_id: atribuicaoSelecionada,
            bimestre
          }
        });

        const salvo = response.data;

        setModoEdicao(true);
        setTopicos(Array.isArray(salvo.conteudo) ? salvo.conteudo : [salvo.conteudo]);
        setDataAvaliacao(salvo.data_avaliacao?.split("T")[0]);

        setMensagem("Você está editando uma avaliação existente.");
        setTipoMensagem("warning");

      } catch {

        setModoEdicao(false);
        setTopicos([""]);
        setMensagem("");

      }

    }

    buscarConteudo();

  }, [atribuicaoSelecionada, bimestre]);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const atribuicao = params.get("atribuicao");
    const bimestreParam = params.get("bimestre");

    if (atribuicao) {
      setAtribuicaoSelecionada(atribuicao);
    }

    if (bimestreParam) {
      setBimestre(Number(bimestreParam));
    }

  }, []);

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

  const toggleTurma = (id) => {

    let novas;

    if (atribuicoesSelecionadas.includes(id)) {
      novas = atribuicoesSelecionadas.filter(a => a !== id);
    } else {
      novas = [...atribuicoesSelecionadas, id];
    }

    setAtribuicoesSelecionadas(novas);
    setAtribuicaoSelecionada(novas[0] || "");

  };

  // 🔥 NOVO - copiar conteúdo
  const copiarConteudo = async () => {
    if (!atribuicaoCopiar) return;

    try {
      const response = await api.get("/conteudos", {
        params: {
          atribuicao_id: atribuicaoCopiar,
          bimestre
        }
      });

      const salvo = response.data;

      setTopicos(
        Array.isArray(salvo.conteudo)
          ? salvo.conteudo
          : [salvo.conteudo]
      );

      setDataAvaliacao(salvo.data_avaliacao?.split("T")[0]);

      setMensagem("Conteúdo copiado com sucesso!");
      setTipoMensagem("success");

    } catch (err) {
      console.error(err);
      setMensagem("Erro ao copiar conteúdo.");
      setTipoMensagem("error");
    }
  };

  const salvarConteudo = async () => {

    if (!atribuicaoSelecionada && atribuicoesSelecionadas.length === 0) {
      setMensagem("Selecione uma turma/disciplina.");
      setTipoMensagem("error");
      return;
    }

    const atribuicoesParaSalvar =
      atribuicoesSelecionadas.length > 0
        ? atribuicoesSelecionadas
        : [atribuicaoSelecionada];

    try {

      for (const atribuicaoId of atribuicoesParaSalvar) {

        await api.post("/conteudos", {
          atribuicao_id: atribuicaoId,
          bimestre,
          conteudo: JSON.stringify(topicos),
          data_avaliacao: dataAvaliacao
        });

      }

      const atribuicaoAtual = atribuicoes.find(a => a.id === atribuicaoSelecionada);

      await logAction({
        action: modoEdicao ? "UPDATE" : "CREATE",
        entidade: "Avaliação",
        turma: atribuicaoAtual?.turma?.nome,
        disciplina: atribuicaoAtual?.disciplina?.nome,
        bimestre,
        detalhes: `Conteúdo: ${topicos.join(", ")} | Data: ${dataAvaliacao}`
      });

      setMensagem("Conteúdo salvo com sucesso!");
      setTipoMensagem("success");

      limparFormulario();
      setAtribuicaoSelecionada("");
      setAtribuicoesSelecionadas([]);
      setDataAvaliacao(semanasProva[bimestre].inicio);

    } catch (err) {

      console.error(err);
      setMensagem(err.response?.data?.detail || "Erro ao salvar conteúdo.");
      setTipoMensagem("error");

    }

  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0" }}>

      <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "20px" }}>
        Lançamento de Avaliação
      </h2>

      {mensagem && <div style={mensagemStyle}>{mensagem}</div>}

      {isAdmin && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          🔥 Modo Administrador
        </p>
      )}

      <select
        style={inputStyle}
        value={professorSelecionado}
        disabled={!isAdmin}
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

      {atribuicoes.length > 0 && (

        <div style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "15px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>

          <strong>Selecione as Turmas</strong>

          {atribuicoes.map(a => (
            <div key={a.id}>
              <label>
                <input
                  type="checkbox"
                  checked={atribuicoesSelecionadas.includes(a.id)}
                  onChange={() => toggleTurma(a.id)}
                />
                {" "}
                {a.turma.nome} - {a.disciplina.nome}
              </label>
            </div>
          ))}

        </div>

      )}

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

      {/* 🔥 NOVO - UI copiar */}
      <button onClick={() => setMostrarCopiar(!mostrarCopiar)} style={buttonStyle}>
        📋 Copiar conteúdo de outra turma
      </button>

      {mostrarCopiar && (
        <div style={{ marginTop: "10px" }}>
          <select
            style={inputStyle}
            value={atribuicaoCopiar}
            onChange={(e) => setAtribuicaoCopiar(e.target.value)}
          >
            <option value="">Selecione a turma para copiar</option>

            {atribuicoes.map(a => (
              <option key={a.id} value={a.id}>
                {a.turma.nome} - {a.disciplina.nome}
              </option>
            ))}
          </select>

          <button onClick={copiarConteudo} style={buttonStyle}>
            Confirmar cópia
          </button>
        </div>
      )}

    </div>
  );
}

export default ProfessorConteudo;
