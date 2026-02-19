// ==========================================
// CONFIGURAÇÃO DA API
// Responsável por centralizar a URL do backend
// ==========================================

import axios from "axios";

// Ajuste essa URL quando fizer deploy
const api = axios.create({
  baseURL: "http://127.0.0.1:8000"
});

export default api;
