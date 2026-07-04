import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Cuboid, Loader2, ScanLine, View } from "lucide-react";
import { useT } from "@/hooks/useI18n";
import {
  loadModelViewer,
  makeQrDataUrl,
  ensureUsdzUrl,
  isMobileDevice,
  arPageUrl,
} from "@/lib/ar";

/**
 * "View in your room" AR preview. On a phone it shows a <model-viewer> with a big
 * AR launch button (Android Scene Viewer + iOS Quick Look). On desktop — where AR can't
 * run — it shows the 3D model plus a QR code that opens the standalone /ar/:taskId page
 * on the user's phone.
 */
export default function ArPreview({ open, onClose, glbUrl, taskId, posterUrl }) {
  const t = useT();
  const [ready, setReady] = useState(false);
  const [usdzUrl, setUsdzUrl] = useState(null);
  const [qr, setQr] = useState(null);
  const mobile = useRef(isMobileDevice());

  // Load the model-viewer element once the dialog opens.
  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    loadModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setReady(false));
    return () => {
      alive = false;
    };
  }, [open]);

  // Phones: resolve a real USDZ URL so iOS gets Quick Look (it can't open a blob:). Desktop:
  // build the QR for the phone.
  useEffect(() => {
    if (!open || !glbUrl) return undefined;
    let alive = true;

    if (mobile.current) {
      ensureUsdzUrl(taskId, glbUrl)
        .then((u) => alive && setUsdzUrl(u))
        .catch(() => alive && setUsdzUrl(null));
    } else {
      makeQrDataUrl(arPageUrl(taskId))
        .then((d) => alive && setQr(d))
        .catch(() => alive && setQr(null));
    }

    return () => {
      alive = false;
      setUsdzUrl(null);
    };
  }, [open, glbUrl, taskId]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-app-line/10 bg-app-surface shadow-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-app-line/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-violet/15 text-brand-violet">
                  <View className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-app-text">{t("studio.ar.title")}</h3>
                  <p className="text-[11px] text-app-faint">{t("studio.ar.subtitle")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-app-muted transition-colors hover:bg-app-line/10 hover:text-app-text"
                aria-label={t("studio.ar.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
              {!ready ? (
                <div className="flex h-72 flex-col items-center justify-center gap-3 text-app-muted">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-violet" />
                  <span className="text-xs">{t("studio.ar.loading")}</span>
                </div>
              ) : mobile.current ? (
                <MobileAr glbUrl={glbUrl} usdzUrl={usdzUrl} posterUrl={posterUrl} t={t} />
              ) : (
                <DesktopAr glbUrl={glbUrl} posterUrl={posterUrl} qr={qr} t={t} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* Phone: model-viewer with a prominent AR launch button. */
function MobileAr({ glbUrl, usdzUrl, posterUrl, t }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-app-line/10 bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
        {/* eslint-disable-next-line react/no-unknown-property */}
        <model-viewer
          src={glbUrl}
          ios-src={usdzUrl || undefined}
          poster={posterUrl || undefined}
          ar="true"
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls="true"
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1.05"
          style={{ width: "100%", height: "60vh", maxHeight: "460px", backgroundColor: "transparent" }}
        >
          <button slot="ar-button" className="ar-launch-btn">
            <Smartphone className="h-5 w-5" /> {t("studio.ar.launch")}
          </button>
        </model-viewer>
      </div>
      <p className="text-center text-xs text-app-faint">{t("studio.ar.mobileHint")}</p>
      <style>{`
        .ar-launch-btn {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; border: none; border-radius: 9999px;
          background: #7c5cff; color: #fff; font-size: 14px; font-weight: 600;
          box-shadow: 0 8px 24px rgba(124,92,255,.4); cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* Desktop: 3D model + QR to open the AR page on a phone. */
function DesktopAr({ glbUrl, posterUrl, qr, t }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-2xl border border-app-line/10 bg-[radial-gradient(ellipse_at_center,#1b2030,#070810)]">
        {/* eslint-disable-next-line react/no-unknown-property */}
        <model-viewer
          src={glbUrl}
          poster={posterUrl || undefined}
          camera-controls="true"
          auto-rotate="true"
          shadow-intensity="1"
          exposure="1.05"
          style={{ width: "100%", height: "46vh", minHeight: "300px", backgroundColor: "transparent" }}
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-app-line/10 bg-app-line/[0.03] p-5 text-center">
        <span className="flex items-center gap-1.5 text-sm font-medium text-app-text">
          <ScanLine className="h-4 w-4 text-brand-violet" /> {t("studio.ar.scanTitle")}
        </span>
        <div className="rounded-2xl bg-white p-3 shadow-card">
          {qr ? (
            <img src={qr} alt="AR QR code" width={196} height={196} className="block h-44 w-44" />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-violet/70" />
            </div>
          )}
        </div>
        <p className="flex items-start gap-1.5 text-xs text-app-faint">
          <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t("studio.ar.scanHint")}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-app-faint">
          <Cuboid className="h-3 w-3" /> {t("studio.ar.deskNote")}
        </p>
      </div>
    </div>
  );
}
