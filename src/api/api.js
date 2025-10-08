// src/api/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "https://localhost:8080"}/api`,
  // withCredentials: true,  // 제거 (쿠키 미사용)
  // headers: { "Content-Type": "application/json" }, // 전역 지정 제거
});

// 토큰 자동 설정
const token = localStorage.getItem("ACCESS_TOKEN");
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
  if (!config.headers?.Authorization) {
    const t = localStorage.getItem("ACCESS_TOKEN");
    if (t) config.headers = { ...(config.headers||{}), Authorization: `Bearer ${t}` };
  }
  return config;
});

export default api;