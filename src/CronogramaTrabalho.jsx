import { useEffect, useState, useRef } from "react";
import api from "./api";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import logoTakaoka from "./assets/logo_takaoka.png";

function CronogramaTrabalho() {

  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [bimestre] = useState(3);
  const [cronograma, setCronograma] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [edicao, setEdicao] = useState({
    data_entrega: "",
    conteudo: "",
    instrucoes: ""
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

  const buscarCronograma = async () => {

    if (!turmaSelecionada) return;

    setMensagemErro("");

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

      console.error(error);
      setCronograma([]);
      setMensagemErro(
        error.response?.data?.detail ||
        "Erro ao gerar o cronograma de trabalhos. Verifique as atribuicoes e tente novamente."
      );

    }

  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // =============================
  // ESCONDER AÇÕES PARA EXPORTAR
  // =============================

  const esconderAcoes = () => {
    document.querySelectorAll(".no-print").forEach(el => {
      el.style.display = "none";
    });
  };

  const mostrarAcoes = () => {
    document.querySelectorAll(".no-print").forEach(el => {
      el.style.display = "";
    });
  };

  const gerarImagem = async () => {

    esconderAcoes();

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    mostrarAcoes();

    const link = document.createElement("a");

    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    link.download = `${turmaNome}_${bimestre}Bimestre_Trabalhos.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const gerarPDF = () => {

    esconderAcoes();

    const element = printRef.current;

    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    const opt = {
      margin: 10,
      filename: `${turmaNome}_${bimestre}Bimestre_Trabalhos.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape"
      }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      mostrarAcoes();
    });

  };

  const editarTrabalho = (item) => {

    setEditandoId(item.id);
    setEdicao({
      data_entrega: item.data_entrega?.split("T")[0] || "",
      conteudo: transformarConteudoEmLista(item.conteudo).join("\n"),
      instrucoes: item.instrucoes || ""
    });

  };

  const cancelarEdicao = () => {

    setEditandoId(null);
    setEdicao({
      data_entrega: "",
      conteudo: "",
      instrucoes: ""
    });

  };

  const salvarEdicao = async (item) => {

    const topicos = edicao.conteudo
      .split("\n")
      .map(topico => topico.trim())
      .filter(Boolean);

    if (!edicao.data_entrega || topicos.length === 0) {
      alert("Preencha a data e ao menos um conteudo.");
      return;
    }

    try {

      const response = await api.post("/trabalhos", {
        atribuicao_id: item.atribuicao?.id,
        bimestre: item.bimestre,
        conteudo: JSON.stringify(topicos),
        instrucoes: edicao.instrucoes,
        data_entrega: edicao.data_entrega
      });

      setCronograma(prev =>
        prev
          .map(trabalho =>
            trabalho.id === item.id ? response.data : trabalho
          )
          .sort((a, b) => new Date(a.data_entrega) - new Date(b.data_entrega))
      );

      cancelarEdicao();

    } catch (error) {

      console.error(error);
      alert(error.response?.data?.detail || "Erro ao editar trabalho.");

    }

  };

  const excluirTrabalho = async (id) => {

    const confirmar = window.confirm("Deseja realmente excluir este trabalho?");

    if (!confirmar) return;

    try {

      await api.delete(`/trabalhos/${id}`);

      setCronograma(prev =>
        prev.filter(item => item.id !== id)
      );

    } catch (error) {

      console.error(error);

      alert("Erro ao excluir trabalho.");

    }

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
    marginRight: "10px"
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
            disabled
          >
            <option value={3}>3º Bimestre</option>
          </select>

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

        <div ref={printRef} style={{ padding: "20px", backgroundColor: "white" }}>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={logoTakaoka}
              alt="Logo"
              style={{ width: "100%", maxWidth: "900px" }}
            />
          </div>

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
                <th style={thStyle} className="no-print">Ações</th>
              </tr>
            </thead>

            <tbody>
              {cronograma.map((item) => {

                const listaTopicos =
                  transformarConteudoEmLista(item.conteudo);

                const corLinha =
                  mapaCores[item.data_entrega] || "white";

                const emEdicao = editandoId === item.id;

                return (
                  <tr key={item.id} style={{ backgroundColor: corLinha }}>
                    <td style={tdStyle}>
                      {emEdicao ? (
                        <input
                          type="date"
                          style={inputStyle}
                          value={edicao.data_entrega}
                          onChange={(e) =>
                            setEdicao(prev => ({
                              ...prev,
                              data_entrega: e.target.value
                            }))
                          }
                        />
                      ) : (
                        formatarData(item.data_entrega)
                      )}
                    </td>

                    <td style={tdStyle}>
                      {item.atribuicao?.professor?.nome || "-"}
                    </td>

                    <td style={tdStyle}>
                      {item.atribuicao?.disciplina?.nome || "-"}
                    </td>

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
                        <div key={i}>• {topico}</div>
                      ))}
                    </td>

                    <td style={tdStyle}>
                      {emEdicao ? (
                        <textarea
                          style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                          value={edicao.instrucoes}
                          onChange={(e) =>
                            setEdicao(prev => ({
                              ...prev,
                              instrucoes: e.target.value
                            }))
                          }
                        />
                      ) : (
                        item.instrucoes
                      )}
                    </td>

                    <td style={tdStyle} className="no-print">

                      {emEdicao ? (
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
                            onClick={() => editarTrabalho(item)}
                            style={{ ...actionButtonStyle, backgroundColor: "#dbeafe", color: "#1e40af" }}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => excluirTrabalho(item.id)}
                            style={{ ...actionButtonStyle, backgroundColor: "#fee2e2", color: "#991b1b" }}
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

export default CronogramaTrabalho;
