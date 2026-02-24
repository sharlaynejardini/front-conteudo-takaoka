// ==========================================
// CONFIGURAÇÃO DA API
// Responsável por centralizar a URL do backend
// ==========================================

import axios from "axios";

// Ajuste essa URL quando fizer deploy
const api = axios.create({
  baseURL: "https://back-conteudo-takaoka.onrender.com/"
});

export default api;
