import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/authApi";
import { tokenStore } from "@/lib/http";

const AuthContext = createContext(null);

/**
 * Session provider. Loads the current user on mount (if a token exists) and exposes
 * social / logout helpers. Sign-in is social-only. Listens for "innerstyle:logout" emitted by
 * the HTTP layer when a refresh fails.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onLogout = () => setUser(null);
    window.addEventListener("innerstyle:logout", onLogout);
    return () => window.removeEventListener("innerstyle:logout", onLogout);
  }, [loadUser]);

  const social = useCallback(async (provider, token) => {
    const data = await authApi.socialLogin(provider, token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    social,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
