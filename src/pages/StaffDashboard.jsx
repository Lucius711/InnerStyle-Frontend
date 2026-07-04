import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronDown,
  Check,
} from "lucide-react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { export3mf } from "@/lib/export3mf";
import { zipSync, unzipSync, strToU8 } from "three/examples/jsm/libs/fflate.module.js";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { Field, SelectMenu } from "@/components/ui/FormControls";
import PrintabilityCard from "@/components/studio/PrintabilityCard";
import { staffApi } from "@/lib/authApi";
import { authedFetch } from "@/lib/http";
import { vnd } from "@/lib/pricing";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/hooks/useI18n";
import { friendly } from "@/lib/messages";

/**
 * Fetch a staff-authed image URL and return a blob: URL the browser can load.
 * Needed because <img> doesn't send Authorization headers.
 */
function useAuthedImage(orderId) {
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    if (!orderId) return;
    let active = true;
    let url = null;
    // Go through authedFetch so a stale access token is transparently refreshed
    // (raw fetch here was the source of the 401s). 204/404 (no thumbnail) just
    // leaves the placeholder icon in place.
    authedFetch(`/api/staff/orders/${orderId}/thumbnail`, { auth: true })
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
  }, [orderId]);
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
const DOWNLOAD_FORMATS = ["glb", "obj", "stl", "3mf", "usdz", "ply"];

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

function toU8(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === "string") return strToU8(data);
  return new Uint8Array(data);
}

/** Convert a GLB blob to another format entirely in the browser. */
async function convertFromGlb(glbBlob, fmt) {
  const arrayBuffer = await glbBlob.arrayBuffer();
  const loader = new GLTFLoader();
  const gltf = await new Promise((resolve, reject) =>
    loader.parse(arrayBuffer, "", resolve, reject)
  );
  const scene = gltf.scene || gltf.scenes?.[0];
  scene.updateMatrixWorld(true);
  if (fmt === "obj") return { data: new OBJExporter().parse(scene), type: "text/plain" };
  if (fmt === "stl") return { data: new STLExporter().parse(scene, { binary: true }), type: "model/stl" };
  if (fmt === "3mf") return export3mf(scene);
  if (fmt === "usdz") return { data: await new USDZExporter().parseAsync(scene), type: "model/vnd.usdz+zip" };
  if (fmt === "ply") {
    return new Promise((resolve, reject) => {
      try {
        new PLYExporter().parse(
          scene,
          (res) => resolve({ data: res, type: "application/octet-stream" }),
          { binary: true }
        );
      } catch (e) { reject(e); }
    });
  }
  throw new Error("unsupported format");
}

/** Staff fulfilment dashboard — every customer order with contact, address and model download. */
function OrderThumbnail({ orderId }) {
  const blobUrl = useAuthedImage(orderId);
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

export default function StaffDashboard() {
  const t = useT();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState("");
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

  const getFormat = (orderId) => formatMap[orderId] || "glb";
  const setFormat = (orderId, fmt) => setFormatMap((m) => ({ ...m, [orderId]: fmt }));

  const download = async (order) => {
    if (!order.sourceTaskId) return;
    const fmt = getFormat(order.id);
    const key = order.id + fmt;
    setBusyId(key);
    try {
      // The server streams a ZIP (model.glb + textures), not a raw GLB. Pull the
      // GLB entry out of the archive before saving/converting — otherwise the "PK"
      // zip bytes get fed to GLTFLoader/JSON.parse and blow up.
      const { blob: zipBlob } = await staffApi.downloadModel(order.id, "glb");
      const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()));
      const glbName = Object.keys(entries).find((n) => n.toLowerCase().endsWith(".glb"));
      if (!glbName) throw new Error(t("staff.downloadFail") || "No model found in archive");
      const glbBlob = new Blob([entries[glbName]], { type: "model/gltf-binary" });

      if (fmt === "glb") {
        saveBlob(glbBlob, `innerstyle-${order.id.slice(0, 8)}.glb`);
        return;
      }

      // Convert in-browser from GLB to the requested format.
      const { data, type } = await convertFromGlb(glbBlob, fmt);
      const converted = data instanceof Blob ? data : new Blob([toU8(data)], { type });
      const files = { [`model.${fmt}`]: toU8(await converted.arrayBuffer()) };
      const zipped = zipSync(files);
      saveBlob(
        new Blob([zipped], { type: "application/zip" }),
        `innerstyle-${order.id.slice(0, 8)}.zip`
      );
    } catch (err) {
      toast.error(t("staff.downloadFail"), friendly(err));
    } finally {
      setBusyId("");
    }
  };

  const changeStatus = async (order, status) => {
    if (!status || status === order.status) return;
    setBusyId(order.id + "status");
    try {
      const updated = await staffApi.updateStatus(order.id, status);
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
      toast.success(t("staff.statusUpdated"), `${order.id.slice(0, 8)} → ${updated.status}`);
    } catch (err) {
      toast.error(t("staff.statusFail"), friendly(err));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-28">
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
                    <OrderThumbnail orderId={o.sourceTaskId ? o.id : null} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[o.status] || "violet"}>{o.status}</Badge>
                        <span className="text-xs text-app-faint">#{o.id.slice(0, 8)}</span>
                      </div>
                      <p className="mt-1 text-xs text-app-faint">
                        {new Date(o.createdAt).toLocaleString()} · {vnd.format(o.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Download format selector + download button + status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-28">
                      <SelectMenu
                        value={fmt}
                        onChange={(v) => setFormat(o.id, v)}
                        options={DOWNLOAD_FORMATS.map((f) => ({ value: f, label: f.toUpperCase() }))}
                        searchable={false}
                      />
                    </div>
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
                    <StatusMenu
                      current={o.status}
                      busy={busyId === o.id + "status"}
                      onSelect={(s) => changeStatus(o, s)}
                    />
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

                {o.note && (
                  <p className="mt-2 text-xs text-app-faint">
                    <span className="font-medium text-app-muted">{t("staff.note")}:</span> {o.note}
                  </p>
                )}
                <p className="mt-2 text-[11px] text-app-faint">
                  {t("staff.placedBy")}: {o.customerName || o.customerEmail || "—"}
                </p>

                {/* 3D-print readiness: check + auto-fix the model in place before printing. */}
                {o.sourceTaskId && (
                  <div className="mt-3">
                    <PrintabilityCard
                      checkFn={() => staffApi.printability(o.id)}
                      repairFn={() => staffApi.repairModel(o.id)}
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
 * Themed "advance status" dropdown. Replaces the native <select> (whose option list
 * the OS renders unstyled/greyed) with a fully theme-aware menu that works in both
 * the light and dark palettes via the app design tokens + glass-strong surface.
 */
function StatusMenu({ current, busy, onSelect }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = NEXT_STATUSES.filter((s) => s !== current);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="focus-ring flex items-center gap-1.5 rounded-lg border border-app-line/10 bg-app-line/5 px-2.5 py-1.5 text-xs font-medium text-app-muted transition-colors hover:text-app-text disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {t("staff.setStatus")}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="glass-menu absolute right-0 top-10 z-50 w-48 overflow-hidden rounded-2xl p-1.5 shadow-card"
          >
            {options.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSelect(s);
                  }}
                  className="flex w-full items-center rounded-xl px-2 py-1.5 transition-colors hover:bg-app-line/5"
                >
                  <Badge tone={STATUS_TONE[s] || "violet"}>{s}</Badge>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
