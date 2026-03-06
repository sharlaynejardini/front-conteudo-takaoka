import { useState } from "react";
import api from "./api";

function TestAPI() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testRoutes = [
    { name: "GET /", endpoint: "/" },
    { name: "GET /conteudos", endpoint: "/conteudos" },
    { name: "GET /trabalhos", endpoint: "/trabalhos" },
    { name: "GET /cronograma", endpoint: "/cronograma" },
    { name: "GET /cronograma-trabalho", endpoint: "/cronograma-trabalho" },
    { name: "GET /admin/logs", endpoint: "/admin/logs" }
  ];

  const testRoute = async (endpoint) => {
    setLoading(true);
    setResult(`Testando ${endpoint}...`);
    
    try {
      const response = await api.get(endpoint);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`ERRO: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Teste de Rotas da API</h1>
      <p>Base URL: <strong>https://novo-serveless-conteudo.vercel.app/</strong></p>
      
      <div style={{ marginTop: "20px" }}>
        {testRoutes.map((route) => (
          <button
            key={route.endpoint}
            onClick={() => testRoute(route.endpoint)}
            disabled={loading}
            style={{
              padding: "10px 15px",
              margin: "5px",
              background: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {route.name}
          </button>
        ))}
      </div>

      <div style={{
        marginTop: "20px",
        padding: "15px",
        background: "#f5f5f5",
        borderRadius: "5px",
        minHeight: "200px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all"
      }}>
        {result || "Clique em um botão para testar uma rota"}
      </div>
    </div>
  );
}

export default TestAPI;
