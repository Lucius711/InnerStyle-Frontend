import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import PasswordAuthForm from "@/components/auth/PasswordAuthForm";
import SocialButtons from "@/components/auth/SocialButtons";
import { isStaff } from "@/components/auth/StaffRoute";

/**
 * Sign in with a username + password, or continue with Google / Facebook. Creating an account
 * does not sign you in — after registering you're returned to the sign-in form.
 */
export default function Login({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || "/studio";

  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const registering = mode === "register";

  const handleSuccess = (account) => {
    // Staff land on their fulfilment dashboard; everyone else on their intended page.
    navigate(isStaff(account) ? "/staff" : from, { replace: true });
  };

  return (
    <AuthShell
      title={registering ? "Create account" : "Sign in"}
      subtitle={
        registering
          ? "Pick a username and password to get started — no email needed."
          : "Use your username and password, or continue with a social account."
      }
    >
      <PasswordAuthForm mode={mode} onModeChange={setMode} onSuccess={handleSuccess} />
      <SocialButtons onSuccess={handleSuccess} />
    </AuthShell>
  );
}
