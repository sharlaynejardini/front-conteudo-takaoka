import axios from "axios";
import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL
});

// 🔥 cache simples do token
let cachedToken = null;
let lastFetch = 0;

api.interceptors.request.use(async (config) => {

  const now = Date.now();

  // 🔥 evita pegar token toda hora
  if (!cachedToken || now - lastFetch > 60000) {
    const { data } = await supabase.auth.getSession();
    cachedToken = data.session?.access_token;
    lastFetch = now;
  }

  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }

  return config;
});

export default api;
