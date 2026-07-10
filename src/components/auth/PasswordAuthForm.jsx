import { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Field, TextInput } from "@/components/ui/FormControls";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

/**
 * Username + password sign-in / sign-up form. `mode` ("login" | "register") is controlled by the
 * parent via `onModeChange` so the surrounding page header stays in sync. On login success it
 * calls {@code onSuccess(user)}; on register success it switches to the login form (no auto-login).
 */
export default function PasswordAuthForm({ mode = "login", onModeChange, onSuccess }) {
  const { passwordLogin, register } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const switchMode = (next) => {
    if (onModeChange) onModeChange(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const u = username.trim();
    if (!u || !password) {
      toast.error("Missing details", "Please enter your username and password.");
      return;
    }
    if (isRegister && u.length < 3) {
      toast.error("Username too short", "Username must be at least 3 characters.");
      return;
    }
    if (isRegister && password.length < 6) {
      toast.error("Password too short", "Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (isRegister) {
        // Create the account, then send the user to the sign-in form (no auto-login).
        await register({ username: u, password, fullName: fullName.trim() || undefined });
        toast.success("Account created", "Please sign in with your new account.");
        setPassword("");
        setFullName("");
        switchMode("login");
        return;
      }
      const user = await passwordLogin({ username: u, password });
      toast.success("Welcome", "You're signed in.");
      if (onSuccess) onSuccess(user);
    } catch (err) {
      toast.error(isRegister ? "Couldn't create account" : "Sign-in failed", friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Username">
        <TextInput
          data-testid="auth-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="yourname"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
        />
      </Field>

      {isRegister && (
        <Field label="Full name" hint="optional">
          <TextInput
            data-testid="auth-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyen Van A"
            autoComplete="name"
          />
        </Field>
      )}

      <Field label="Password">
        <div className="relative">
          <TextInput
            data-testid="auth-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="pr-11"
          />
          <button
            type="button"
            data-testid="auth-toggle-password"
            onClick={() => setShowPassword((s) => !s)}
            className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-app-faint transition-colors hover:text-app-text"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Button
        type="submit"
        data-testid="auth-submit"
        size="lg"
        className="w-full"
        loading={busy}
        icon={isRegister ? UserPlus : LogIn}
      >
        {isRegister ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-app-muted">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          data-testid="auth-switch-mode"
          onClick={() => switchMode(isRegister ? "login" : "register")}
          className="font-semibold text-brand-violet hover:underline"
        >
          {isRegister ? "Sign in" : "Create one"}
        </button>
      </p>
    </form>
  );
}
