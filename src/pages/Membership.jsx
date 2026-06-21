import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, RefreshCw, Printer, Check } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { membershipApi } from "@/lib/authApi";
import { vnd } from "@/lib/pricing";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

export default function Membership() {
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([membershipApi.me(), membershipApi.plans()]);
      setMe(m);
      setPlans(p || []);
    } catch (err) {
      toast.error("Couldn't load membership", friendly(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = async (planCode, provider) => {
    setBusy(`${planCode}-${provider}`);
    try {
      const res = await membershipApi.subscribe({ planCode, provider });
      if (res.payUrl) window.location.href = res.payUrl;
      else toast.error("Payment failed", "No payment URL returned.");
    } catch (err) {
      toast.error("Couldn't start payment", friendly(err));
      setBusy("");
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-28">
      <Seo title="Membership & credits" noindex />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-app-text">Membership</h1>
        <div className="flex gap-2">
          <Link to="/print-orders">
            <Button variant="ghost" size="sm" icon={Printer}>
              Print orders
            </Button>
          </Link>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
        </div>
      ) : (
        <>
          {/* Current credits */}
          <div className="glass-strong mb-8 rounded-3xl p-6 shadow-card">
            <div className="flex items-center gap-2 text-app-muted">
              <Sparkles className="h-4 w-4" /> Plan {me?.planName} · credits remaining
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-app-text">
              {me ? me.creditsRemaining : "—"}
              <span className="ml-2 text-base font-normal text-app-faint">
                / {me?.monthlyCredits} per month
              </span>
            </p>
            {me?.periodEnd && (
              <p className="mt-1 text-sm text-app-faint">
                Renews {new Date(me.periodEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Plans */}
          <div className="grid gap-5 sm:grid-cols-3">
            {plans.map((p) => {
              const current = me?.planCode === p.code;
              const paid = Number(p.price) > 0;
              return (
                <div
                  key={p.code}
                  className={`glass-strong flex flex-col rounded-3xl p-6 shadow-card ${
                    current ? "ring-2 ring-brand-violet/60" : ""
                  }`}
                >
                  <h3 className="font-display text-xl font-bold text-app-text">{p.name}</h3>
                  <p className="mt-1 font-display text-2xl font-bold text-gradient">
                    {paid ? vnd.format(p.price) : "Free"}
                    {paid && <span className="text-sm font-normal text-app-faint"> /mo</span>}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-app-muted">
                    <Check className="h-4 w-4 text-emerald-400" /> {p.monthlyCredits} credits / month
                  </p>

                  <div className="mt-auto pt-5">
                    {current ? (
                      <Button variant="secondary" size="sm" className="w-full" disabled>
                        Current plan
                      </Button>
                    ) : paid ? (
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full"
                          loading={busy === `${p.code}-VNPAY`}
                          onClick={() => buy(p.code, "VNPAY")}
                        >
                          Buy with VNPay
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          loading={busy === `${p.code}-MOMO`}
                          onClick={() => buy(p.code, "MOMO")}
                        >
                          Buy with MoMo
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full" disabled>
                        Default plan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
