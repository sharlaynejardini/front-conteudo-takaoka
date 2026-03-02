import { useEffect, useState } from "react";
import api from "./api";

function ProfessorTrabalho() {

  const [professores, setProfessores] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [atribuicaoSelecionada, setAtribuicaoSelecionada] = useState("");
  const [topicos, setTopicos] = useState([""]);
  const [instrucoes, setInstrucoes] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    boxSizing: "border-box"
  };

  // ==========================
  // CARREGAR PROFESSORES ORDENADOS
  // ==========================

  useEffect(() => {
    async function carregarProfessores() {
      try {
        const response = await api.get("/professores");

        const ordenados = [...response.data].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );

        setProfessores(ordenados);

      } catch (error) {
        console.error("Erro ao carregar professores:", error);
      }
    }

    carregarProfessores();
  }, []);

  // ==========================
  // CARREGAR ATRIBUIÇÕES ORDENADAS
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

    } catch (error) {
      console.error("Erro ao carregar atribuições:", error);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h2>Lançamento de Trabalho Mensal</h2>

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
    </div>
  );
}

export default ProfessorTrabalho;