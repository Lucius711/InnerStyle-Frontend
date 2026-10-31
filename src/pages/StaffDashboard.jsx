import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Download,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  ExternalLink,
  Truck,
  Cuboid,
  X,
} from "lucide-react";
import { zipSync, unzipSync } from "three/examples/jsm/libs/fflate.module.js";
import { buildModelFiles } from "@/lib/modelExport";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { Field, SelectMenu, TextInput, TextArea } from "@/components/ui/FormControls";
import PrintabilityCard from "@/components/studio/PrintabilityCard";
import OrderTracking from "@/components/print/OrderTracking";
import { staffApi } from "@/lib/authApi";
import { authedFetch } from "@/lib/http";
import { vnd } from "@/lib/pricing";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";
import ModelViewer from "@/components/three/ModelViewer";
import { api } from "@/lib/api";

/**
 * Fetch a staff-authed image URL and return a blob: URL the browser can load.
 * Needed because <img> doesn't send Authorization headers.
 */
function useAuthedImage(orderId, isPair = false) {
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    if (!orderId) return;
    let active = true;
    let url = null;
    // Go through authedFetch so a stale access token is transparently refreshed
    // (raw fetch here was the source of the 401s). 204/404 (no thumbnail) just
    // leaves the placeholder icon in place.
    authedFetch(`/api/staff/orders/${orderId}/thumbnail${isPair ? "?pair=true" : ""}`, { auth: true })
      .then((r) => (r.ok ? r.blob() : null))
      .then((blob) => {
        if (!active || !blob || blob.size === 0) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [orderId, isPair]);
  return blobUrl;
}

const STATUSES = ["", "PENDING", "PAID", "IN_PRODUCTION", "SHIPPED", "COMPLETED", "CANCELLED"];
const STATUS_TONE = {
  PAID: "emerald",
  PENDING: "amber",
  IN_PRODUCTION: "violet",
  SHIPPED: "cyan",
  COMPLETED: "emerald",
  CANCELLED: "rose",
};
// Statuses a staff member can advance an order to.
const NEXT_STATUSES = ["PAID", "IN_PRODUCTION", "SHIPPED", "COMPLETED", "CANCELLED"];

// All download formats available (matches user DownloadSettings).
const DOWNLOAD_FORMATS = ["bundle", "glb", "obj", "stl", "3mf", "usdz", "ply"];

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Staff fulfilment dashboard — every customer order with contact, address and model download. */
function OrderThumbnail({ orderId, isPair = false }) {
  const blobUrl = useAuthedImage(orderId, isPair);
  if (blobUrl) {
    return (
      <img
        src={blobUrl}
        alt=""
        className="h-16 w-16 shrink-0 rounded-xl border border-app-line/10 object-cover"
      />
    );
  }
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-app-line/10 bg-app-line/5">
      <Package className="h-6 w-6 text-app-faint" />
    </div>
  );
}

