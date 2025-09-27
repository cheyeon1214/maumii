import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // VITE_* 읽기
  const isDev = mode === "development";

  // HTTPS 토글 및 안전한 파일 읽기
  const useHttps = env.VITE_HTTPS === "true";
  const httpsConfig =
    useHttps && env.VITE_SSL_KEY && env.VITE_SSL_CERT && fs.existsSync(env.VITE_SSL_KEY) && fs.existsSync(env.VITE_SSL_CERT)
      ? {
          key: fs.readFileSync(env.VITE_SSL_KEY),
          cert: fs.readFileSync(env.VITE_SSL_CERT),
        }
      : useHttps
      ? true // 파일 경로 없이도 vite 내장 self-signed 사용 가능(브라우저 경고 수용 가능 시)
      : false;

  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:9000";

  return {
    plugins: [react()],
    server: isDev
      ? {
          host: "0.0.0.0",
          port: Number(env.VITE_PORT) || 5173,
          https: httpsConfig,
          strictPort: true,
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
            },
            "/ws": {
              target: proxyTarget,
              ws: true,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined, // prod는 Nginx가 처리
  };
});