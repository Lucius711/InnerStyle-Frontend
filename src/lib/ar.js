// AR helpers: lazy-load Google's <model-viewer> web component, build QR codes for the
// "scan to view in your room" flow, and convert a GLB into a USDZ blob URL so iOS devices
// get Quick Look AR. Everything is loaded on demand from a CDN so the main bundle stays lean
// and we don't touch the project's npm lockfile.

import { apiBase, authedFetch } from "@/lib/http";

const MODEL_VIEWER_SRC =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
const QRCODE_ESM = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";

let modelViewerPromise = null;
let qrModulePromise = null;

/** Inject the <model-viewer> module once and resolve when the custom element is defined. */
export function loadModelViewer() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.customElements?.get("model-viewer")) return Promise.resolve(true);
  if (modelViewerPromise) return modelViewerPromise;

  modelViewerPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${MODEL_VIEWER_SRC}"]`);
    const onDefined = () =>
      window.customElements.whenDefined("model-viewer").then(() => resolve(true));
    if (existing) {
      onDefined();
      return;
    }
    const s = document.createElement("script");
    s.type = "module";
    s.src = MODEL_VIEWER_SRC;
    s.onload = onDefined;
    s.onerror = () => reject(new Error("model-viewer failed to load"));
    document.head.appendChild(s);
  });
  return modelViewerPromise;
}

/** Generate a QR code (PNG data URL) for a link — used so a phone can open the AR page. */
export async function makeQrDataUrl(text, opts = {}) {
  if (!qrModulePromise) {
    qrModulePromise = import(/* @vite-ignore */ QRCODE_ESM);
  }
  const mod = await qrModulePromise;
  const QR = mod.default || mod;
  return QR.toDataURL(text, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0b12", light: "#ffffff" },
    ...opts,
  });
}

/**
 * Convert a GLB (by URL) into USDZ bytes using three.js' USDZExporter, entirely in the browser.
 * Returns a Uint8Array (the raw .usdz file).
 */
export async function glbToUsdzBytes(glbUrl) {
  const [{ GLTFLoader }, { USDZExporter }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/exporters/USDZExporter.js"),
  ]);
  const gltf = await new GLTFLoader().loadAsync(glbUrl);
  const scene = gltf.scene || gltf.scenes?.[0];
  scene.updateMatrixWorld(true);
  return new USDZExporter().parseAsync(scene);
}

/**
 * Convert a GLB into a USDZ object URL for iOS Quick Look. Returns a blob: URL the caller is
 * responsible for revoking when done. NOTE: iOS AR Quick Look cannot launch from a blob: URL —
 * use {@link ensureUsdzUrl} for the actual AR `ios-src`. This is kept for non-AR/download uses.
 */
export async function glbToUsdzUrl(glbUrl) {
  const arr = await glbToUsdzBytes(glbUrl);
  return URL.createObjectURL(new Blob([arr], { type: "model/vnd.usdz+zip" }));
}

const USDZ_CONTENT_TYPE = "model/vnd.usdz+zip";

/** Proxy URL serving a task's cached USDZ (GET /tasks/:id/model?format=usdz). */
export function usdzProxyUrl(taskId) {
  return `${apiBase}/api/common/3d/tasks/${taskId}/model?format=usdz`;
}

/**
 * Return a real (same-origin, HTTPS via the tunnel) URL to the task's USDZ for iOS Quick Look.
 *
 * iOS Quick Look needs a fetchable .usdz URL — it won't open a blob:. So: probe the backend proxy
 * first (Meshy-hosted or previously-cached USDZ), and if it isn't there, build the USDZ in-browser
 * from the GLB and upload it so the proxy can serve it. Returns the proxy URL, or null on failure
 * (caller can then fall back to a blob: which at least works for the in-page model-viewer).
 */
export async function ensureUsdzUrl(taskId, glbUrl) {
  if (!taskId || !glbUrl) return null;
  const proxyUrl = usdzProxyUrl(taskId);
  try {
    const head = await fetch(proxyUrl, { method: "HEAD" });
    if (head.ok) return proxyUrl;
  } catch {
    // fall through to build + upload
  }
  try {
    const bytes = await glbToUsdzBytes(glbUrl);
    // The USDZ write now requires auth + ownership (finding M1) — send the Bearer token.
    const res = await authedFetch(`/api/common/3d/tasks/${taskId}/usdz`, {
      method: "PUT",
      headers: { "Content-Type": USDZ_CONTENT_TYPE },
      rawBody: bytes,
      auth: true,
    });
    if (!res.ok) return null;
    return proxyUrl;
  } catch {
    return null;
  }
}

/** True on phones/tablets where launching AR (Scene Viewer / Quick Look) makes sense. */
export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const touchCoarse =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches &&
    window.innerWidth < 900;
  return /Android|iPhone|iPad|iPod/i.test(ua) || !!touchCoarse;
}

/** Build the public AR page link a desktop QR should point at. */
export function arPageUrl(taskId) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/ar/${taskId}`;
}
