import axios from "axios";

const CORRETOR_API_BASE_URL =
  import.meta.env.VITE_CORRETOR_API_BASE_URL || "/corretor-api";

const corretorApi = axios.create({
  baseURL: CORRETOR_API_BASE_URL
});

export default corretorApi;
