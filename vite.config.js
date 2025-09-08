// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  return {
    plugins: [react()],
    server: isDev
      ? {
          host: "0.0.0.0",
          port: 5173,
          https: {
            key: fs.readFileSync("./192.168.230.24+2-key.pem"),
            cert: fs.readFileSync("./192.168.230.24+2.pem"),
          },
          proxy: {
            "/api": {
              target: "http://localhost:9000",
              changeOrigin: true,
            },
            "/ws": {
              target: "http://localhost:9000",
              ws: true,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined, // prod에선 proxy 불필요 (Nginx가 처리)
  };
});