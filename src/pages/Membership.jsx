import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Loader2, RefreshCw, Printer, Check } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { membershipApi } from "@/lib/authApi";
import { vnd } from "@/lib/pricing";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";
import { useT } from "@/hooks/useI18n";

export default function Membership() {
  const toast = useToast();
  const navigate = useNavigate();
  const t = useT();
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
      toast.error(t("membership.loadFail"), friendly(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // payOS only now — the QR page renders res.qrCode in-app instead of redirecting.
  const buy = async (planCode) => {
    setBusy(planCode);
    try {
      const res = await membershipApi.subscribe({ planCode, provider: "PAYOS" });
      if (res.qrCode) {
        navigate("/wallet/payos-qr", { state: { ...res, returnTo: "/membership" } });
      } else if (res.payUrl) {
        window.location.href = res.payUrl;
      } else {
        toast.error(t("membership.paymentFailed"), t("membership.noPaymentInfo"));
        setBusy("");
      }
    } catch (err) {
      toast.error(t("membership.startPaymentFail"), friendly(err));
      setBusy("");
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-28">
      <Seo title="Membership & credits" noindex />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-app-text">{t("membership.title")}</h1>
        <div className="flex gap-2">
          <Link to="/print-orders">
            <Button variant="ghost" size="sm" icon={Printer}>
              {t("membership.printOrders")}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load}>
            {t("membership.refresh")}
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
              <Sparkles className="h-4 w-4" />{" "}
              {t("membership.planCredits", { plan: me?.planName })}
            </div>
            <p className="mt-2 font-display text-4xl font-bold text-app-text">
              {me ? me.creditsRemaining : "—"}
              <span className="ml-2 text-base font-normal text-app-faint">
                {t("membership.perMonth", { count: me?.monthlyCredits })}
              </span>
            </p>
            {me?.periodEnd && (
              <p className="mt-1 text-sm text-app-faint">
                {t("membership.renews", {
                  date: new Date(me.periodEnd).toLocaleDateString(),
                })}
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
                    {paid ? vnd.format(p.price) : t("membership.free")}
                    {paid && (
                      <span className="text-sm font-normal text-app-faint"> {t("membership.perMo")}</span>
                    )}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-app-muted">
                    <Check className="h-4 w-4 text-emerald-400" />{" "}
                    {t("membership.creditsPerMonth", { count: p.monthlyCredits })}
                  </p>

                  <div className="mt-auto pt-5">
                    {current ? (
                      <Button variant="secondary" size="sm" className="w-full" disabled>
                        {t("membership.currentPlan")}
                      </Button>
                    ) : paid ? (
                      <Button
                        size="sm"
                        className="w-full"
                        loading={busy === p.code}
                        onClick={() => buy(p.code)}
                      >
                        {t("membership.payNow")}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full" disabled>
                        {t("membership.defaultPlan")}
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
