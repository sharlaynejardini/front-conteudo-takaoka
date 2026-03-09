import { useEffect, useState } from "react";
import api from "./api";
import { supabase } from "./supabaseClient";

function DebugProfessor() {
  const [emailLogado, setEmailLogado] = useState("");
  const [professores, setProfessores] = useState([]);
  const [professorEncontrado, setProfessorEncontrado] = useState(null);

  useEffect(() => {
    async function investigar() {
      try {
        // 1. Pegar email do usuário logado
        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData.session?.user?.email;
        setEmailLogado(email);
        console.log("📧 Email logado:", email);

        // 2. Buscar todos os professores
        const response = await api.get("/professores");
        setProfessores(response.data);
        console.log("👥 Professores do banco:", response.data);

        // 3. Verificar estrutura de cada professor
        response.data.forEach((prof, index) => {
          console.log(`Professor ${index + 1}:`, {
            id: prof.id,
            nome: prof.nome,
            email: prof.email,
            temEmail: !!prof.email,
            emailTipo: typeof prof.email
          });
        });

        // 4. Tentar encontrar professor
        const encontrado = response.data.find(p => 
          p.email?.toLowerCase() === email?.toLowerCase()
        );
        setProfessorEncontrado(encontrado);
        console.log("🔍 Professor encontrado:", encontrado);

      } catch (error) {
        console.error("❌ Erro:", error);
      }
    }

    investigar();
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🔍 Debug - Professor Auto-Select</h2>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f0f9ff", borderRadius: "8px" }}>
        <h3>Email Logado:</h3>
        <code>{emailLogado || "Carregando..."}</code>
      </div>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f0fdf4", borderRadius: "8px" }}>
        <h3>Professor Encontrado:</h3>
        {professorEncontrado ? (
          <pre>{JSON.stringify(professorEncontrado, null, 2)}</pre>
        ) : (
          <p style={{ color: "red" }}>❌ Nenhum professor encontrado com este email</p>
        )}
      </div>

      <div style={{ padding: "15px", backgroundColor: "#fef3c7", borderRadius: "8px" }}>
        <h3>Todos os Professores ({professores.length}):</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e3a8a", color: "white" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Nome</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Tem Email?</th>
            </tr>
          </thead>
          <tbody>
            {professores.map(prof => (
              <tr key={prof.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{prof.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{prof.nome}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <code>{prof.email || "❌ SEM EMAIL"}</code>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                  {prof.email ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fee2e2", borderRadius: "8px" }}>
        <h3>⚠️ Diagnóstico:</h3>
        <ul>
          <li>Email logado: <strong>{emailLogado || "Não encontrado"}</strong></li>
          <li>Total de professores: <strong>{professores.length}</strong></li>
          <li>Professores com email: <strong>{professores.filter(p => p.email).length}</strong></li>
          <li>Professor encontrado: <strong>{professorEncontrado ? "SIM ✅" : "NÃO ❌"}</strong></li>
        </ul>
        
        {!professorEncontrado && professores.length > 0 && (
          <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#fef2f2", borderRadius: "4px" }}>
            <strong>Possíveis problemas:</strong>
            <ol>
              <li>Tabela 'professores' não tem coluna 'email'</li>
              <li>Email não está cadastrado para este professor</li>
              <li>Email está com formato diferente (maiúsculas/minúsculas/espaços)</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebugProfessor;
