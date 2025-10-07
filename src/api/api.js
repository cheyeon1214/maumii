import axios from "axios";

// 환경 변수 기반 (로컬/배포 모두 자동 인식)
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "https://localhost:8080"}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 저장된 토큰 자동 설정
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// 요청 인터셉터 (토큰 갱신 대응)
api.interceptors.request.use((config) => {
  if (!config.headers["Authorization"]) {
    const t = localStorage.getItem("token");
    if (t) config.headers["Authorization"] = `Bearer ${t}`;
  }
  return config;
});

export default api;