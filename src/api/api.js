// src/api/api.js
import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  baseURL: "http://localhost:9000/api", 
  withCredentials: true,   // 세션/쿠키 필요 없으면 제거해도 됨
  headers: { "Content-Type": "application/json" },
});

// 앱 시작 시 저장된 토큰 복구
const token = localStorage.getItem("ACCESS_TOKEN");
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// 모든 요청에 토큰 보강
api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const t = localStorage.getItem("ACCESS_TOKEN");
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;