// Authenticated HTTP layer for the InnerStyle backend.
// - Attaches the Bearer access token.
// - On 401, transparently refreshes once (single-flight) and retries.
// - On refresh failure, clears the session and emits "innerstyle:logout".
// All endpoints return the envelope { success, message, data }.

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const ACCESS_KEY = "innerstyle.accessToken";
// Legacy key — the refresh token is no longer kept in JS-readable storage (finding M3).
const LEGACY_REFRESH_KEY = "innerstyle.refreshToken";

// The refresh token now lives ONLY in an HttpOnly cookie the browser sends automatically to
// /api/user/auth/*, so XSS can no longer read the long-lived credential. Only the short-lived
// access token is kept in localStorage. All auth requests use credentials:"include" so the
// cookie is stored (from Set-Cookie) and sent back.
export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  set({ accessToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    // Defensive: purge any refresh token left in localStorage by an older build.
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.fields = body && body.error ? body.error : null;
  }
}

function firstFieldMessage(body) {
  if (body && body.error && typeof body.error === "object") {
    const vals = Object.values(body.error);
    if (vals.length) return vals[0];
  }
  return null;
}

export async function parse(res) {
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
  return body && "data" in body ? body.data : body;
}

let refreshing = null;

async function doRefresh() {
  // No body: the HttpOnly refresh cookie is sent automatically via credentials:"include".
  const res = await fetch(`${BASE}/api/user/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await parse(res);
  tokenStore.set(data);
  return data;
}

/**
 * Low-level fetch with Bearer auth + single-flight 401 refresh+retry. Returns the raw Response
 * (use for streaming / multipart). `rawBody` is passed to fetch as-is (string or FormData).
 */
export async function authedFetch(path, { method = "GET", headers = {}, rawBody, auth = false } = {}) {
  const send = async () => {
    const h = { ...headers };
    if (auth && tokenStore.access) h["Authorization"] = `Bearer ${tokenStore.access}`;
    // credentials:"include" so the HttpOnly refresh cookie rides along on auth calls.
    return fetch(`${BASE}${path}`, { method, headers: h, body: rawBody, credentials: "include" });
  };
  let res = await send();
  if (res.status === 401 && auth) {
    try {
      refreshing = refreshing || doRefresh();
      await refreshing;
      refreshing = null;
      res = await send();
    } catch (err) {
      refreshing = null;
      tokenStore.clear();
      window.dispatchEvent(new Event("innerstyle:logout"));
      throw err;
    }
  }
  return res;
}

/** JSON request helper. Options: { method, body, auth, headers }. */
export async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const h = { ...headers };
  if (body !== undefined) h["Content-Type"] = "application/json";
  const res = await authedFetch(path, {
    method,
    headers: h,
    rawBody: body !== undefined ? JSON.stringify(body) : undefined,
    auth,
  });
  return parse(res);
}

export const apiBase = BASE;
