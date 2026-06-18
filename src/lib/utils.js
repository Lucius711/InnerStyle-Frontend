/** Tiny classNames joiner (no extra dependency). */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

/** Pretty-print a number with thousands separators. */
export function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Extract a filename (with extension) from a model URL. */
export function fileNameFromUrl(url, fallback = "model") {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop() || "";
    return last.split("?")[0] || fallback;
  } catch {
    return fallback;
  }
}

/** Human-readable elapsed time since an ISO timestamp. */
export function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/** Pick the best downloadable model URL from a task's modelUrls map. */
export function pickModelUrl(modelUrls) {
  if (!modelUrls) return null;
  const order = ["glb", "gltf", "fbx", "obj", "usdz", "stl", "3mf"];
  for (const fmt of order) {
    if (modelUrls[fmt]) return { format: fmt, url: modelUrls[fmt] };
  }
  const entries = Object.entries(modelUrls);
  return entries.length ? { format: entries[0][0], url: entries[0][1] } : null;
}
