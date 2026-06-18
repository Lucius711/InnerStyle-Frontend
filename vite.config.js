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
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:2207",
        changeOrigin: true,
      },
    },
  },
});
