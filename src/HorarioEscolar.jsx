import { useState } from "react";
import fund2PDF from "./assets/Fund2.pdf";
import v8PDF from "./assets/v8.pdf";

function HorarioEscolar() {
  const [horarioSelecionado, setHorarioSelecionado] = useState("fund2");

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginRight: "10px",
    transition: "all 0.3s ease"
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#059669"
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Horário Escolar</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setHorarioSelecionado("fund2")}
          style={horarioSelecionado === "fund2" ? activeButtonStyle : buttonStyle}
        >
          Fundamental 2
        </button>
        <button
          onClick={() => setHorarioSelecionado("v8")}
          style={horarioSelecionado === "v8" ? activeButtonStyle : buttonStyle}
        >
          V8
        </button>
      </div>

      <div style={{ 
        border: "2px solid #ddd", 
        borderRadius: "8px", 
        overflow: "hidden",
        backgroundColor: "#f5f5f5"
      }}>
        <iframe
          src={horarioSelecionado === "fund2" ? fund2PDF : v8PDF}
          style={{
            width: "100%",
            height: "80vh",
            border: "none"
          }}
          title="Horário Escolar"
        />
      </div>
    </div>
  );
}

export default HorarioEscolar;
