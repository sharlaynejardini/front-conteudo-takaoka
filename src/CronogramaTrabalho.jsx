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

  const gerarImagem = async () => {
    const canvas = await html2canvas(printRef.current, { scale: 2 });

    const link = document.createElement("a");
    const turmaNome =
      turmas.find(t => t.id === turmaSelecionada)?.nome || "Turma";

    link.download = `${turmaNome}_Trabalho_${bimestre}Bimestre.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

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
          Cronograma de Trabalhos Mensais
        </h2>

        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <select
            value={turmaSelecionada}
            onChange={(e) => setTurmaSelecionada(e.target.value)}
            style={{ padding: "10px", marginRight: "10px" }}
          >
            <option value="">Selecione a Turma</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>

          <select
            value={bimestre}
            onChange={(e) => setBimestre(Number(e.target.value))}
            style={{ padding: "10px", marginRight: "10px" }}
          >
            <option value={1}>1º Bimestre</option>
            <option value={2}>2º Bimestre</option>
            <option value={3}>3º Bimestre</option>
            <option value={4}>4º Bimestre</option>
          </select>

          <button onClick={buscarCronograma}>
            Buscar
          </button>

          <button onClick={gerarImagem} style={{ marginLeft: "10px" }}>
            Baixar Imagem
          </button>
        </div>

        {/* ÁREA EXPORTÁVEL */}
        <div ref={printRef}>

          {/* 🔵 LOGO GRANDE */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={logoTakaoka}
              alt="Cabeçalho"
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          {/* 🔵 INFORMAÇÕES */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              fontWeight: "bold"
            }}
          >
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
              {cronograma.map(item => (
                <tr key={item.id}>
                  <td style={tdStyle}>
                    {formatarData(item.data_entrega)}
                  </td>

                  <td style={tdStyle}>
                    {item.atribuicao.professor.nome}
                  </td>

                  <td style={tdStyle}>
                    {item.atribuicao.disciplina.nome}
                  </td>

                  <td style={tdStyle}>
                    {item.conteudo.map((c, i) => (
                      <div key={i}>• {c}</div>
                    ))}
                  </td>

                  <td style={tdStyle}>
                    {item.instrucoes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
}

export default CronogramaTrabalho;