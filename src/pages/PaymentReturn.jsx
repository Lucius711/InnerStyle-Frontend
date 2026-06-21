import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Wallet as WalletIcon } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { request } from "@/lib/http";

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

/**
 * Landing page the gateway redirects the browser to after payment (VNPay / MoMo). It calls the
 * backend to verify the signed return params and credit the wallet (idempotent) — a reliable
 * fallback when the server-to-server IPN doesn't arrive (common in sandboxes).
 */
export default function PaymentReturn() {
  const { pathname, search } = useLocation();
  const isMomo = pathname.includes("momo");
  const provider = isMomo ? "momo" : "vnpay";

  const [state, setState] = useState({ loading: true, success: false, amount: null });

  useEffect(() => {
    let active = true;
    request(`/api/common/payments/${provider}/return${search}`)
      .then((res) => {
        if (!active) return;
        setState({
          loading: false,
          success: res.status === "SUCCESS",
          amount: res.amount != null ? Number(res.amount) : null,
        });
      })
      .catch(() => {
        if (active) setState({ loading: false, success: false, amount: null });
      });
    return () => {
      active = false;
    };
  }, [provider, search]);

  return (
    <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-24">
      <Seo title="Payment result" noindex />
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 text-center shadow-card">
        {state.loading ? (
          <div className="flex flex-col items-center gap-3 text-app-muted">
            <Loader2 className="h-10 w-10 animate-spin" />
            Confirming your payment…
          </div>
        ) : state.success ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <h1 className="mt-4 font-display text-2xl font-bold text-app-text">Payment successful</h1>
            <p className="mt-2 text-sm text-app-muted">
              {state.amount
                ? `Paid ${vnd.format(state.amount)}. Your account has been updated.`
                : "Your payment was received."}
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-14 w-14 text-rose-400" />
            <h1 className="mt-4 font-display text-2xl font-bold text-app-text">Payment not completed</h1>
            <p className="mt-2 text-sm text-app-muted">
              The transaction was cancelled or could not be verified. No funds were captured — you
              can try again.
            </p>
          </>
        )}
        <Link to="/membership" className="mt-7 inline-block">
          <Button icon={WalletIcon}>Back to membership</Button>
        </Link>
      </div>
    </main>
  );
}
