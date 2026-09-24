import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Loader2, RefreshCw, CreditCard } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { printApi } from "@/lib/authApi";
import { vnd } from "@/lib/pricing";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";

const STATUS_TONE = {
  PAID: "emerald",
  PENDING: "amber",
  IN_PRODUCTION: "violet",
  SHIPPED: "violet",
  COMPLETED: "emerald",
  CANCELLED: "rose",
};

/** "Print history" — past 3D print orders placed by the user. */
export default function PrintOrders() {
  const t = useT();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState("");
  const navigate = useNavigate();

  // Same hand-off as placing the order (ResultPanel): payOS QR page, else redirect to the link.
  const continuePay = async (id) => {
    setPaying(id);
    try {
      const pay = (await printApi.resumePayment(id)).payment || {};
      if (pay.qrCode) {
        navigate("/wallet/payos-qr", { state: { ...pay, returnTo: window.location.pathname } });
      } else if (pay.payUrl) {
        window.location.href = pay.payUrl;
      } else {
        throw new Error("No payment URL returned.");
      }
    } catch (err) {
      toast.error(t("profile.prints.payFail"), friendly(err));
      setPaying("");
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const page = await printApi.list({ size: 20 });
      setOrders(page.content || []);
    } catch (err) {
      toast.error(t("profile.prints.loadFail"), friendly(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Seo title="Print history" noindex />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-app-text">{t("profile.prints.title")}</h2>
          <p className="mt-1 text-sm text-app-muted">{t("profile.prints.subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load}>
          {t("profile.prints.refresh")}
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-app-line/10 bg-app-line/[0.03] p-10 text-center text-app-muted">
          <Printer className="mx-auto mb-3 h-10 w-10 text-app-faint" />
          <p>{t("profile.prints.empty")}</p>
          <p className="mt-1 text-sm text-app-faint">{t("profile.prints.emptyHint")}</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[o.status] || "violet"}>{o.status}</Badge>
                  <span className="truncate text-xs text-app-faint">
                    {t("profile.prints.order")} #{o.id.slice(0, 8)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-app-faint">
                  {new Date(o.createdAt).toLocaleString()}
                  {o.note ? ` · ${o.note}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {o.status === "PENDING" && (
                  <Button
                    size="sm"
                    icon={paying === o.id ? Loader2 : CreditCard}
                    loading={paying === o.id}
                    disabled={!!paying}
                    onClick={() => continuePay(o.id)}
                  >
                    {t("profile.prints.continuePay")}
                  </Button>
                )}
                <span className="font-semibold text-app-text">{vnd.format(o.amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
