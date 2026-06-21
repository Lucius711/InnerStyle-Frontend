import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field, TextInput } from "@/components/ui/FormControls";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

export default function ResetPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid link", "This reset link is missing its token.");
      return;
    }
    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success("Password updated", "You can now sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Reset failed", friendly(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you don't use elsewhere."
      footer={
        <Link to="/login" className="font-semibold text-gradient">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" hint="8–72 characters">
          <TextInput
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
          />
        </Field>
        <Button type="submit" className="w-full" loading={busy} icon={KeyRound}>
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
