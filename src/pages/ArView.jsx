import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Smartphone, Loader2, AlertTriangle, ArrowLeft, View } from "lucide-react";
import { api } from "@/lib/api";
import { loadModelViewer, ensureUsdzUrl } from "@/lib/ar";
import { useT } from "@/hooks/useI18n";
import Seo from "@/components/seo/Seo";

/**
 * Standalone, mobile-first AR page reached by scanning the QR (or visiting /ar/:taskId
 * directly on a phone). It loads the public model proxy GLB, builds a USDZ for iOS Quick
 * Look, and surfaces a full-width "View in your room" button that launches AR. The page is
 * intentionally chrome-free (no navbar/footer) so it feels like a native AR launcher.
 */
export default function ArView() {
  const { taskId } = useParams();
  const t = useT();
  const [ready, setReady] = useState(false);
  const [usdzUrl, setUsdzUrl] = useState(null);
  const [error, setError] = useState(false);
  const mvRef = useRef(null);

  const glbUrl = useMemo(() => (taskId ? api.modelUrl(taskId, "glb") : null), [taskId]);

  useEffect(() => {
    let alive = true;
    loadModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  // iOS Quick Look needs a real .usdz URL (not a blob:), so resolve/cache one via the backend.
  useEffect(() => {
    if (!glbUrl || !taskId) return undefined;
    let alive = true;
    ensureUsdzUrl(taskId, glbUrl)
      .then((u) => alive && setUsdzUrl(u))
      .catch(() => alive && setUsdzUrl(null));
    return () => {
      alive = false;
    };
  }, [glbUrl, taskId]);

  if (!taskId) {
    return <Centered icon={AlertTriangle} text={t("studio.ar.notFound")} t={t} />;
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-[radial-gradient(ellipse_at_top,#15182a,#06070d)]">
      {/* Per-user AR launcher — not indexable content. */}
      <Seo title="AR preview" noindex />
      {/* Slim top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> InnerStyle
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
          <View className="h-3.5 w-3.5" /> AR
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6">
        {error ? (
          <Centered icon={AlertTriangle} text={t("studio.ar.loadError")} t={t} bare />
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 text-white/70">
            <Loader2 className="h-7 w-7 animate-spin text-brand-violet" />
            <span className="text-sm">{t("studio.ar.loading")}</span>
          </div>
        ) : (
          <>
            <div className="w-full max-w-md flex-1 overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line react/no-unknown-property */}
              <model-viewer
                ref={mvRef}
                src={glbUrl}
                ios-src={usdzUrl || undefined}
                ar="true"
                ar-modes="webxr scene-viewer quick-look"
                ar-scale="auto"
                camera-controls="true"
                touch-action="pan-y"
                auto-rotate="true"
                shadow-intensity="1"
                exposure="1.05"
                style={{ width: "100%", height: "100%", minHeight: "55vh", backgroundColor: "transparent" }}
              >
                <button slot="ar-button" className="ar-page-btn">
                  <Smartphone className="h-5 w-5" /> {t("studio.ar.launch")}
                </button>
              </model-viewer>
            </div>
            <p className="mt-4 max-w-md text-center text-xs text-white/55">
              {t("studio.ar.pageHint")}
            </p>
          </>
        )}
      </div>

      <style>{`
        .ar-page-btn {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border: none; border-radius: 9999px;
          background: #7c5cff; color: #fff; font-size: 15px; font-weight: 700;
          box-shadow: 0 10px 30px rgba(124,92,255,.45); cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Centered({ icon: Icon, text, t, bare }) {
  const inner = (
    <div className="flex flex-col items-center gap-4 text-center text-white/75">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-7 w-7" />
      </span>
      <p className="max-w-xs text-sm">{text}</p>
      <Link to="/" className="text-sm font-medium text-brand-violet hover:underline">
        {t("notFound.back")}
      </Link>
    </div>
  );
  if (bare) return inner;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,#15182a,#06070d)] p-6">
      {inner}
    </div>
  );
}
