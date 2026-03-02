import { useEffect, useState } from "react";
import api from "./api";

function CronogramaTrabalho() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [cronograma, setCronograma] = useState([]);

  // ==========================
  // CARREGAR TURMAS ORDENADAS
  // ==========================

  useEffect(() => {
    async function carregarTurmas() {
      try {
        const response = await api.get("/turmas");

        const ordenadas = [...response.data].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );

        setTurmas(ordenadas);

      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
      }
    }

    carregarTurmas();
  }, []);

  // ==========================
  // BUSCAR CRONOGRAMA
  // ==========================

  const buscarCronograma = async () => {
    if (!turmaSelecionada) return;

    try {
      const response = await api.get("/cronograma-trabalhos", {
        params: { turma_id: turmaSelecionada }
      });

      const ordenado = [...response.data].sort(
        (a, b) => new Date(a.data_entrega) - new Date(b.data_entrega)
      );

      setCronograma(ordenado);

    } catch (error) {
      console.error("Erro ao buscar cronograma:", error);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>

      <h2>Cronograma de Trabalhos</h2>

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

    </div>
  );
}

export default CronogramaTrabalho;