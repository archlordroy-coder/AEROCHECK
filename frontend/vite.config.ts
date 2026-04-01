import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      // Proxy API requests directly to backend
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
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
});
