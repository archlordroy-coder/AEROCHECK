import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const backendPort = rootEnv.PORT || rootEnv.API_PORT || "3501";
  const backendBaseUrl =
    rootEnv.API_BASE_URL || `http://127.0.0.1:${backendPort}`;

  return {
    server: {
      host: "0.0.0.0",
      port: Number(rootEnv.FRONTEND_PORT || "3502"),
      proxy: {
        "/api": {
          target: backendBaseUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (_proxyReq, req, _res) => {
              console.log("Sending Request:", req.method, req.url, "->", backendBaseUrl);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log("Received Response:", proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    build: {
      outDir: "dist",
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
        "@shared": path.resolve(__dirname, "../backend/shared"),
      },
    },
  };
});
