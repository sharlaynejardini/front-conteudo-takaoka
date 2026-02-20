// ==========================================
// CRONOGRAMA TURMA
// Versão final profissional para impressão
// ==========================================

import { useEffect, useState } from "react";
import api from "./api";

function CronogramaTurma() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [cronograma, setCronograma] = useState([]);

  // ==========================================
  // CARREGAR TURMAS
  // ==========================================

  useEffect(() => {
    carregarTurmas();
  }, []);

  const carregarTurmas = async () => {
    try {
      const response = await api.get("/turmas");
      setTurmas(response.data);
    } catch (error) {
      console.error("Erro ao carregar turmas", error);
    }
  };

  // ==========================================
  // CARREGAR CRONOGRAMA DA TURMA
  // ==========================================

  const carregarCronograma = async (turmaId) => {
    if (!turmaId) return;

    try {
      const response = await api.get(`/calendario/${turmaId}`);

      // Ordena por data
      const ordenado = response.data.sort(
        (a, b) => new Date(a.data_avaliacao) - new Date(b.data_avaliacao)
      );

      setCronograma(ordenado);

    } catch (error) {
      console.error("Erro ao carregar cronograma", error);
      setCronograma([]);
    }
  };

  // ==========================================
  // FUNÇÃO PARA IMPRIMIR
  // ==========================================

  const imprimir = () => {
    window.print();
  };

  // ==========================================
  // CONVERTER CONTEÚDO JSON EM LISTA
  // ==========================================

  const renderTopicos = (conteudo) => {
    try {
      const topicos = JSON.parse(conteudo);

      if (Array.isArray(topicos)) {
        return (
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {topicos.map((topico, index) => (
              <li key={index}>{topico}</li>
            ))}
          </ul>
        );
      }

      return conteudo;

    } catch {
      return conteudo;
    }
  };

  return (
    <div>

      {/* ================================
         ÁREA NÃO IMPRESSA
      ================================== */}

      <div className="no-print">

        <h2>Cronograma Completo da Turma</h2>

        <label>Selecione a Turma:</label><br />

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

        {cronograma.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <button onClick={imprimir}>🖨 Imprimir</button>
          </div>
        )}

      </div>

      {/* ================================
         ÁREA QUE SERÁ IMPRESSA
      ================================== */}

      {cronograma.length > 0 && (

        <div className="area-impressao">

          <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
            CRONOGRAMA DE AVALIAÇÕES — {turmas.find(t => t.id === turmaSelecionada)?.nome}
          </h2>

          <table>

            <thead>
              <tr>
                <th>Data</th>
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
                  <td>{renderTopicos(item.conteudo)}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

      {/* ================================
         ESTILO
      ================================== */}

      <style>
        {`

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        th, td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: top;
        }

        th {
          background-color: #f2f2f2;
        }

        @media print {

          /* Esconde tudo */
          body * {
            visibility: hidden;
          }

          /* Mostra apenas o cronograma */
          .area-impressao,
          .area-impressao * {
            visibility: visible;
          }

          .area-impressao {
            position: absolute;
            top: 4.5cm;   /* espaço do logo */
            left: 2cm;
            right: 2cm;
          }

        }

        `}
      </style>

    </div>
  );
}

export default CronogramaTurma;