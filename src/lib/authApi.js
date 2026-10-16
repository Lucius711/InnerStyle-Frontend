// Auth + wallet API calls. Tokens are managed by http.js.
import { request, authedFetch, tokenStore } from "@/lib/http";

export const authApi = {
  logout: async () => {
    // The refresh token rides in the HttpOnly cookie (finding M3); the backend reads + clears it.
    try {
      await request("/api/user/auth/logout", {
        method: "POST",
        auth: true,
      });
    } finally {
      tokenStore.clear();
    }
  },

  // Role-aware profile: USER accounts resolve via /user/account/me; staff-only
  // accounts fall back to /staff/account/me (the user path requires ROLE_USER).
  me: async () => {
    try {
      return await request("/api/user/account/me", { auth: true });
    } catch (err) {
      if (err && err.status === 403) {
        return request("/api/staff/account/me", { auth: true });
      }
      throw err;
    }
  },

  // Accept the Terms & Policies version the user was shown (returns the updated profile).
  acceptPolicy: (version) =>
    request("/api/user/account/policy-acceptance", { method: "POST", body: { version }, auth: true }),
};

export const printApi = {
  // Returns { orderId, amount, payUrl } — the client then redirects to payUrl.
  // `payload` carries taskId, provider, recipient + shipping address (see ShippingDialog).
  placeOrder: (payload) =>
    request("/api/user/print/orders", {
      method: "POST",
      auth: true,
      body: payload,
    }),

  list: ({ page = 0, size = 10 } = {}) =>
    request(`/api/user/print/orders?page=${page}&size=${size}&sort=createdAt,desc`, { auth: true }),

  // Continue paying a PENDING order: returns the same shape as placeOrder, reusing its payOS link.
  resumePayment: (id) =>
    request(`/api/user/print/orders/${id}/pay`, { method: "POST", auth: true }),

  // Shopee-style tracking: { status, carrier, trackingCode, events: [{ status, note, at }] }
  tracking: (id) => request(`/api/user/print/orders/${id}/tracking`, { auth: true }),
};

// Staff order-fulfilment API (requires ROLE_STAFF).
export const staffApi = {
  me: () => request("/api/staff/account/me", { auth: true }),

  listOrders: ({ page = 0, size = 20, status } = {}) =>
    request(
      `/api/staff/orders?page=${page}&size=${size}&sort=createdAt,desc` +
        (status ? `&status=${status}` : ""),
      { auth: true }
    ),

  getOrder: (id) => request(`/api/staff/orders/${id}`, { auth: true }),

  // `update` is a status string, or { status, note, carrier, trackingCode } to post a tracking update
  updateStatus: (id, update) =>
    request(`/api/staff/orders/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: typeof update === "string" ? { status: update } : update,
    }),

  tracking: (id) => request(`/api/staff/orders/${id}/tracking`, { auth: true }),

  // Analyse the order model's 3D-print readiness (watertight / holes / non-manifold).
  // pair=true targets the Couple Set's second model (same for repair/revert).
  printability: (id, pair = false) =>
    request(`/api/staff/orders/${id}/printability${pair ? "?pair=true" : ""}`, { auth: true }),

  // Auto-repair the order model into a watertight, printable mesh, saved in place (the download
  // then serves the repaired model). Returns { before, after, task }.
  repairModel: (id, pair = false) =>
    request(`/api/staff/orders/${id}/repair${pair ? "?pair=true" : ""}`, { method: "POST", auth: true }),

  // Revert the order model back to its pre-repair backup, if one exists. Returns { before, after, task }.
  revertModel: (id, pair = false) =>
    request(`/api/staff/orders/${id}/revert${pair ? "?pair=true" : ""}`, { method: "POST", auth: true }),

  // Download the customer's 3D model file as a Blob (Bearer-authenticated).
  // pair=true downloads the Couple Set's second model.
  downloadModel: async (id, format = "glb", pair = false) => {
    const res = await authedFetch(`/api/staff/orders/${id}/model?format=${format}${pair ? "&pair=true" : ""}`, {
      auth: true,
    });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = /filename="?([^"]+)"?/.exec(disposition);
    const filename = match ? match[1] : `model.${format}`;
    return { blob: await res.blob(), filename };
  },
};

// Admin traffic stats (requires ROLE_ADMIN). Returns [{ date: "YYYY-MM-DD", visits }], oldest first.
export const adminApi = {
  dailyVisits: (days = 14) => request(`/api/admin/visits/daily?days=${days}`, { auth: true }),
  activeAccounts: () => request("/api/admin/visits/active-accounts", { auth: true }),
  onlineUsers: () => request("/api/admin/visits/online", { auth: true }),
  revenueSummary: () => request("/api/admin/revenue/summary", { auth: true }),
  payments: (status, page = 0) =>
    request(`/api/admin/revenue/payments?page=${page}&size=20${status ? `&status=${status}` : ""}`, { auth: true }),
  reconcilePayment: (orderCode) =>
    request(`/api/admin/revenue/payments/${encodeURIComponent(orderCode)}/reconcile`, { method: "POST", auth: true }),
};

// Counts one site visit; the app calls it once per browser session.
export const trackVisit = () => request("/api/common/visits", { method: "POST", auth: true });

// Presence ping while signed in; the backend counts users seen in the last 2 minutes as online.
export const heartbeat = () => request("/api/common/visits/heartbeat", { method: "POST", auth: true });

export const membershipApi = {
  me: () => request("/api/user/membership/me", { auth: true }),

  freeUses: () => request("/api/user/membership/free-uses", { auth: true }),

  plans: () => request("/api/common/membership/plans"),

  operationCredits: () => request("/api/common/membership/operation-credits"),

  // Returns { orderCode, provider, amount, payUrl, qrCode } — render qrCode in-app (see PaymentQr.jsx).
  subscribe: ({ planCode, provider }) =>
    request("/api/user/membership/subscribe", {
      method: "POST",
      auth: true,
      body: { planCode, provider },
    }),
};
