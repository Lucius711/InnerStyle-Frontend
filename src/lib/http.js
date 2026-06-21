// Authenticated HTTP layer for the InnerStyle backend.
// - Attaches the Bearer access token.
// - On 401, transparently refreshes once (single-flight) and retries.
// - On refresh failure, clears the session and emits "innerstyle:logout".
// All endpoints return the envelope { success, message, data }.

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const ACCESS_KEY = "innerstyle.accessToken";
const REFRESH_KEY = "innerstyle.refreshToken";

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
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
  const rt = tokenStore.refresh;
  if (!rt) throw new ApiError("No session", 401, null);
  const res = await fetch(`${BASE}/api/user/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
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
    return fetch(`${BASE}${path}`, { method, headers: h, body: rawBody });
  };
  let res = await send();
  if (res.status === 401 && auth && tokenStore.refresh) {
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
