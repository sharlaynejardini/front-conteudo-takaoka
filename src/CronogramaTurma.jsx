import { useEffect, useState, useRef } from "react";
import api from "./api";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logoTakaoka from "./assets/logo_takaoka.png";

function CronogramaTurma() {

  const anoAtual = new Date().getFullYear();

  const semanasProva = {
    1: { inicio: `${anoAtual}-04-13`, fim: `${anoAtual}-04-17` },
    2: { inicio: `${anoAtual}-06-08`, fim: `${anoAtual}-06-16` },
    3: { inicio: `${anoAtual}-09-14`, fim: `${anoAtual}-09-18` },
    4: { inicio: `${anoAtual}-11-13`, fim: `${anoAtual}-11-19` }
  };

  const semanasSimuladoFund2 = {
    2: { inicio: `${anoAtual}-05-20`, fim: `${anoAtual}-05-22` },
    3: { inicio: `${anoAtual}-08-19`, fim: `${anoAtual}-08-21` }
  };

  const turmasObmep2026 = new Set(["6A", "6B", "7A", "7B", "8A", "8B", "8C", "9A", "9B", "9C"]);
  const dataObmep2026 = `${anoAtual}-06-09`;
  const dataRemanejadaObmep2026 = `${anoAtual}-06-16`;

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [tipoAvaliacao, setTipoAvaliacao] = useState("regular");
  const [cronograma, setCronograma] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [edicao, setEdicao] = useState({
    data_avaliacao: "",
    conteudo: ""
  });

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

  const turmaNome =
    turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

  const turmaEhFundamental2 = (nome = "") => /^[6-9]\s*[º°o]?/.test(nome.trim());
  const normalizarTurma = (nome = "") =>
    nome.toUpperCase().replace(/\s/g, "").replace(/[ÂºÂ°º°]/g, "").replace("ANO", "");
  const turmaTemObmep2026 = (nome = "") => turmasObmep2026.has(normalizarTurma(nome));
  const bimestreTemSimuladoFund2 = [2, 3].includes(bimestre);
  const podeEscolherProvaFund2 = bimestreTemSimuladoFund2 && turmaEhFundamental2(turmaNome);
  const mostrarObmepNoCronograma =
    bimestre === 2 &&
    tipoAvaliacao === "regular" &&
    turmaTemObmep2026(turmaNome);

  const getIntervaloAvaliacao = (item) =>
    item?.tipo_avaliacao === "simulado" ? semanasSimuladoFund2[item.bimestre] : semanasProva[item.bimestre];

  const getNomeAvaliacao = (tipo = tipoAvaliacao) =>
    tipo === "simulado" ? "Simulado" : "Prova bimestral";

  const getDescricaoProvaRegular = () =>
    bimestre === 2
      ? "Prova bimestral - 08, 10 a 12/06 ou 16/06"
      : "Prova bimestral";

  const getDescricaoSimulado = () =>
    bimestre === 3 ? "Simulado - 19 a 21/08" : "Simulado - 20 a 22/05";

  useEffect(() => {
    if (!podeEscolherProvaFund2 && tipoAvaliacao === "simulado") {
      setTipoAvaliacao("regular");
    }
  }, [podeEscolherProvaFund2, tipoAvaliacao]);

  const buscarCronograma = async () => {

    if (!turmaSelecionada) return;

    setMensagemErro("");

    try {

      const response = await api.get("/cronograma", {
        params: {
          turma_id: turmaSelecionada,
          bimestre,
          tipo_avaliacao: tipoAvaliacao
        }
      });

      const ordenado = [...response.data].sort(
        (a, b) => new Date(a.data_avaliacao) - new Date(b.data_avaliacao)
      );

      setCronograma(ordenado);

    } catch (error) {

      console.error(error);
      setCronograma([]);
      setMensagemErro(
        error.response?.data?.detail ||
        "Erro ao gerar o cronograma. Verifique as atribuicoes e tente novamente."
      );

    }

  };

  useEffect(() => {
    if (!turmaSelecionada) {
      setCronograma([]);
      setMensagemErro("");
      return;
    }

    buscarCronograma();
  }, [turmaSelecionada, bimestre, tipoAvaliacao]);

  const formatarData = (dataISO) => {

    if (!dataISO) return "";

    const [ano, mes, dia] = dataISO.split("T")[0].split("-");

    return `${dia}/${mes}/${ano}`;
  };

  const formatarDisciplina = (nome) => {
    if (!nome) return "-";
    if (nome === "Português - Produção de Texto") return "Português";
    return nome;
  };

  const cronogramaComEventos = mostrarObmepNoCronograma
    ? [
        ...cronograma,
        {
          id: "__obmep_2026__",
          isEvento: true,
          data_avaliacao: dataObmep2026,
          conteudo: ["Olimpíada Brasileira de Matemática das Escolas Públicas - OBMEP"],
          atribuicao: {
            professor: { nome: "OBMEP" },
            disciplina: { nome: "OBMEP" }
          }
        }
      ].sort((a, b) => new Date(a.data_avaliacao) - new Date(b.data_avaliacao))
    : cronograma;

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

    ctx.fillStyle = "#2c4a8a";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      `${turmaNome} - ${bimestre}º Bimestre - ${getNomeAvaliacao()}`,
      newCanvas.width / 2,
      40
    );

    ctx.drawImage(canvas, padding, padding + 40);

    const link = document.createElement("a");

    link.download = `${turmaNome}_${bimestre}Bimestre_${tipoAvaliacao}.png`;

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

    pdf.save(`${turmaNome}_${bimestre}Bimestre_${tipoAvaliacao}.pdf`);
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

    setEditandoId(item.id);
    setEdicao({
      data_avaliacao: item.data_avaliacao?.split("T")[0] || "",
      conteudo: transformarConteudoEmLista(item.conteudo).join("\n")
    });

  };

  const cancelarEdicao = () => {

    setEditandoId(null);
    setEdicao({
      data_avaliacao: "",
      conteudo: ""
    });

  };

  const salvarEdicao = async (item) => {

    const topicos = edicao.conteudo
      .split("\n")
      .map(topico => topico.trim())
      .filter(Boolean);

    if (!edicao.data_avaliacao || topicos.length === 0) {
      alert("Preencha a data e ao menos um conteÃºdo.");
      return;
    }

    const intervaloBimestre = getIntervaloAvaliacao(item);

    if (
      intervaloBimestre &&
      (edicao.data_avaliacao < intervaloBimestre.inicio ||
        edicao.data_avaliacao > intervaloBimestre.fim)
    ) {
      alert("Selecione uma data dentro do bimestre.");
      return;
    }

    if (
      item.tipo_avaliacao !== "simulado" &&
      bimestre === 2 &&
      edicao.data_avaliacao === dataObmep2026 &&
      turmaTemObmep2026(turmaNome)
    ) {
      alert("09/06/2026 sera OBMEP. Use 16/06/2026 para essa turma.");
      setEdicao(prev => ({
        ...prev,
        data_avaliacao: dataRemanejadaObmep2026
      }));
      return;
    }

    try {

      const response = await api.post("/conteudos", {
        id: item.id,
        atribuicao_id: item.atribuicao?.id,
        bimestre: item.bimestre,
        tipo_avaliacao: item.tipo_avaliacao || "regular",
        conteudo: topicos,
        data_avaliacao: edicao.data_avaliacao
      });

      setCronograma(prev =>
        prev
          .map(avaliacao =>
            avaliacao.id === item.id ? response.data : avaliacao
          )
          .sort((a, b) => new Date(a.data_avaliacao) - new Date(b.data_avaliacao))
      );

      cancelarEdicao();

    } catch (error) {

      console.error(error);
      alert(error.response?.data?.detail || "Erro ao editar avaliaÃ§Ã£o.");

    }

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
    ...new Set(cronogramaComEventos.map(item => item.data_avaliacao))
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
    padding: "14px",
    borderBottom: "2px solid #e0e6ed",
    backgroundColor: "#2c4a8a",
    color: "white",
    fontWeight: "600",
    fontSize: "14px"
  };

  const tdStyle = {
    padding: "14px",
    borderBottom: "1px solid #eaeef3",
    fontSize: "14px",
    color: "#333"
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "14px"
  };

  const actionButtonStyle = {
    border: "none",
    borderRadius: "6px",
    padding: "7px 9px",
    marginRight: "6px",
    cursor: "pointer"
  };

  return (

    <div style={pageStyle}>

      <div style={cardStyle}>

        <h2 style={{ textAlign: "center", color: "#2c4a8a" }}>
          Cronograma de Avaliações
        </h2>

        <div style={{ marginBottom: "30px", textAlign: "center" }}>

          <select style={selectStyle} value={turmaSelecionada}
            onChange={(e) => setTurmaSelecionada(e.target.value)}>

            <option value="">Selecione a Turma</option>

            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}

          </select>

          <select style={selectStyle} value={bimestre}
            onChange={(e) => setBimestre(Number(e.target.value))}>

            <option value={1}>1º Bimestre</option>
            <option value={2}>2º Bimestre</option>
            <option value={3}>3º Bimestre</option>
            <option value={4}>4º Bimestre</option>

          </select>

          {podeEscolherProvaFund2 && (
            <select
              style={selectStyle}
              value={tipoAvaliacao}
              onChange={(e) => setTipoAvaliacao(e.target.value)}
            >
              <option value="regular">{getDescricaoProvaRegular()}</option>
              <option value="simulado">{getDescricaoSimulado()}</option>
            </select>
          )}

          <button style={buttonStyle} onClick={buscarCronograma}>
            Buscar
          </button>

          <button style={buttonStyle} onClick={gerarImagem}>
            Baixar Imagem
          </button>

          <button style={buttonStyle} onClick={gerarPDF}>
            Baixar PDF
          </button>

          {mensagemErro && (
            <div style={{
              margin: "18px auto 0",
              padding: "12px 16px",
              maxWidth: "620px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              fontWeight: "600"
            }}>
              {mensagemErro}
            </div>
          )}

        </div>

        <div ref={printRef}>

          {/* LOGO */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <img src={logoTakaoka} style={{ width: "100%", maxHeight: "120px" }} />
          </div>

          {/* LINHA */}
          <div style={{ borderBottom: "1px solid #cfd8e3", marginBottom: "20px" }} />

          {/* TÍTULO PROFISSIONAL */}
          <div style={{ textAlign: "center", marginBottom: "25px" }}>

            <div style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#2c4a8a",
              marginBottom: "8px"
            }}>
              Cronograma de Avaliações
            </div>

            <div style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1e3a8a"
            }}>
              {turmaNome}
            </div>

            <div style={{
              fontSize: "14px",
              color: "#555"
            }}>
              {bimestre}º Bimestre
            </div>

            {podeEscolherProvaFund2 && (
              <div style={{
                fontSize: "13px",
                color: "#555",
                marginTop: "4px"
              }}>
                {getNomeAvaliacao()}
              </div>
            )}

            <div style={{
              borderBottom: "1px solid #cfd8e3",
              marginTop: "15px"
            }} />

          </div>

          <table style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            borderRadius: "12px",
            overflow: "hidden"
          }}>

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

              {cronogramaComEventos.map((item) => {

                const listaTopicos =
                  transformarConteudoEmLista(item.conteudo);

                const corLinha =
                  mapaCores[item.data_avaliacao] || "white";

                const emEdicao = editandoId === item.id;

                return (

                  <tr key={item.id} style={{ backgroundColor: corLinha }}>

                    <td style={tdStyle}>
                      {emEdicao ? (
                        <input
                          type="date"
                          style={inputStyle}
                          value={edicao.data_avaliacao}
                          min={getIntervaloAvaliacao(item)?.inicio}
                          max={getIntervaloAvaliacao(item)?.fim}
                          onChange={(e) => {
                            const novaData = e.target.value;

                            if (
                              item.tipo_avaliacao !== "simulado" &&
                              bimestre === 2 &&
                              novaData === dataObmep2026 &&
                              turmaTemObmep2026(turmaNome)
                            ) {
                              setEdicao(prev => ({
                                ...prev,
                                data_avaliacao: dataRemanejadaObmep2026
                              }));
                              setMensagemErro("09/06/2026 sera OBMEP. Use 16/06/2026 para essa turma.");
                              return;
                            }

                            setEdicao(prev => ({
                              ...prev,
                              data_avaliacao: novaData
                            }));
                          }}
                        />
                      ) : (
                        formatarData(item.data_avaliacao)
                      )}
                    </td>
                    <td style={tdStyle}>{item.atribuicao?.professor?.nome || "-"}</td>
                    <td style={tdStyle}>{formatarDisciplina(item.atribuicao?.disciplina?.nome)}</td>

                    <td style={tdStyle}>
                      {emEdicao ? (
                        <textarea
                          style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                          value={edicao.conteudo}
                          onChange={(e) =>
                            setEdicao(prev => ({
                              ...prev,
                              conteudo: e.target.value
                            }))
                          }
                        />
                      ) : listaTopicos.map((topico, i) => (
                        <div key={i}>
                          • {item.isEvento ? <strong>{topico}</strong> : topico}
                        </div>
                      ))}
                    </td>

                    <td style={tdStyle} className="no-print">
                      {item.isEvento ? null : emEdicao ? (
                        <>
                          <button
                            style={{ ...actionButtonStyle, backgroundColor: "#16a34a", color: "white" }}
                            onClick={() => salvarEdicao(item)}
                          >
                            Salvar
                          </button>
                          <button
                            style={{ ...actionButtonStyle, backgroundColor: "#e2e8f0", color: "#334155" }}
                            onClick={cancelarEdicao}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={{ ...actionButtonStyle, backgroundColor: "#dbeafe", color: "#1e40af" }}
                            onClick={() => editarAvaliacao(item)}
                          >
                            Editar
                          </button>
                          <button
                            style={{ ...actionButtonStyle, backgroundColor: "#fee2e2", color: "#991b1b" }}
                            onClick={() => excluirAvaliacao(item.id)}
                          >
                            Excluir
                          </button>
                        </>
                      )}
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
