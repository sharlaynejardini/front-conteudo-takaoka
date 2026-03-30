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

  // ===============================
  // GERAR IMAGEM (ESCONDE AÇÕES)
  // ===============================

  const gerarImagem = async () => {

    const ocultar = document.querySelectorAll(".no-print");

    ocultar.forEach(el => el.style.display = "none");

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    ocultar.forEach(el => el.style.display = "");

    const padding = 50;

    const newCanvas = document.createElement("canvas");

    newCanvas.width = canvas.width + padding * 2;
    newCanvas.height = canvas.height + padding * 2 + 80;

    const ctx = newCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    ctx.fillStyle = "#2c4a8a";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      `${turmaNome} - ${bimestre}º Bimestre`,
      newCanvas.width / 2,
      40
    );

    ctx.drawImage(canvas, padding, padding + 40);

    const link = document.createElement("a");

    link.download = `${turmaNome}_${bimestre}Bimestre.png`;

    link.href = newCanvas.toDataURL("image/png");

    link.click();

  };

  // ===============================
  // EXCLUIR
  // ===============================

  const excluirAvaliacao = async (id) => {

    const confirmar = window.confirm("Deseja realmente excluir esta avaliação?");

    if (!confirmar) return;

    try {

      await api.delete(`/conteudos/${id}`);

      setCronograma(prev =>
        prev.filter(item => item.id !== id)
      );

    } catch (error) {

      console.error(error);

      alert("Erro ao excluir avaliação.");

    }

  };

  // ===============================
  // EDITAR
  // ===============================

  const editarAvaliacao = (item) => {

    const params = new URLSearchParams({
      atribuicao: item.atribuicao.id,
      bimestre: item.bimestre
    });

    window.location.href = `/?${params.toString()}`;

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
    ...new Set(cronograma.map(item => item.data_avaliacao))
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
    padding: "12px 20px",
    backgroundColor: "#2c4a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    fontSize: "14px"
  };

  const thStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#2c4a8a",
    color: "white"
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #ddd"
  };

  const turmaNome =
    turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

  return (

    <div style={pageStyle}>

      <div style={cardStyle}>

        <h2 style={{ textAlign: "center", color: "#2c4a8a" }}>
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

          <img
            src={logoTakaoka}
            alt="Cabeçalho"
            style={{ width: "100%", marginBottom: "20px" }}
          />

          <table style={{ width: "100%", borderCollapse: "collapse" }}>

            <thead>

              {/* ✅ NOVO: TURMA + BIMESTRE */}
              <tr>
                <th colSpan="5" style={{
                  padding: "14px",
                  fontSize: "18px",
                  backgroundColor: "#1e3a8a",
                  color: "white",
                  textAlign: "center"
                }}>
                  {turmaNome} - {bimestre}º Bimestre
                </th>
              </tr>

              <tr>

                <th style={thStyle}>Data</th>
                <th style={thStyle}>Professor</th>
                <th style={thStyle}>Disciplina</th>
                <th style={thStyle}>Conteúdo</th>
                <th style={thStyle} className="no-print">Ações</th>

              </tr>

            </thead>

            <tbody></tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default CronogramaTurma;