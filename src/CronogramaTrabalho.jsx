import { useEffect, useState, useRef } from "react";
import api from "./api";
import html2canvas from "html2canvas";
import logoTakaoka from "./assets/logo_takaoka.png";

function CronogramaTrabalho() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [cronograma, setCronograma] = useState([]);

  const printRef = useRef();

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
  // BUSCAR TRABALHOS
  // ==========================

  const buscarCronograma = async () => {
    if (!turmaSelecionada) return;

    try {
      const response = await api.get("/cronograma-trabalhos", {
        params: {
          turma_id: turmaSelecionada,
          bimestre
        }
      });

      const ordenado = [...response.data].sort(
        (a, b) => new Date(a.data_entrega) - new Date(b.data_entrega)
      );

      setCronograma(ordenado);

    } catch (error) {
      console.error("Erro ao buscar trabalhos:", error);
      setCronograma([]);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const gerarImagem = async () => {
    const canvas = await html2canvas(printRef.current, { 
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false
    });

    const padding = 50;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width + (padding * 2);
    newCanvas.height = canvas.height + (padding * 2);
    
    const ctx = newCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvas, padding, padding);

    const link = document.createElement("a");
    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    link.download = `${turmaNome}_${bimestre}Bimestre_Trabalhos.png`;
    link.href = newCanvas.toDataURL("image/png");
    link.click();
  };

  const transformarConteudoEmLista = (conteudo) => {
    if (!conteudo) return [];
    if (Array.isArray(conteudo)) return conteudo;

    try {
      const convertido = JSON.parse(conteudo);
      return Array.isArray(convertido) ? convertido : [convertido];
    } catch {
      return [conteudo];
    }
  };

  // ==========================
  // CORES POR DATA
  // ==========================

  const coresAlternadas = [
    "#e3f2fd",
    "#fce4ec",
    "#e8f5e9",
    "#fff3e0",
    "#ede7f6"
  ];

  const mapaCores = {};
  let indiceCor = 0;

  const datasOrdenadas = [
    ...new Set(cronograma.map(item => item.data_entrega))
  ].sort((a, b) => new Date(a) - new Date(b));

  datasOrdenadas.forEach(data => {
    mapaCores[data] =
      coresAlternadas[indiceCor % coresAlternadas.length];
    indiceCor++;
  });

  // ==========================
  // ESTILOS
  // ==========================

  const pageStyle = {
    backgroundColor: "#f2f5fa",
    minHeight: "100vh",
    padding: "50px 20px"
  };

  const cardStyle = {
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.08)"
  };

  const selectStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d0d7e2",
    marginRight: "10px",
    minWidth: "180px"
  };

  const buttonStyle = {
    padding: "12px 20px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s"
  };

  const thStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    backgroundColor: "#1e3a8a",
    color: "white"
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    verticalAlign: "top"
  };

  // ==========================
  // RENDER
  // ==========================

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2 style={{ textAlign: "center", color: "#1e3a8a", marginBottom: "30px" }}>
          Cronograma de Trabalhos Mensais
        </h2>

        <div style={{ marginBottom: "30px", textAlign: "center" }}>

          <select
            style={selectStyle}
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
            style={selectStyle}
            value={bimestre}
            onChange={(e) => setBimestre(Number(e.target.value))}
          >
            <option value={1}>1º Bimestre</option>
            <option value={2}>2º Bimestre</option>
            <option value={3}>3º Bimestre</option>
            <option value={4}>4º Bimestre</option>
          </select>

          <button style={buttonStyle} onClick={buscarCronograma}>
            Buscar
          </button>

          <button style={buttonStyle} onClick={gerarImagem}>
            Baixar Imagem
          </button>
        </div>

        <div ref={printRef} style={{ padding: "20px", backgroundColor: "white" }}>

          {/* LOGO GRANDE */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={logoTakaoka}
              alt="Logo"
              style={{ width: "100%", maxWidth: "900px" }}
            />
          </div>

          {/* TÍTULO DA IMAGEM */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontWeight: "bold"
          }}>
            <div>
              Turma: {turmas.find(t => t.id === turmaSelecionada)?.nome}
            </div>
            <div>TRABALHO MENSAL</div>
            <div>{bimestre}º Bimestre</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Data Entrega</th>
                <th style={thStyle}>Professor</th>
                <th style={thStyle}>Disciplina</th>
                <th style={thStyle}>Conteúdo</th>
                <th style={thStyle}>Instruções</th>
              </tr>
            </thead>

            <tbody>
              {cronograma.map((item) => {

                const listaTopicos =
                  transformarConteudoEmLista(item.conteudo);

                const corLinha =
                  mapaCores[item.data_entrega] || "white";

                return (
                  <tr
                    key={item.id}
                    style={{ backgroundColor: corLinha }}
                  >
                    <td style={tdStyle}>
                      {formatarData(item.data_entrega)}
                    </td>

                    <td style={tdStyle}>
                      {item.atribuicao?.professor?.nome}
                    </td>

                    <td style={tdStyle}>
                      {item.atribuicao?.disciplina?.nome}
                    </td>

                    <td style={tdStyle}>
                      {listaTopicos.map((topico, i) => (
                        <div key={i}>• {topico}</div>
                      ))}
                    </td>

                    <td style={tdStyle}>
                      {item.instrucoes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
}

export default CronogramaTrabalho;