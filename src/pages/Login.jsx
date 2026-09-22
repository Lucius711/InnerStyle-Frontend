import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { apiBase } from "@/lib/http";

/**
 * Sign-in is Google-only. The button is a plain link to the backend's own OAuth redirect
 * flow (GET /oauth/google/authorize) — no Google JS SDK runs in the browser, no token is ever
 * handled client-side. Google redirects back through the backend, which lands the browser on
 * /oauth/callback with our own access token (see OauthCallback.jsx).
 */
export default function Login() {
  return (
    <AuthShell title="Sign in" subtitle="Continue with your Google account.">
      <a href={`${apiBase}/api/user/auth/oauth/google/authorize`} className="block">
        <Button size="lg" className="w-full">
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </Button>
      </a>
    </AuthShell>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.29 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.24 7.24 0 010-4.54v-3.1H1.26a12 12 0 000 10.75z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.26 6.63l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}
