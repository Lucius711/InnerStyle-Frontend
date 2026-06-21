import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import { Field, TextInput } from "@/components/ui/FormControls";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || "/studio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login({ email, password });
      toast.success("Welcome back", "You're signed in.");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error("Sign in failed", friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your studio, wallet and 3D library."
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="font-semibold text-gradient">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field
          label="Password"
          hint={
            <Link to="/forgot-password" className="text-brand-violet hover:underline">
              Forgot?
            </Link>
          }
        >
          <TextInput
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" className="w-full" loading={busy} icon={LogIn}>
          Sign in
        </Button>
      </form>
      <SocialButtons onSuccess={() => navigate(from, { replace: true })} />
    </AuthShell>
  );
}
