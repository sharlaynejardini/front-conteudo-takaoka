import { useEffect, useState, useRef } from "react";
import api from "./api";
import html2canvas from "html2canvas";
import logoTakaoka from "./assets/logo_takaoka.png";

function CronogramaTurma() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [cronograma, setCronograma] = useState([]);

  const printRef = useRef();

  useEffect(() => {
    async function carregarTurmas() {
      try {
        const response = await api.get("/turmas");
        setTurmas(response.data);
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
      }
    }
    carregarTurmas();
  }, []);

  const buscarCronograma = async () => {
    if (!turmaSelecionada) return;

    try {
      const response = await api.get("/cronograma", {
        params: {
          turma_id: turmaSelecionada,
          bimestre: bimestre
        }
      });

      setCronograma(response.data);

    } catch (error) {
      console.error("Erro ao buscar cronograma:", error);
      setCronograma([]);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const gerarImagem = async () => {
    const canvas = await html2canvas(printRef.current, { scale: 2 });

    const link = document.createElement("a");
    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    link.download = `${turmaNome}_${bimestre}Bimestre.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // 🔥 FUNÇÃO QUE CONVERTE O CONTEÚDO EM LISTA
  const transformarConteudoEmLista = (conteudo) => {

    if (!conteudo) return [];

    try {
      const convertido = JSON.parse(conteudo);

      if (Array.isArray(convertido)) {
        return convertido;
      }

      return [convertido];

    } catch {
      // Caso esteja salvo como texto simples separado por vírgula
      return conteudo
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>

      <h2>Cronograma de Avaliações</h2>

      <div style={{ marginBottom: "20px" }}>
        <select
          value={turmaSelecionada}
          onChange={(e) => setTurmaSelecionada(e.target.value)}
        >
          <option value="">Selecione a Turma</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>

        <select
          value={bimestre}
          onChange={(e) => setBimestre(Number(e.target.value))}
          style={{ marginLeft: "10px" }}
        >
          <option value={1}>1º Bimestre</option>
          <option value={2}>2º Bimestre</option>
          <option value={3}>3º Bimestre</option>
          <option value={4}>4º Bimestre</option>
        </select>

        <button onClick={buscarCronograma} style={{ marginLeft: "10px" }}>
          Buscar
        </button>

        <button onClick={gerarImagem} style={{ marginLeft: "10px" }}>
          Baixar Imagem
        </button>
      </div>

      <div
        ref={printRef}
        style={{ backgroundColor: "white", padding: "40px" }}
      >

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src={logoTakaoka}
            alt="Logo"
            style={{ maxWidth: "100%" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px"
          }}
        >
          <strong>
            Turma: {turmas.find(t => t.id === turmaSelecionada)?.nome}
          </strong>
          <strong>{bimestre}º Bimestre</strong>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px"
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#2c4a8a", color: "white" }}>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Professor</th>
              <th style={thStyle}>Disciplina</th>
              <th style={thStyle}>Conteúdo</th>
            </tr>
          </thead>

          <tbody>
            {cronograma.map((item, index) => {

              const listaTopicos = transformarConteudoEmLista(item.conteudo);

              return (
                <tr
                  key={item.id}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? "#f2f2f2" : "white"
                  }}
                >
                  <td style={tdStyle}>
                    {formatarData(item.data_avaliacao)}
                  </td>

                  <td style={tdStyle}>
                    {item.atribuicao?.professor?.nome}
                  </td>

                  <td style={tdStyle}>
                    {item.atribuicao?.disciplina?.nome}
                  </td>

                  <td style={tdStyle}>
                    {listaTopicos.map((topico, i) => (
                      <div key={i}>- {topico}</div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left"
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  verticalAlign: "top"
};

export default CronogramaTurma;