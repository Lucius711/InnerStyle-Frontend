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

  updateStatus: (id, status) =>
    request(`/api/staff/orders/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: { status },
    }),

  // Analyse the order model's 3D-print readiness (watertight / holes / non-manifold).
  printability: (id) => request(`/api/staff/orders/${id}/printability`, { auth: true }),

  // Auto-repair the order model into a watertight, printable mesh, saved in place (the download
  // then serves the repaired model). Returns { before, after, task }.
  repairModel: (id) => request(`/api/staff/orders/${id}/repair`, { method: "POST", auth: true }),

  // Download the customer's 3D model file as a Blob (Bearer-authenticated).
  downloadModel: async (id, format = "glb") => {
    const res = await authedFetch(`/api/staff/orders/${id}/model?format=${format}`, {
      auth: true,
    });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = /filename="?([^"]+)"?/.exec(disposition);
    const filename = match ? match[1] : `model.${format}`;
    return { blob: await res.blob(), filename };
  },
};

export const membershipApi = {
  me: () => request("/api/user/membership/me", { auth: true }),

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