/** Full-screen 3D viewer of an order's model — the same viewer customers see (rotate, zoom, textured/clay). */
function OrderModelModal({ taskId, title, onClose }) {
  // Cache-bust per opening: staff may have just repaired the model in place.
  const [url] = useState(() => `${api.modelUrl(taskId, "glb")}&v=${Date.now()}`);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="glass-strong relative w-full max-w-4xl rounded-3xl p-4 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3 pr-1">
          <p className="truncate text-sm font-semibold text-app-text">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg p-1.5 text-app-faint transition hover:bg-app-line/10 hover:text-app-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ModelViewer url={url} className="h-[70vh] w-full" />
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const t = useT();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [viewing, setViewing] = useState(null); // { taskId, title } of the model open in the 3D viewer
  // Per-order selected format: { [orderId]: fmt }
  const [formatMap, setFormatMap] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await staffApi.listOrders({ size: 50, status: statusFilter || undefined });
      setOrders(page.content || []);
    } catch (err) {
      toast.error(t("staff.loadFail"), friendly(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const getFormat = (orderId) => formatMap[orderId] || "bundle";
  const setFormat = (orderId, fmt) => setFormatMap((m) => ({ ...m, [orderId]: fmt }));

  const download = async (order, isPair = false) => {
    if (!(isPair ? order.pairTaskId : order.sourceTaskId)) return;
    const fmt = getFormat(order.id);
    const key = order.id + fmt + (isPair ? "pair" : "");
    setBusyId(key);
    try {
      // The server streams a ZIP (model.glb + textures), not a raw GLB. Pull the
      // GLB entry out of the archive before saving/converting — otherwise the "PK"
      // zip bytes get fed to GLTFLoader/JSON.parse and blow up.
      const { blob: zipBlob } = await staffApi.downloadModel(order.id, "glb", isPair);
      const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()));
      const glbName = Object.keys(entries).find((n) => n.toLowerCase().endsWith(".glb"));
      if (!glbName) throw new Error(t("staff.downloadFail") || "No model found in archive");
      // The textures/ beside the GLB are the colour: Meshy GLBs often only link them by an
      // expired URL, so they must travel with (and be embedded into) every export.
      const texFiles = Object.fromEntries(
        Object.entries(entries).filter(([n]) => n.toLowerCase().startsWith("textures/"))
      );
      const files = await buildModelFiles(entries[glbName], texFiles, fmt);
      const name = `innerstyle-${order.id.slice(0, 8)}${isPair ? "-pair" : ""}`;
      if (fmt === "glb") {
        // Texture is embedded in the GLB itself, so a single file is enough.
        saveBlob(new Blob([files["model.glb"]], { type: "model/gltf-binary" }), `${name}.glb`);
      } else {
        saveBlob(new Blob([zipSync(files)], { type: "application/zip" }), `${name}.zip`);
      }
    } catch (err) {
      toast.error(t("staff.downloadFail"), friendly(err));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-28">
      {viewing && (
        <OrderModelModal taskId={viewing.taskId} title={viewing.title} onClose={() => setViewing(null)} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-app-text">
            <Package className="h-6 w-6 text-brand-violet" /> {t("staff.title")}
          </h1>
          <p className="mt-1 text-sm text-app-muted">{t("staff.subtitle")}</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={load}>
          {t("staff.refresh")}
        </Button>
      </div>

      {/* Status filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || "ALL"}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "border-brand-violet/60 bg-brand-violet/15 text-app-text"
                : "border-app-line/10 bg-app-line/[0.03] text-app-muted hover:text-app-text"
            }`}
          >
            {s || t("staff.all")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-app-muted" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-app-line/10 bg-app-line/[0.03] p-12 text-center text-app-muted">
          <Package className="mx-auto mb-3 h-10 w-10 text-app-faint" />
          <p>{t("staff.empty")}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => {
            const fmt = getFormat(o.id);
            const busy = busyId === o.id + fmt;
            return (
              <li
                key={o.id}
                className="rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="focus-ring rounded-xl"
                      disabled={!o.sourceTaskId}
                      onClick={() => setViewing({ taskId: o.sourceTaskId, title: t("staff.view3dTitle", { id: o.id.slice(0, 8) }) })}
                      aria-label={t("staff.view3d")}
                    >
                      <OrderThumbnail orderId={o.sourceTaskId ? o.id : null} />
                    </button>
                    {o.pairTaskId && (
                      <button
                        type="button"
                        className="focus-ring rounded-xl"
                        onClick={() => setViewing({ taskId: o.pairTaskId, title: `${t("staff.view3dTitle", { id: o.id.slice(0, 8) })} · ${t("staff.pairModel")}` })}
                        aria-label={t("staff.view3dPair")}
                      >
                        <OrderThumbnail orderId={o.id} isPair />
                      </button>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[o.status] || "violet"}>{o.status}</Badge>
                        <span className="text-xs text-app-faint">#{o.id.slice(0, 8)}</span>
                      </div>
                      <p className="mt-1 text-xs text-app-faint">
                        {new Date(o.createdAt).toLocaleString()} · {vnd.format(o.amount)}{o.sizeCm ? ` · ${o.sizeCm} cm` : ""}{o.material ? ` · ${o.material}` : ""}
                        {o.pairTaskId ? ` · ${t("staff.couple", { size: o.pairSizeCm })}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Download format selector + download button + status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-28">
                      <SelectMenu
                        value={fmt}
                        onChange={(v) => setFormat(o.id, v)}
                        options={DOWNLOAD_FORMATS.map((f) => ({ value: f, label: f === "bundle" ? t("studio.bundleFormat") : f.toUpperCase() }))}
                        searchable={false}
                      />
                    </div>
                    {fmt === "stl" && (
                      <span className="text-[11px] text-amber-400">{t("studio.stlTextureNote")}</span>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Cuboid}
                      disabled={!o.sourceTaskId}
                      onClick={() => setViewing({ taskId: o.sourceTaskId, title: t("staff.view3dTitle", { id: o.id.slice(0, 8) }) })}
                    >
                      {t("staff.view3d")}
                    </Button>
                    {o.pairTaskId && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Cuboid}
                        onClick={() => setViewing({ taskId: o.pairTaskId, title: `${t("staff.view3dTitle", { id: o.id.slice(0, 8) })} · ${t("staff.pairModel")}` })}
                      >
                        {t("staff.view3dPair")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={busy ? Loader2 : Download}
                      loading={busy}
                      disabled={!o.sourceTaskId || !!busyId}
                      onClick={() => download(o)}
                    >
                      {t("staff.download") || "Tải xuống"}
                    </Button>
                    {o.pairTaskId && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={busyId === o.id + fmt + "pair" ? Loader2 : Download}
                        loading={busyId === o.id + fmt + "pair"}
                        disabled={!!busyId}
                        onClick={() => download(o, true)}
                      >
                        {t("staff.downloadPair")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={trackId === o.id ? "primary" : "ghost"}
                      icon={Truck}
                      onClick={() => setTrackId(trackId === o.id ? "" : o.id)}
                      aria-expanded={trackId === o.id}
                    >
                      {t("staff.updateProgress")}
                    </Button>
                  </div>
                </div>

                {/* Customer + shipping details */}
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-app-line/[0.03] p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-app-faint">
                      {t("staff.recipient")}
                    </p>
                    <p className="flex items-center gap-2 text-app-text">
                      <User className="h-3.5 w-3.5 text-app-faint" /> {o.recipientName || "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-app-muted">
                      <Phone className="h-3.5 w-3.5 text-app-faint" /> {o.recipientPhone || "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 break-all text-app-muted">
                      <Mail className="h-3.5 w-3.5 text-app-faint" /> {o.recipientEmail || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-app-line/[0.03] p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-app-faint">
                      {t("staff.shipTo")}
                    </p>
                    <p className="flex items-start gap-2 text-app-text">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-app-faint" />
                      <span>
                        {[o.addressDetail, o.wardName, o.provinceName].filter(Boolean).join(", ") || "—"}
                      </span>
                    </p>
                    {o.latitude != null && o.longitude != null && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${o.latitude},${o.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs text-brand-violet hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> {t("staff.viewMap")}
                      </a>
                    )}
                  </div>
                </div>

                {(o.withLight || o.withCard) && (
                  <div className="mt-2 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs text-app-muted">
                    <span className="font-medium text-app-text">{t("staff.extras")}:</span>{" "}
                    {[o.withLight && t("staff.light"), o.withCard && t("staff.card")].filter(Boolean).join(" · ")}
                    {o.withCard && o.cardMessage && (
                      <p className="mt-1 whitespace-pre-wrap italic text-app-text">“{o.cardMessage}”</p>
                    )}
                  </div>
                )}
                {o.note && (
                  <p className="mt-2 text-xs text-app-faint">
                    <span className="font-medium text-app-muted">{t("staff.note")}:</span> {o.note}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-app-faint">
                  {t("staff.placedBy")}: {o.customerName || o.customerEmail || "—"}
                </p>

                {trackId === o.id && (
                  <TrackingPanel
                    order={o}
                    onUpdated={(u) => setOrders((list) => list.map((x) => (x.id === u.id ? { ...x, ...u } : x)))}
                  />
                )}

                {/* 3D-print readiness: check + auto-fix the model in place before printing. */}
                {o.sourceTaskId && (
                  <div className="mt-3">
                    <PrintabilityCard
                      checkFn={() => staffApi.printability(o.id)}
                      repairFn={() => staffApi.repairModel(o.id)}
                      revertFn={() => staffApi.revertModel(o.id)}
                    />
                  </div>
                )}
                {o.pairTaskId && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-app-faint">
                      {t("staff.pairModel")}
                    </p>
                    <PrintabilityCard
                      checkFn={() => staffApi.printability(o.id, true)}
                      repairFn={() => staffApi.repairModel(o.id, true)}
                      revertFn={() => staffApi.revertModel(o.id, true)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Staff "update progress" panel: pick the next status (or keep it to post a plain note), add a
 * note the customer sees on their tracking timeline, and set carrier + tracking code.
 */
function TrackingPanel({ order, onUpdated }) {
  const t = useT();
  const toast = useToast();
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState("");
  const [carrier, setCarrier] = useState(order.carrier || "");
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || "");
  const [tracking, setTracking] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTracking = useCallback(() => {
    staffApi.tracking(order.id).then(setTracking).catch((err) => toast.error(t("tracking.loadFail"), friendly(err)));
  }, [order.id, t, toast]);

  useEffect(() => {
    loadTracking();
  }, [loadTracking]);

  const nothingToSave =
    status === order.status && !note.trim() && carrier === (order.carrier || "") && trackingCode === (order.trackingCode || "");

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await staffApi.updateStatus(order.id, { status, note, carrier, trackingCode });
      onUpdated(updated);
      setNote("");
      loadTracking();
      toast.success(t("staff.statusUpdated"), `${order.id.slice(0, 8)} → ${updated.status}`);
    } catch (err) {
      toast.error(t("staff.statusFail"), friendly(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 grid gap-5 rounded-2xl border border-app-line/10 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form onSubmit={save} className="space-y-3">
        <Field label={t("staff.progressStatus")}>
          <div className="flex flex-wrap gap-1.5">
            {NEXT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  status === s ? "border-brand-violet bg-brand-violet/10 text-app-text" : "border-app-line/15 text-app-muted hover:text-app-text"
                }`}
              >
                {t(`tracking.steps.${s}`)}
              </button>
            ))}
          </div>
        </Field>
        <Field label={t("staff.progressNote")} hint={`${note.length}/500`}>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="min-h-[70px]"
            placeholder={t("staff.progressNotePlaceholder")}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("tracking.carrier")}>
            <TextInput value={carrier} onChange={(e) => setCarrier(e.target.value)} maxLength={100} placeholder={t("staff.carrierPlaceholder")} />
          </Field>
          <Field label={t("tracking.trackingCode")}>
            <TextInput value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} maxLength={100} />
          </Field>
        </div>
        <Button type="submit" size="sm" loading={saving} disabled={saving || nothingToSave}>
          {t("staff.saveProgress")}
        </Button>
      </form>
      <div className="min-w-0">
        {tracking ? <OrderTracking data={tracking} /> : <Loader2 className="h-5 w-5 animate-spin text-app-muted" />}
      </div>
    </div>
  );
}
