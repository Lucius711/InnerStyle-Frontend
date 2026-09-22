import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/authApi";
import { tokenStore } from "@/lib/http";

const AuthContext = createContext(null);

/**
 * Session provider. Loads the current user on mount (if a token exists) and exposes a
 * logout helper. Sign-in is Google-only, handled entirely by the backend redirect flow
 * (see OauthCallback). Listens for "innerstyle:logout" emitted by the HTTP layer when a
 * refresh fails.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      return me;
    } catch {
      tokenStore.clear();
      setUser(null);
      return null;
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

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
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
