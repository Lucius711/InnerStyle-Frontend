// Typed-ish API client for the InnerStyle backend.
// All endpoints live under /api/common/3d and return the envelope:
//   { success: boolean, message: string, data: T }
// Errors return: { success: false, error: {...}, errors: {...}, message }

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const PREFIX = `${BASE}/api/common/3d`;

/** Error carrying the parsed backend error envelope + field messages. */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.fields = body && body.error ? body.error : null;
  }
}

async function parse(res) {
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const msg =
      (body && (firstFieldMessage(body) || body.message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }
  // Unwrap the success envelope.
  return body && "data" in body ? body.data : body;
}

function firstFieldMessage(body) {
  if (body && body.error && typeof body.error === "object") {
    const vals = Object.values(body.error);
    if (vals.length) return vals[0];
  }
  return null;
}

async function postJson(path, payload) {
  const res = await fetch(`${PREFIX}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

/** Strip undefined / empty-string values so we only send meaningful fields. */
export function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

export const api = {
  imageTo3d: (req) => postJson("/image-to-3d", clean(req)),

  imageTo3dUpload: async (file, options = {}) => {
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(clean(options))) {
      if (Array.isArray(v)) v.forEach((item) => form.append(k, item));
      else form.append(k, String(v));
    }
    const res = await fetch(`${PREFIX}/image-to-3d/upload`, {
      method: "POST",
      body: form,
    });
    return parse(res);
  },

  multiImageTo3d: (req) => postJson("/multi-image-to-3d", clean(req)),
  textTo3d: (req) => postJson("/text-to-3d", clean(req)),
  refine: (req) => postJson("/refine", clean(req)),
  remesh: (req) => postJson("/remesh", clean(req)),
  retexture: (req) => postJson("/retexture", clean(req)),
  rig: (req) => postJson("/rig", clean(req)),
  animate: (req) => postJson("/animate", clean(req)),

  getTask: async (id) => {
    const res = await fetch(`${PREFIX}/tasks/${id}`);
    return parse(res);
  },

  /**
   * URL of the backend's model proxy — streams the model file same-origin so the in-browser
   * 3D viewer isn't blocked by the Meshy CDN's missing CORS headers.
   */
  modelUrl: (id, format = "glb") =>
    `${PREFIX}/tasks/${id}/model?format=${encodeURIComponent(format)}`,

  listTasks: async ({ status, page = 0, size = 12 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("size", String(size));
    params.set("sort", "createdAt,desc");
    const res = await fetch(`${PREFIX}/tasks?${params.toString()}`);
    return parse(res);
  },
};
