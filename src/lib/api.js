// 3D pipeline API client (MeshyAI). All generation endpoints live under /api/common/3d and
// now require authentication (Bearer token) — handled by the shared http layer. The model
// proxy (GET /tasks/:id/model) stays public so the in-browser viewer can stream it.
import { request, authedFetch, parse, apiBase, ApiError } from "@/lib/http";

export { ApiError };

const PREFIX = `${apiBase}/api/common/3d`;
const PATH = "/api/common/3d";

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

const postJson = (path, payload) =>
  request(`${PATH}${path}`, { method: "POST", body: payload, auth: true });

async function postForm(path, form) {
  const res = await authedFetch(`${PATH}${path}`, { method: "POST", rawBody: form, auth: true });
  return parse(res);
}

export const api = {
  imageTo3d: (req) => postJson("/image-to-3d", clean(req)),

  imageTo3dUpload: (file, options = {}) => {
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(clean(options))) {
      if (Array.isArray(v)) v.forEach((item) => form.append(k, item));
      else form.append(k, String(v));
    }
    return postForm("/image-to-3d/upload", form);
  },

  multiImageTo3d: (req) => postJson("/multi-image-to-3d", clean(req)),

  multiImageTo3dUpload: (files, options = {}) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    for (const [k, v] of Object.entries(clean(options))) {
      if (Array.isArray(v)) v.forEach((item) => form.append(k, item));
      else form.append(k, String(v));
    }
    return postForm("/multi-image-to-3d/upload", form);
  },

  textTo3d: (req) => postJson("/text-to-3d", clean(req)),

  // Creative Lab — Chibi figurine (2-stage: prototype -> build)
  figurinePrototype: (req) => postJson("/figurine", clean(req)),
  figurinePrototypeUpload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return postForm("/figurine/upload", form);
  },
  figurineBuild: (req) => postJson("/figurine/build", clean(req)),

  refine: (req) => postJson("/refine", clean(req)),
  remesh: (req) => postJson("/remesh", clean(req)),
  retexture: (req) => postJson("/retexture", clean(req)),
  rig: (req) => postJson("/rig", clean(req)),
  animate: (req) => postJson("/animate", clean(req)),

  getTask: (id) => request(`${PATH}/tasks/${id}`, { auth: true }),

  /** Public model proxy URL (streams same-origin so the viewer isn't blocked by CDN CORS). */
  modelUrl: (id, format = "glb") =>
    `${PREFIX}/tasks/${id}/model?format=${encodeURIComponent(format)}`,

  listTasks: ({ status, page = 0, size = 12 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("size", String(size));
    params.set("sort", "createdAt,desc");
    return request(`${PATH}/tasks?${params.toString()}`, { auth: true });
  },
};
