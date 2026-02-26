import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Admin() {

  const [logins, setLogins] = useState([]);
  const [actions, setActions] = useState([]);

  useEffect(() => {

    async function carregar() {

      const { data: loginData } = await supabase
        .from("login_logs")
        .select("*")
        .order("login_at", { ascending: false });

      const { data: actionData } = await supabase
        .from("action_logs")
        .select("*")
        .order("created_at", { ascending: false });

      setLogins(loginData || []);
      setActions(actionData || []);
    }

    carregar();

  }, []);

  return (
    <div>
      <h2>Painel Admin</h2>

      <h3>Histórico de Logins</h3>
      <ul>
        {logins.map(log => (
          <li key={log.id}>
            {log.email} - {new Date(log.login_at).toLocaleString()}
          </li>
        ))}
      </ul>

      <h3>Histórico de Ações</h3>
      <ul>
        {actions.map(log => (
          <li key={log.id}>
            {log.email} - {log.action} - {new Date(log.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;