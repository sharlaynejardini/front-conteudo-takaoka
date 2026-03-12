import { useEffect, useState, useRef } from "react";
import api from "./api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoTakaoka from "./assets/logo_takaoka.png";

function CronogramaTrabalho() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [cronograma, setCronograma] = useState([]);

  const printRef = useRef();

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

  const gerarPDF = () => {

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    // LOGO DA ESCOLA
    const img = new Image();
    img.src = logoTakaoka;

    doc.addImage(img, "PNG", 10, 8, 40, 15);

    doc.setFontSize(16);
    doc.text("TRABALHO MENSAL", 148, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Turma: ${turmaNome}`, 14, 25);
    doc.text(`${bimestre}º Bimestre`, 280, 25, { align: "right" });

    const rows = cronograma.map((item) => {

      const listaTopicos =
        transformarConteudoEmLista(item.conteudo);

      return [
        formatarData(item.data_entrega),
        item.atribuicao?.professor?.nome || "",
        item.atribuicao?.disciplina?.nome || "",
        listaTopicos.join("\n"),
        item.instrucoes || ""
      ];
    });

    autoTable(doc, {

      startY: 30,

      head: [[
        "Data",
        "Professor",
        "Disciplina",
        "Conteúdo",
        "Instruções"
      ]],

      body: rows,

      styles: {
        fontSize: 10,
        cellPadding: 4,
        valign: "top",
        overflow: "linebreak"
      },

      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        halign: "center"
      },

      theme: "grid",

      tableWidth: "auto",
      margin: { left: 14, right: 14 },

      columnStyles: {
        0: { halign: "center" },
        1: { halign: "left" },
        2: { halign: "center" },
        3: { halign: "left" },
        4: { halign: "left" }
      }

    });

    doc.save(`cronograma_${turmaNome}_${bimestre}.pdf`);
  };

  const pageStyle = {
    backgroundColor: "#f2f5fa",
    minHeight: "100vh",
    padding: "50px 20px"
  };

  const cardStyle = {
    maxWidth: "1200px",
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
    marginRight: "10px"
  };

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

          <button style={buttonStyle} onClick={gerarPDF}>
            Baixar PDF
          </button>
        </div>

      </div>
    </div>
  );
}

export default CronogramaTrabalho;