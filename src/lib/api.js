// 3D pipeline API client (MeshyAI). All generation endpoints live under /api/common/3d and
// now require authentication (Bearer token) — handled by the shared http layer. The model
// proxy (GET /tasks/:id/model) stays public so the in-browser viewer can stream it.
import { request, authedFetch, parse, apiBase, ApiError } from "@/lib/http";
import {
  checkText,
  checkImageFile,
  MODERATION_TEXT_CODE,
  MODERATION_IMAGE_CODE,
} from "@/lib/moderation";

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

// --- Content moderation guards (block sensitive prompts / images before submitting) ---
function assertText(...texts) {
  if (checkText(...texts).blocked) throw new Error(MODERATION_TEXT_CODE);
}
async function assertImage(file) {
  const r = await checkImageFile(file);
  if (r.blocked) throw new Error(MODERATION_IMAGE_CODE);
}
async function assertImages(files) {
  for (const f of files || []) {
    // eslint-disable-next-line no-await-in-loop
    await assertImage(f);
  }
}

// Moderate an image given by URL: fetch it same-origin through the backend proxy (third-party
// hosts usually lack CORS, which taints the canvas), then run the same nsfwjs check. Fails OPEN.
async function assertImageUrl(url) {
  if (!url) return;
  try {
    const res = await authedFetch(
      `${PATH}/moderation/image-proxy?url=${encodeURIComponent(url)}`,
      { auth: true }
    );
    if (!res.ok) return; // blocked URL / fetch failed -> skip (fail open)
    const blob = await res.blob();
    if ((await checkImageFile(blob)).blocked) throw new Error(MODERATION_IMAGE_CODE);
  } catch (e) {
    if (e && e.message === MODERATION_IMAGE_CODE) throw e;
    // network / CORS / other -> fail open
  }
}

const postJson = (path, payload) =>
  request(`${PATH}${path}`, { method: "POST", body: payload, auth: true });

async function postForm(path, form) {
  const res = await authedFetch(`${PATH}${path}`, { method: "POST", rawBody: form, auth: true });
  return parse(res);
}

export const api = {
  imageTo3d: async (req) => {
    await assertImageUrl(req.imageUrl);
    assertText(req.texturePrompt);
    return postJson("/image-to-3d", clean(req));
  },

  imageTo3dUpload: async (file, options = {}) => {
    await assertImage(file);
    assertText(options.texturePrompt);
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(clean(options))) {
      if (Array.isArray(v)) v.forEach((item) => form.append(k, item));
      else form.append(k, String(v));
    }
    return postForm("/image-to-3d/upload", form);
  },

  multiImageTo3d: async (req) => {
    for (const u of req.imageUrls || []) {
      // eslint-disable-next-line no-await-in-loop
      await assertImageUrl(u);
    }
    assertText(req.texturePrompt);
    return postJson("/multi-image-to-3d", clean(req));
  },

  multiImageTo3dUpload: async (files, options = {}) => {
    await assertImages(files);
    assertText(options.texturePrompt);
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    for (const [k, v] of Object.entries(clean(options))) {
      if (Array.isArray(v)) v.forEach((item) => form.append(k, item));
      else form.append(k, String(v));
    }
    return postForm("/multi-image-to-3d/upload", form);
  },

  textTo3d: (req) => {
    assertText(req.prompt, req.texturePrompt);
    return postJson("/text-to-3d", clean(req));
  },

  // Creative Lab — Chibi figurine (2-stage: prototype -> build)
  figurinePrototype: async (req) => {
    await assertImageUrl(req.imageUrl);
    return postJson("/figurine", clean(req));
  },
  figurinePrototypeUpload: async (file) => {
    await assertImage(file);
    const form = new FormData();
    form.append("file", file);
    return postForm("/figurine/upload", form);
  },
  figurineBuild: (req) => postJson("/figurine/build", clean(req)),

  refine: (req) => {
    assertText(req.texturePrompt);
    return postJson("/refine", clean(req));
  },
  remesh: (req) => postJson("/remesh", clean(req)),
  retexture: (req) => {
    assertText(req.textStylePrompt);
    return postJson("/retexture", clean(req));
  },
  rig: (req) => postJson("/rig", clean(req)),
  animate: (req) => postJson("/animate", clean(req)),

  getTask: (id) => request(`${PATH}/tasks/${id}`, { auth: true }),

  /** Permanently delete one of my tasks. */
  deleteTask: (id) => request(`${PATH}/tasks/${id}`, { method: "DELETE", auth: true }),

  /** Public model proxy URL (streams same-origin so the viewer isn't blocked by CDN CORS). */
  modelUrl: (id, format = "glb") =>
    `${PREFIX}/tasks/${id}/model?format=${encodeURIComponent(format)}`,

  /**
   * Download a model in the chosen format, optionally resized to a physical height (mm) with a
   * bottom/centre origin. Returns a Blob. Resizing is premium + printable-format only (stl/obj);
   * the backend rejects unsupported combinations with a server error code.
   */
  exportModel: async (id, { format, heightMm, origin } = {}) => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (heightMm != null) params.set("heightMm", String(heightMm));
    if (origin) params.set("origin", origin);
    const res = await authedFetch(`${PATH}/tasks/${id}/model/export?${params.toString()}`, {
      auth: true,
    });
    if (!res.ok) {
      return parse(res); // throws ApiError carrying the server message code
    }
    return res.blob();
  },

  listTasks: ({ status, page = 0, size = 12 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("size", String(size));
    params.set("sort", "createdAt,desc");
    return request(`${PATH}/tasks?${params.toString()}`, { auth: true });
  },
};
