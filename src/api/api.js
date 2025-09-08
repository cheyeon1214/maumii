// src/api/api.js
import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:9000", //
//   withCredentials: true, // 세션(JSESSIONID) 유지
//   headers: { "Content-Type": "application/json" }, // ★ JSON 고정
//   transformRequest: [
//     (data, headers) => {
//       // JSON만 보내도록 강제 (FormData면 그대로)
//       if (data instanceof FormData) return data;
//       return JSON.stringify(data);
//     },
//   ],
// });
// src/api/api.js
const api = axios.create({
  baseURL: "/",  // ← http 말고 https
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
