import { useCallback, useEffect, useState } from "react";
import { Crown, Loader2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { adminApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";
import { vnd } from "@/lib/pricing";

const PLAN_TONE = { PRO: "bg-brand-violet", MAX: "bg-amber-400" };

/** Admin: paid membership plans — how many of each plan were bought, plus the purchase list. */
export default function AdminPlans() {
  const t = useT();
  const toast = useToast();
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(0);
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setData(null);
    try {
      const [s, p] = await Promise.all([adminApi.planSummary(), adminApi.planPurchases(plan, page)]);
      setSummary(s);
      setData(p);
    } catch (err) {
      setData({ content: [], totalPages: 0 });
      toast.error(t("plans.loadFail"), friendly(err));
    }
  }, [plan, page, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const plans = summary?.plans || [];
  const rows = data?.content || [];
  const totalPages = data?.totalPages ?? data?.page?.totalPages ?? 0;
  const money = (v) => (v == null ? "–" : vnd.format(Number(v)));
  const time = (v) => (v ? new Date(v).toLocaleString() : "–");
  const share = (n) => (summary?.totalPaid ? Math.round((n / summary.totalPaid) * 100) : 0);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-app-text">
            <Crown className="h-6 w-6 text-brand-violet" /> {t("plans.title")}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{t("plans.subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} aria-label={t("staff.refresh")} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label={t("plans.totalPaid")} value={summary?.totalPaid ?? "–"} tone="text-emerald-400" />
        <Stat label={t("plans.totalRevenue")} value={money(summary?.totalRevenue)} />
        <Stat label={t("plans.buyers")} value={summary?.buyers ?? "–"} />
      </div>

      {/* One card per plan type: count bought, share of all purchases, revenue */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.code} className="p-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-medium text-app-text">{p.name}</p>
              {p.currentPrice != null && <p className="text-xs text-app-faint">{money(p.currentPrice)}</p>}
            </div>
            <p className="mt-2 text-3xl font-semibold text-app-text">
              {p.paidCount}
              <span className="ml-1 text-sm font-normal text-app-muted">{t("plans.packs")}</span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-app-line/10">
              <div
                className={`h-full rounded-full ${PLAN_TONE[p.code] || "bg-emerald-400"}`}
                style={{ width: `${share(p.paidCount)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-app-muted">
              <span>{share(p.paidCount)}%</span>
              <span>{money(p.revenue)}</span>
            </div>
            <p className="mt-1 text-xs text-app-faint">
              {t("plans.lastPaid")}: {time(p.lastPaidAt)}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {["", ...plans.map((p) => p.code)].map((code) => (
          <Button
            key={code || "all"}
            size="sm"
            variant={code === plan ? "primary" : "ghost"}
            onClick={() => {
              setPlan(code);
              setPage(0);
            }}
          >
            {code ? plans.find((p) => p.code === code)?.name || code : t("plans.all")}
          </Button>
        ))}
      </div>

      <Card className="mt-4 overflow-x-auto p-0">
        {!data ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-app-muted">{t("plans.empty")}</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-app-muted">
              <tr className="border-b border-app-line/10">
                <th className="px-4 py-3 font-medium">{t("plans.orderCode")}</th>
                <th className="px-4 py-3 font-medium">{t("plans.plan")}</th>
                <th className="px-4 py-3 font-medium">{t("plans.customer")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("plans.amount")}</th>
                <th className="px-4 py-3 font-medium">{t("plans.paidAt")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.orderCode} className="border-b border-app-line/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-app-muted">{r.orderCode}</td>
                  <td className="px-4 py-3 text-app-text">{r.planName}</td>
                  <td className="px-4 py-3">
                    <div className="text-app-text">{r.customerName || "–"}</div>
                    <div className="text-xs text-app-faint">{r.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-app-text">{money(r.amount)}</td>
                  <td className="px-4 py-3 text-xs text-app-muted">{time(r.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm text-app-muted">
          <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            {t("revenue.prev")}
          </Button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <Button size="sm" variant="ghost" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("revenue.next")}
          </Button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "text-app-text" }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-app-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </Card>
  );
}
