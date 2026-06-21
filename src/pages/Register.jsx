import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import { Field, TextInput } from "@/components/ui/FormControls";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ fullName, email, password });
      toast.success("Account created", "Check your email to verify your address.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Sign up failed", friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Start turning images & prompts into animated 3D."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gradient">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <TextInput
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </Field>
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
        <Field label="Password" hint="8–72 characters">
          <TextInput
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
          />
        </Field>
        <Button type="submit" className="w-full" loading={busy} icon={UserPlus}>
          Create account
        </Button>
      </form>
      <SocialButtons onSuccess={() => navigate("/studio", { replace: true })} />
    </AuthShell>
  );
}
