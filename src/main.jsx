import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

// After a redeploy, a still-open tab holds an old index.html that references old hashed chunks;
// navigating to a lazy route then fails to fetch a now-removed chunk. Vite emits `vite:preloadError`
// for exactly this — reload to pull the fresh index.html + current chunks. Rate-limited to at most
// once per 10s so a genuinely broken/incomplete deploy can't cause a tight reload loop, while a
// normal redeploy still self-heals (even across multiple deploys in a long-lived tab).
window.addEventListener("vite:preloadError", (event) => {
  const last = Number(sessionStorage.getItem("chunkReloadAt") || 0);
  if (Date.now() - last > 10_000) {
    sessionStorage.setItem("chunkReloadAt", String(Date.now()));
    event.preventDefault(); // suppress the default unhandled-rejection noise before we reload
    window.location.reload();
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
