import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Printer, Loader2, RefreshCw, Wallet as WalletIcon } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { printApi } from "@/lib/authApi";
import { vnd } from "@/lib/pricing";
import { useToast } from "@/hooks/useToast";
import { friendly } from "@/lib/messages";

const STATUS_TONE = {
  PAID: "emerald",
  PENDING: "amber",
  IN_PRODUCTION: "violet",
  SHIPPED: "violet",
  COMPLETED: "emerald",
  CANCELLED: "rose",
};

export default function PrintOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const page = await printApi.list({ size: 20 });
      setOrders(page.content || []);
    } catch (err) {
      toast.error("Couldn't load orders", friendly(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-28">
      <Seo title="My 3D print orders" noindex />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-app-text">
          <Printer className="h-7 w-7 text-brand-violet" /> 3D print orders
        </h1>
        <div className="flex gap-2">
          <Link to="/membership">
            <Button variant="ghost" size="sm" icon={WalletIcon}>
              Membership
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
      ) : orders.length === 0 ? (
        <div className="glass-strong rounded-3xl p-10 text-center text-app-muted">
          <Printer className="mx-auto mb-3 h-10 w-10 text-app-faint" />
          <p>No print orders yet.</p>
          <p className="mt-1 text-sm text-app-faint">
            Open a finished model in the Studio and tap “Order 3D print”.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="glass-strong flex items-center justify-between gap-4 rounded-2xl p-4 shadow-card"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[o.status] || "violet"}>{o.status}</Badge>
                  <span className="truncate text-xs text-app-faint">#{o.id.slice(0, 8)}</span>
                </div>
                <p className="mt-1 text-xs text-app-faint">
                  {new Date(o.createdAt).toLocaleString()}
                  {o.note ? ` · ${o.note}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-semibold text-app-text">{vnd.format(o.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
