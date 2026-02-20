// ==========================================
// CRONOGRAMA TURMA
// Página da coordenação
// ==========================================

import { useEffect, useState } from "react";
import api from "./api";

function CronogramaTurma() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [cronograma, setCronograma] = useState([]);

  // ===============================
  // Carregar todas as turmas
  // ===============================

  useEffect(() => {
    carregarTurmas();
  }, []);

  const carregarTurmas = async () => {
    try {
      const response = await api.get("/turmas");
      setTurmas(response.data);
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
    }
  };

  // ===============================
  // Carregar cronograma da turma
  // ===============================

  const carregarCronograma = async (turmaId) => {
    if (!turmaId) return;

    try {
      const response = await api.get(`/calendario/${turmaId}`);

      const ordenado = response.data.sort(
        (a, b) => new Date(a.data_avaliacao) - new Date(b.data_avaliacao)
      );

      setCronograma(ordenado);

    } catch (error) {
      console.error("Erro ao carregar cronograma:", error);
      setCronograma([]);
    }
  };

  // ===============================
  // Função imprimir
  // ===============================

  const imprimir = () => {
    window.print();
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>Cronograma Completo da Turma</h2>

      {/* Seleção da Turma */}
      <div>
        <label>Selecione a Turma:</label>
        <select
          value={turmaSelecionada}
          onChange={(e) => {
            setTurmaSelecionada(e.target.value);
            carregarCronograma(e.target.value);
          }}
        >
          <option value="">Selecione</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Botão Imprimir */}
      {cronograma.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={imprimir}>🖨 Imprimir</button>
        </div>
      )}

      {/* Tabela */}
      {cronograma.length > 0 && (
        <table
          border="1"
          cellPadding="8"
          style={{
            marginTop: "20px",
            borderCollapse: "collapse",
            width: "100%"
          }}
        >
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th>Data da Avaliação</th>
              <th>Professor</th>
              <th>Disciplina</th>
              <th>Bimestre</th>
              <th>Conteúdo</th>
            </tr>
          </thead>
          <tbody>
            {cronograma.map((item) => (
              <tr key={item.id}>
                <td>
                  {new Date(item.data_avaliacao).toLocaleDateString("pt-BR")}
                </td>
                <td>{item.atribuicao.professor.nome}</td>
                <td>{item.atribuicao.disciplina.nome}</td>
                <td>{item.bimestre}º</td>
                <td>{item.conteudo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CronogramaTurma;