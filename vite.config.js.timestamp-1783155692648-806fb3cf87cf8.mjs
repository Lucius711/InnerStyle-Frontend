// vite.config.js
import { defineConfig } from "file:///sessions/quirky-admiring-curie/mnt/InnerStyle-Frontend/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/quirky-admiring-curie/mnt/InnerStyle-Frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "node:path";
var __vite_injected_original_dirname = "/sessions/quirky-admiring-curie/mnt/InnerStyle-Frontend";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing libraries into their own vendor chunks so they cache well
        // and don't bloat the initial Landing-page download.
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          motion: ["framer-motion"]
        }
      }
    }
  },
  server: {
    port: 5173,
    // Listen on all interfaces + allow tunnel hosts (ngrok / cloudflared) in dev.
    host: true,
    allowedHosts: [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.io", ".trycloudflare.com"],
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:8085",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvcXVpcmt5LWFkbWlyaW5nLWN1cmllL21udC9Jbm5lclN0eWxlLUZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvc2Vzc2lvbnMvcXVpcmt5LWFkbWlyaW5nLWN1cmllL21udC9Jbm5lclN0eWxlLUZyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9zZXNzaW9ucy9xdWlya3ktYWRtaXJpbmctY3VyaWUvbW50L0lubmVyU3R5bGUtRnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG4vLyBUaGUgYmFja2VuZCAoSW5uZXJTdHlsZS1CYWNrZW5kKSBydW5zIG9uIDoyMjA3IGFuZCBleHBvc2VzIC9hcGkvY29tbW9uLzNkLyouXG4vLyBJbiBkZXYgd2UgcHJveHkgL2FwaSB0byBpdCBzbyB0aGUgYnJvd3NlciBuZXZlciBoaXRzIENPUlMuXG4vLyBJbiBwcm9kdWN0aW9uIHNldCBWSVRFX0FQSV9CQVNFX1VSTCB0byB0aGUgZGVwbG95ZWQgQVBJIG9yaWdpbi5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBTcGxpdCBoZWF2eSwgcmFyZWx5LWNoYW5naW5nIGxpYnJhcmllcyBpbnRvIHRoZWlyIG93biB2ZW5kb3IgY2h1bmtzIHNvIHRoZXkgY2FjaGUgd2VsbFxuICAgICAgICAvLyBhbmQgZG9uJ3QgYmxvYXQgdGhlIGluaXRpYWwgTGFuZGluZy1wYWdlIGRvd25sb2FkLlxuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB0aHJlZTogW1widGhyZWVcIiwgXCJAcmVhY3QtdGhyZWUvZmliZXJcIiwgXCJAcmVhY3QtdGhyZWUvZHJlaVwiXSxcbiAgICAgICAgICBtb3Rpb246IFtcImZyYW1lci1tb3Rpb25cIl0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgLy8gTGlzdGVuIG9uIGFsbCBpbnRlcmZhY2VzICsgYWxsb3cgdHVubmVsIGhvc3RzIChuZ3JvayAvIGNsb3VkZmxhcmVkKSBpbiBkZXYuXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBhbGxvd2VkSG9zdHM6IFtcIi5uZ3Jvay1mcmVlLmRldlwiLCBcIi5uZ3Jvay1mcmVlLmFwcFwiLCBcIi5uZ3Jvay5pb1wiLCBcIi50cnljbG91ZGZsYXJlLmNvbVwiXSxcbiAgICBwcm94eToge1xuICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5WSVRFX0FQSV9QUk9YWV9UQVJHRVQgfHwgXCJodHRwOi8vbG9jYWxob3N0OjgwODVcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsb0JBQW9CO0FBQ3BYLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBO0FBQUEsUUFHTixjQUFjO0FBQUEsVUFDWixPQUFPLENBQUMsU0FBUyxzQkFBc0IsbUJBQW1CO0FBQUEsVUFDMUQsUUFBUSxDQUFDLGVBQWU7QUFBQSxRQUMxQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixNQUFNO0FBQUEsSUFDTixjQUFjLENBQUMsbUJBQW1CLG1CQUFtQixhQUFhLG9CQUFvQjtBQUFBLElBQ3RGLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVEsUUFBUSxJQUFJLHlCQUF5QjtBQUFBLFFBQzdDLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
