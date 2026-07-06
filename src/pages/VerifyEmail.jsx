import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, RotateCw } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field, TextInput } from "@/components/ui/FormControls";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState(params.get("email") || "");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | ok
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.verifyEmail(email.trim(), otp.trim());
      setStatus("ok");
    } catch (err) {
      toast.error("Verification failed", friendly(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      toast.error("Email required", "Enter your email to resend the code.");
      return;
    }
    setResending(true);
    try {
      await authApi.resendVerification(email.trim());
      toast.success("Code sent", "Check your inbox for a new verification code.");
    } catch (err) {
      toast.error("Couldn't resend", friendly(err));
    } finally {
      setResending(false);
    }
  };

  if (status === "ok") {
    return (
      <AuthShell title="Email verified">
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" /> Your email is verified.
          </div>
          <Link to="/login">
            <Button className="w-full">Continue to sign in</Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the code we emailed you to activate your account."
      footer={
        <>
          Wrong email?{" "}
          <Link to="/register" className="font-semibold text-gradient">
            Sign up again
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
        <Field label="Verification code" hint="6 digits">
          <TextInput
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            pattern="\d{4,9}"
            maxLength={9}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter the code"
            className="text-center text-lg tracking-[0.4em]"
          />
        </Field>
        <Button type="submit" className="w-full" loading={busy} icon={ShieldCheck}>
          Verify email
        </Button>
      </form>
      <button
        type="button"
        onClick={resend}
        disabled={resending}
        className="focus-ring mt-4 flex w-full items-center justify-center gap-2 text-sm text-app-muted transition-colors hover:text-app-text disabled:opacity-50"
      >
        <RotateCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
        Didn't get it? Resend code
      </button>
    </AuthShell>
  );
}
