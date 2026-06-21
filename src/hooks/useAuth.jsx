import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/authApi";
import { tokenStore } from "@/lib/http";

const AuthContext = createContext(null);

/**
 * Session provider. Loads the current user on mount (if a token exists) and exposes
 * login / register / social / logout helpers. Listens for "innerstyle:logout" emitted by the
 * HTTP layer when a refresh fails.
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

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data.user;
  }, []);

  const social = useCallback(async (provider, token) => {
    const data = await authApi.socialLogin(provider, token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback((payload) => authApi.register(payload), []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    social,
    register,
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
