// ==========================================
// API.JS
// Axios com envio automático do token
// ==========================================

import axios from "axios";
import { supabase } from "./supabaseClient";

const api = axios.create({
  baseURL: "https://novo-serveless-conteudo.vercel.app/"
});

// 🔐 Enviar token automaticamente
api.interceptors.request.use(async (config) => {

  const { data } = await supabase.auth.getSession();

  if (data.session) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  return config;
});

export default api;

