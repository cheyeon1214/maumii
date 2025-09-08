// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,   // 세션/쿠키 필요 없으면 제거해도 됨
  headers: { "Content-Type": "application/json" },
});

export default api;