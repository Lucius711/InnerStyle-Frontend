import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/authApi";
import { friendly } from "@/lib/messages";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState("pending"); // pending | ok | error
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus("error");
      setError("This verification link is missing its token.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => active && setStatus("ok"))
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setError(friendly(err));
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell title="Email verification">
      {status === "pending" && (
        <div className="flex items-center gap-3 text-app-muted">
          <Loader2 className="h-5 w-5 animate-spin" /> Verifying your email…
        </div>
      )}
      {status === "ok" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" /> Your email is verified.
          </div>
          <Link to="/login">
            <Button className="w-full">Continue to sign in</Button>
          </Link>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-rose-400">
            <XCircle className="h-6 w-6" /> {error}
          </div>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
