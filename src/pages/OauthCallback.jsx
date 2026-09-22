import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { tokenStore } from "@/lib/http";
import { useAuth } from "@/hooks/useAuth";
import { isStaff } from "@/components/auth/StaffRoute";

/**
 * Landing page for the backend's Google redirect flow (AuthController#googleCallback). The
 * access token arrives in the URL fragment (never sent to any server) — read it once, hand it
 * to the normal token store, then load the profile and continue like any other sign-in.
 */
export default function OauthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }
    tokenStore.set({ accessToken });
    refreshUser().then((user) => {
      navigate(user && isStaff(user) ? "/staff" : "/studio", { replace: true });
    });
  }, [navigate, refreshUser]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
    </div>
  );
}
