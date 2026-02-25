// ==========================================
// CONFIGURAÇÃO DA API
// Responsável por centralizar a URL do backend
// ==========================================

import axios from "axios";

// Ajuste essa URL quando fizer deploy
const api = axios.create({
  baseURL: "https://novo-serveless-conteudo.vercel.app/"
});

export default api;
