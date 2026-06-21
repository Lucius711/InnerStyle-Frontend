// Auth + wallet API calls. Tokens are managed by http.js.
import { request, tokenStore } from "@/lib/http";

export const authApi = {
  register: (payload) =>
    request("/api/user/auth/register", { method: "POST", body: payload }),

  login: async ({ email, password }) => {
    const data = await request("/api/user/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokenStore.set(data);
    return data;
  },

  socialLogin: async (provider, token) => {
    const data = await request(`/api/user/auth/oauth/${provider}`, {
      method: "POST",
      body: { token },
    });
    tokenStore.set(data);
    return data;
  },

  logout: async () => {
    const refreshToken = tokenStore.refresh;
    try {
      await request("/api/user/auth/logout", {
        method: "POST",
        auth: true,
        body: { refreshToken },
      });
    } finally {
      tokenStore.clear();
    }
  },

  verifyEmail: (token) =>
    request("/api/user/auth/verify-email", { method: "POST", body: { token } }),

  resendVerification: (email) =>
    request("/api/user/auth/resend-verification", { method: "POST", body: { email } }),

  forgotPassword: (email) =>
    request("/api/user/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token, newPassword) =>
    request("/api/user/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
    }),

  me: () => request("/api/user/account/me", { auth: true }),
};

export const printApi = {
  // Returns { orderId, amount, payUrl } — the client then redirects to payUrl.
  placeOrder: ({ taskId, provider, note }) =>
    request("/api/user/print/orders", {
      method: "POST",
      auth: true,
      body: { taskId, provider, note },
    }),

  list: ({ page = 0, size = 10 } = {}) =>
    request(`/api/user/print/orders?page=${page}&size=${size}&sort=createdAt,desc`, { auth: true }),
};

export const membershipApi = {
  me: () => request("/api/user/membership/me", { auth: true }),

  plans: () => request("/api/common/membership/plans"),

  operationCredits: () => request("/api/common/membership/operation-credits"),

  // Returns { orderCode, provider, amount, payUrl } — redirect to payUrl.
  subscribe: ({ planCode, provider }) =>
    request("/api/user/membership/subscribe", {
      method: "POST",
      auth: true,
      body: { planCode, provider },
    }),
};
