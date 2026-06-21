import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field, TextInput } from "@/components/ui/FormControls";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success("Check your email", "If the address exists, a reset link is on its way.");
    } catch (err) {
      toast.error("Request failed", friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a link to set a new password."
      footer={
        <Link to="/login" className="font-semibold text-gradient">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-app-muted">
          If an account exists for <span className="text-app-text">{email}</span>, a reset link has
          been sent. The link expires shortly.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Button type="submit" className="w-full" loading={busy} icon={Mail}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
