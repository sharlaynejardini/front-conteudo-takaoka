import { useEffect, useState } from "react";
import api from "./api";

function CronogramaTrabalho() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [cronograma, setCronograma] = useState([]);

  useEffect(() => {
    async function carregarTurmas() {
      const response = await api.get("/turmas");

      const ordenadas = [...response.data].sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      );

      setTurmas(ordenadas);
    }

    carregarTurmas();
  }, []);

  const buscarCronograma = async () => {
    if (!turmaSelecionada) return;

    const response = await api.get("/cronograma-trabalhos", {
      params: { turma_id: turmaSelecionada }
    });

    const ordenado = [...response.data].sort(
      (a, b) => new Date(a.data_entrega) - new Date(b.data_entrega)
    );

    setCronograma(ordenado);
  };

  const formatarData = (dataISO) =>
    new Date(dataISO).toLocaleDateString("pt-BR");

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>

      <h2>Cronograma de Trabalhos Mensais</h2>

      <select
        value={turmaSelecionada}
        onChange={(e) => setTurmaSelecionada(e.target.value)}
        style={{ padding: "10px", marginBottom: "20px" }}
      >
        <option value="">Selecione a Turma</option>
        {turmas.map(t => (
          <option key={t.id} value={t.id}>{t.nome}</option>
        ))}
      </select>

      <button onClick={buscarCronograma}>
        Buscar
      </button>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#2c4a8a", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Data</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Professor</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Disciplina</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Conteúdo</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Instruções</th>
          </tr>
        </thead>

        <tbody>
          {cronograma.map(item => (
            <tr key={item.id}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {formatarData(item.data_entrega)}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {item.atribuicao.professor.nome}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {item.atribuicao.disciplina.nome}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {item.conteudo.map((c, i) => (
                  <div key={i}>• {c}</div>
                ))}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                {item.instrucoes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default CronogramaTrabalho;