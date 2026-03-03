import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Admin() {

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    carregarLogs();
  }, []);

  async function carregarLogs() {

    const { data, error } = await supabase
      .from("action_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setLogs(data);
  }

  return (
    <div style={{ padding: "40px" }}>

      <h2>Histórico de Ações</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#2f4591", color: "white" }}>
            <th style={{ padding: "10px" }}>Email</th>
            <th style={{ padding: "10px" }}>Ação</th>
            <th style={{ padding: "10px" }}>Turma</th>
            <th style={{ padding: "10px" }}>Disciplina</th>
            <th style={{ padding: "10px" }}>Bimestre</th>
            <th style={{ padding: "10px" }}>Data</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{log.email}</td>
              <td style={{ padding: "10px" }}>{log.action}</td>
              <td style={{ padding: "10px" }}>{log.turma || "-"}</td>
              <td style={{ padding: "10px" }}>{log.disciplina || "-"}</td>
              <td style={{ padding: "10px" }}>
                {log.bimestre ? `${log.bimestre}º` : "-"}
              </td>
              <td style={{ padding: "10px" }}>
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Admin;