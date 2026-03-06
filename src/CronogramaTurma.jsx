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

    const response = await api.get("/cronograma", {
      params: {
        turma_id: turmaSelecionada,
        bimestre
      }
    });

    const ordenado = [...response.data].sort(
      (a, b) => new Date(a.data_avaliacao) - new Date(b.data_avaliacao)
    );

    setCronograma(ordenado);
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
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

  const transformarConteudoEmLista = (conteudo) => {
    if (!conteudo) return [];
    if (Array.isArray(conteudo)) return conteudo;

    if (typeof conteudo === "string") {
      try {
        const convertido = JSON.parse(conteudo);
        return Array.isArray(convertido) ? convertido : [convertido];
      } catch {
        return conteudo
          .split(",")
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
    }

    return [String(conteudo)];
  };

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
    ...new Set(
      cronograma.map(item => item.data_avaliacao)
    )
  ].sort((a, b) => new Date(a) - new Date(b));

  datasOrdenadas.forEach(data => {
    mapaCores[data] =
      coresAlternadas[indiceCor % coresAlternadas.length];
    indiceCor++;
  });

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
    padding: "10px 16px",
    backgroundColor: "#2c4a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px"
  };

  const thStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    backgroundColor: "#2c4a8a",
    color: "white"
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    verticalAlign: "top"
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2 style={{ textAlign: "center", color: "#2c4a8a", marginBottom: "30px" }}>
          Cronograma de Avaliações
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

        <div ref={printRef}>

          {/* IMAGEM DO CABEÇALHO */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={logoTakaoka}
              alt="Cabeçalho"
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          {/* TURMA + TÍTULO + BIMESTRE */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              fontWeight: "bold",
              fontSize: "18px"
            }}
          >
            <div>
              Turma: {turmas.find(t => t.id === turmaSelecionada)?.nome}
            </div>

            <div>
              AVALIAÇÃO BIMESTRAL
            </div>

            <div>
              {bimestre}º Bimestre
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Professor</th>
                <th style={thStyle}>Disciplina</th>
                <th style={thStyle}>Conteúdo</th>
              </tr>
            </thead>

            <tbody>
              {cronograma.map((item) => {

                const listaTopicos =
                  transformarConteudoEmLista(item.conteudo);

                const corLinha =
                  mapaCores[item.data_avaliacao] || "white";

                return (
                  <tr
                    key={item.id}
                    style={{ backgroundColor: corLinha }}
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
                        <div key={i}>• {topico}</div>
                      ))}
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

export default CronogramaTurma;