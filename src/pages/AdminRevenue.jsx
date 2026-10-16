import { useCallback, useEffect, useState } from "react";
import { Banknote, Loader2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { adminApi } from "@/lib/authApi";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";
import { vnd } from "@/lib/pricing";

const STATUSES = ["", "SUCCEEDED", "PROCESSING", "EXPIRED", "FAILED"];
const STATUS_TONE = {
  SUCCEEDED: "text-emerald-400",
  PROCESSING: "text-amber-400",
  FAILED: "text-rose-400",
  EXPIRED: "text-app-faint",
  CANCELED: "text-app-faint",
  PENDING: "text-app-muted",
};

/** Admin: payment orders from the DB, with a per-order "reconcile" that re-checks payOS. */
export default function AdminRevenue() {
  const t = useT();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setData(null);
    try {
      const [s, p] = await Promise.all([adminApi.revenueSummary(), adminApi.payments(status, page)]);
      setSummary(s);
      setData(p);
    } catch (err) {
      setData({ content: [], totalPages: 0 });
      toast.error(t("revenue.loadFail"), friendly(err));
    }
  }, [status, page, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const reconcile = async (orderCode) => {
    setBusy(orderCode);
    try {
      const res = await adminApi.reconcilePayment(orderCode);
      if (res.status === "SUCCESS") toast.info(t("revenue.reconciled"), orderCode);
      else toast.info(t("revenue.notPaid"), orderCode);
      await load();
    } catch (err) {
      toast.error(t("revenue.reconcileFail"), friendly(err));
    } finally {
      setBusy("");
    }
  };

  const rows = data?.content || [];
  const totalPages = data?.totalPages ?? data?.page?.totalPages ?? 0;
  const money = (v) => (v == null ? "–" : vnd.format(Number(v)));
  const time = (v) => (v ? new Date(v).toLocaleString() : "–");

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-28">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-app-text">
            <Banknote className="h-6 w-6 text-brand-violet" /> {t("revenue.title")}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{t("revenue.subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load} aria-label={t("staff.refresh")} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label={t("revenue.total")} value={money(summary?.totalRevenue)} tone="text-emerald-400" />
        <Stat label={t("revenue.subscription")} value={money(summary?.subscriptionRevenue)} />
        <Stat label={t("revenue.print")} value={money(summary?.printRevenue)} />
        <Stat label={t("revenue.paidCount")} value={summary?.paidCount ?? "–"} />
        <Stat label={t("revenue.awaitingCount")} value={summary?.awaitingCount ?? "–"} tone="text-amber-400" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s || "all"}
            size="sm"
            variant={s === status ? "primary" : "ghost"}
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
          >
            {s ? t(`revenue.statuses.${s}`) : t("revenue.all")}
          </Button>
        ))}
      </div>

      <Card className="mt-4 overflow-x-auto p-0">
        {!data ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-app-muted">{t("revenue.empty")}</p>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs text-app-muted">
              <tr className="border-b border-app-line/10">
                <th className="px-4 py-3 font-medium">{t("revenue.orderCode")}</th>
                <th className="px-4 py-3 font-medium">{t("revenue.purpose")}</th>
                <th className="px-4 py-3 font-medium">{t("revenue.customer")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("revenue.amount")}</th>
                <th className="px-4 py-3 font-medium">{t("revenue.statusCol")}</th>
                <th className="px-4 py-3 font-medium">{t("revenue.createdAt")}</th>
                <th className="px-4 py-3 font-medium">{t("revenue.paidAt")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.orderCode} className="border-b border-app-line/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-app-text">{r.orderCode}</td>
                  <td className="px-4 py-3 text-app-muted">{t(`revenue.purposes.${r.purpose}`)}</td>
                  <td className="px-4 py-3">
                    <div className="text-app-text">{r.customerName || "–"}</div>
                    <div className="text-xs text-app-faint">{r.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-app-text">{money(r.amount)}</td>
                  <td className={`px-4 py-3 ${STATUS_TONE[r.status] || "text-app-muted"}`}>
                    {t(`revenue.statuses.${r.status}`)}
                  </td>
                  <td className="px-4 py-3 text-xs text-app-muted">{time(r.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-app-muted">{time(r.paidAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {r.status !== "SUCCEEDED" && (
                      <Button size="sm" variant="ghost" loading={busy === r.orderCode} onClick={() => reconcile(r.orderCode)}>
                        {t("revenue.reconcile")}
                      </Button>
                    )}
                  </td>
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
