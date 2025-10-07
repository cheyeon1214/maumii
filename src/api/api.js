import axios from "axios";

const api = axios.create({
  baseURL: "/",  // ← http 말고 https
  withCredentials: false,
  // headers: { "Content-Type": "application/json" },
});

const token = localStorage.getItem("ACCESS_TOKEN");
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const t = localStorage.getItem("ACCESS_TOKEN");
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;