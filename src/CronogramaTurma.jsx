import { useEffect, useState, useRef } from "react";
import api from "./api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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

  const gerarPDF = async () => {

    const ocultar = document.querySelectorAll(".no-print");
    ocultar.forEach(el => el.style.display = "none");

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    ocultar.forEach(el => el.style.display = "");

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;

    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", margin, 10, usableWidth, imgHeight);

    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    pdf.save(`${turmaNome}_${bimestre}Bimestre.pdf`);
  };

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

  const turmaNome =
    turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

  return (

    <div style={{ backgroundColor: "#f2f5fa", minHeight: "100vh", padding: "40px" }}>

      <div style={{ maxWidth: "1000px", margin: "auto", background: "white", padding: "30px" }}>

        <h2 style={{ textAlign: "center", color: "#2c4a8a" }}>
          Cronograma de Avaliações
        </h2>

        {/* CONTROLES */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>

          <select value={turmaSelecionada} onChange={(e) => setTurmaSelecionada(e.target.value)}>
            <option value="">Selecione a Turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>

          <select value={bimestre} onChange={(e) => setBimestre(Number(e.target.value))}>
            <option value={1}>1º Bimestre</option>
            <option value={2}>2º Bimestre</option>
            <option value={3}>3º Bimestre</option>
            <option value={4}>4º Bimestre</option>
          </select>

          <button onClick={buscarCronograma}>Buscar</button>
          <button onClick={gerarImagem}>Imagem</button>
          <button onClick={gerarPDF}>PDF</button>

        </div>

        <div ref={printRef}>

          {/* CABEÇALHO INSTITUCIONAL */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

            <div style={{ fontSize: "13px", fontWeight: "600" }}>
              SECRETARIA DE EDUCAÇÃO
            </div>

            <div style={{ textAlign: "center", fontSize: "14px" }}>
              <div><strong>EMEIEF YOJIRO TAKAOKA - ENG.</strong></div>
              <div>Av. Queimada, 505 - Barueri</div>
              <div>Tel: (11) 4192-1369</div>
            </div>

            <img src={logoTakaoka} style={{ height: "50px" }} />

          </div>

          <div style={{ borderBottom: "1px solid #ccc", margin: "15px 0" }} />

          {/* TÍTULO */}
          <div style={{ textAlign: "center", marginBottom: "20px", fontWeight: "bold", fontSize: "18px" }}>
            {turmaNome} - {bimestre}º Bimestre
          </div>

          {/* TABELA ORIGINAL MANTIDA */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>

            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Professor</th>
                <th style={thStyle}>Disciplina</th>
                <th style={thStyle}>Conteúdo</th>
                <th style={thStyle} className="no-print">Ações</th>
              </tr>
            </thead>

            <tbody>

              {cronograma.map((item) => {

                const listaTopicos =
                  transformarConteudoEmLista(item.conteudo);

                const corLinha =
                  mapaCores[item.data_avaliacao] || "white";

                return (

                  <tr key={item.id} style={{ backgroundColor: corLinha }}>

                    <td style={tdStyle}>{formatarData(item.data_avaliacao)}</td>
                    <td style={tdStyle}>{item.atribuicao.professor.nome}</td>
                    <td style={tdStyle}>{item.atribuicao.disciplina.nome}</td>

                    <td style={tdStyle}>
                      {listaTopicos.map((topico, i) => (
                        <div key={i}>• {topico}</div>
                      ))}
                    </td>

                    <td style={tdStyle} className="no-print">
                      <button onClick={() => editarAvaliacao(item)}>✏️</button>
                      <button onClick={() => excluirAvaliacao(item.id)}>🗑</button>
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

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  backgroundColor: "#2c4a8a",
  color: "white"
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ccc"
};

export default CronogramaTurma;