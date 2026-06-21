import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "";

/** Inject a third-party <script> once and resolve when it has loaded. */
function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.id = id;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

/**
 * Google + Facebook sign-in. The provider SDK obtains a token client-side; we exchange it with
 * the backend (POST /api/user/auth/oauth/{provider}) for our own JWT. Buttons only render when
 * the corresponding VITE_*_ID env var is configured.
 */
export default function SocialButtons({ onSuccess }) {
  const { social } = useAuth();
  const toast = useToast();
  const googleBtnRef = useRef(null);
  const handlerRef = useRef();

  // Always call the freshest handler (avoids stale closures inside SDK callbacks).
  handlerRef.current = async (provider, token) => {
    try {
      const user = await social(provider, token);
      toast.success("Welcome", "You're signed in.");
      if (onSuccess) onSuccess(user);
    } catch (err) {
      toast.error("Social sign-in failed", friendly(err));
    }
  };

  // Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let cancelled = false;
    loadScript("https://accounts.google.com/gsi/client", "gsi-script")
      .then(() => {
        if (cancelled || !window.google || !window.google.accounts) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => handlerRef.current("google", resp.credential),
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: 320,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Preload + init the Facebook SDK so FB.login can be called synchronously on click.
  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;
    window.fbAsyncInit = function fbInit() {
      window.FB.init({ appId: FACEBOOK_APP_ID, version: "v19.0", cookie: true, xfbml: false });
    };
    loadScript("https://connect.facebook.net/en_US/sdk.js", "fb-sdk").catch(() => {});
  }, []);

  const facebookLogin = useCallback(() => {
    if (!window.FB) {
      toast.error("Facebook unavailable", "The Facebook SDK is still loading. Try again.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse && response.authResponse.accessToken) {
          handlerRef.current("facebook", response.authResponse.accessToken);
        }
      },
      { scope: "public_profile,email" }
    );
  }, [toast]);

  if (!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID) return null;

  return (
    <div className="mt-2 space-y-3">
      <div className="flex items-center gap-3 text-xs text-app-faint">
        <span className="h-px flex-1 bg-app-line/10" />
        or continue with
        <span className="h-px flex-1 bg-app-line/10" />
      </div>

      {GOOGLE_CLIENT_ID && <div ref={googleBtnRef} className="flex justify-center" />}

      {FACEBOOK_APP_ID && (
        <button
          type="button"
          onClick={facebookLogin}
          className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1877F2] text-sm font-semibold text-white transition hover:brightness-110"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07z" />
          </svg>
          Continue with Facebook
        </button>
      )}
    </div>
  );
}
