// ==========================================
// API.JS
// Axios com envio automático do token
// ==========================================

import axios from "axios";
import { supabase } from "./supabaseClient";

const api = axios.create({
  baseURL: "https://novo-serveless-conteudo.vercel.app/"
});

// ==========================================
// 🔐 INTERCEPTOR DE REQUISIÇÃO
// ==========================================

api.interceptors.request.use(
  async (config) => {

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erro ao obter sessão:", error);
        return config;
      }

      const token = data.session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Token enviado:", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ Nenhum token encontrado");
      }

    } catch (err) {
      console.error("❌ Erro no interceptor:", err);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// (OPCIONAL) INTERCEPTOR DE RESPOSTA
// ==========================================

api.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (error.response?.status === 401) {
      console.error("🚫 Não autorizado - sessão inválida");
    }

    if (error.response?.status === 403) {
      console.error("🔒 Acesso negado - sem permissão");
    }

    return Promise.reject(error);
  }
);

export default api;