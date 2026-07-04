import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// The backend (InnerStyle-Backend) runs on :2207 and exposes /api/common/3d/*.
// In dev we proxy /api to it so the browser never hits CORS.
// In production set VITE_API_BASE_URL to the deployed API origin.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing libraries into their own vendor chunks so they cache well
        // and don't bloat the initial Landing-page download.
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Listen on all interfaces + allow tunnel hosts (ngrok / cloudflared) in dev.
    host: true,
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.io", ".trycloudflare.com"],
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8085",
        changeOrigin: true,
      },
    },
  },
});
