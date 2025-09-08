// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("./192.168.230.24+2-key.pem"),
      cert: fs.readFileSync("./192.168.230.24+2.pem"),
    },
     proxy: {
      // "/voices": {
      //   target: "http://192.168.210.13:9000",
      //   changeOrigin: true,
      //   secure: false,
      // },
      "/api": {
        target: "http://192.168.0.17:9000",
        changeOrigin: true,
      },
      "/ws": {
        target:"http://192.168.0.17:9000",
        ws: true,
        changeOrigin: true,
      secure: false },
    },
  },
});