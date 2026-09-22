import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, QrCode, Wallet as WalletIcon } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { request } from "@/lib/http";
import { makeQrDataUrl } from "@/lib/ar";
import { vnd } from "@/lib/pricing";

// ponytail: each poll makes the backend call payOS live (no local cache) — fine at this
// traffic level; if many people sit on this page at once, cache the lookup server-side or
// switch this page to await the webhook via SSE/WebSocket instead of polling.
const POLL_MS = 4000;

/**
 * In-app payOS checkout: shows the VietQR payload as a scannable code and polls the backend
 * (the same idempotent `/payos/return` lookup the redirect flow uses) until it settles, instead
 * of sending the user to payOS's hosted page.
 */
export default function PaymentQr() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderCode, amount, qrCode, payUrl, returnTo = "/" } = state || {};

  const [qrImg, setQrImg] = useState(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef(null);

  // No order in hand (e.g. page refresh) — nothing to show, go back where they came from.
  useEffect(() => {
    if (!orderCode || !qrCode) navigate(returnTo, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrCode) return;
    makeQrDataUrl(qrCode).then(setQrImg).catch(() => setQrImg(null));
  }, [qrCode]);

  useEffect(() => {
    if (!orderCode || paid) return;
    const check = async () => {
      try {
        const res = await request(`/api/common/payments/payos/return?orderCode=${encodeURIComponent(orderCode)}`);
        if (res.status === "SUCCESS") setPaid(true);
      } catch {
        // transient network hiccup — the next poll retries.
      }
    };
    check();
    pollRef.current = setInterval(check, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [orderCode, paid]);

  if (!orderCode || !qrCode) return null;

  return (
    <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-24">
      <Seo title="Scan to pay" noindex />
      <div className="glass-strong w-full max-w-sm rounded-3xl p-8 text-center shadow-card">
        {paid ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <h1 className="mt-4 font-display text-2xl font-bold text-app-text">Payment successful</h1>
            <p className="mt-2 text-sm text-app-muted">Your account has been updated.</p>
          </>
        ) : (
          <>
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-app-text">
              <QrCode className="h-4 w-4 text-brand-violet" /> Scan with your banking app
            </p>
            {amount != null && (
              <p className="mt-1 font-display text-2xl font-bold text-gradient">{vnd.format(amount)}</p>
            )}
            <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3">
              {qrImg ? (
                <img src={qrImg} alt="payOS QR code" width={220} height={220} />
              ) : (
                <div className="flex h-[220px] w-[220px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
                </div>
              )}
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-app-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Waiting for payment…
            </p>
            {payUrl && (
              <a href={payUrl} className="mt-3 inline-block text-xs text-app-muted underline">
                Or open the payOS checkout page
              </a>
            )}
          </>
        )}
        <Link to={returnTo} className="mt-7 inline-block">
          <Button icon={WalletIcon} variant={paid ? "primary" : "secondary"}>
            Back
          </Button>
        </Link>
      </div>
    </main>
  );
}
