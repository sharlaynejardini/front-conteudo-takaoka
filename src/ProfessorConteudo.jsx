// ==========================================
// PROFESSORCONTEUDO.JSX
// Versão final com reconstrução perfeita dos tópicos
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
  // RECONSTRUÇÃO PERFEITA
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

      // 🔥 Se já vier array
      if (Array.isArray(salvo.conteudo)) {
        listaFinal = salvo.conteudo;
      }

      // 🔥 Se vier string
      else if (typeof salvo.conteudo === "string") {

        try {
          const convertido = JSON.parse(salvo.conteudo);

          if (Array.isArray(convertido)) {
            listaFinal = convertido;
          } else {
            listaFinal = [salvo.conteudo];
          }

        } catch {
          // Se não for JSON válido, manter exatamente como está
          listaFinal = [salvo.conteudo];
        }
      }

      else {
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
      setModoEdicao(false);
      setTopicos([""]);

    } catch {
      setMensagem("Erro ao salvar conteúdo.");
      setTipoMensagem("error");
    }
  };

  // ==========================
  // RENDER
  // ==========================

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto" }}>

      <h2>Painel do Professor</h2>

      {mensagem && (
        <div style={{
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          backgroundColor:
            tipoMensagem === "success"
              ? "#d4edda"
              : tipoMensagem === "warning"
              ? "#fff3cd"
              : "#f8d7da"
        }}>
          {mensagem}
        </div>
      )}

      <select
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

      <input
        type="date"
        value={dataAvaliacao}
        onChange={(e) => setDataAvaliacao(e.target.value)}
      />

      <br /><br />

      {topicos.map((t, i) => (
        <input
          key={i}
          type="text"
          value={t}
          onChange={(e) => atualizarTopico(i, e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />
      ))}

      <button onClick={adicionarTopico}>+ Adicionar</button>

      <br /><br />

      <button onClick={salvarConteudo}>
        {modoEdicao ? "Atualizar Conteúdo" : "Salvar Conteúdo"}
      </button>

    </div>
  );
}

export default ProfessorConteudo;