import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/hooks/useI18n";

const PAD = 8; // breathing room around the highlighted element
const CARD_W = 340;

/**
 * Step-by-step spotlight tour. Each step targets a real element via a CSS
 * selector (e.g. `[data-tour="mode"]`); the rest of the screen is dimmed while
 * a ring highlights the target and a tooltip card explains it. If a target is
 * missing (e.g. the user switched modes) the card falls back to screen-centre.
 *
 * Fully theme-aware: the card uses `glass-strong` + app tokens so it reads
 * correctly in both the light and dark palettes.
 */
export default function GuidedTour({ steps, open, onClose }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const measure = useCallback(() => {
    const el = step?.selector ? document.querySelector(step.selector) : null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // Restart from the first step whenever the tour is (re)opened.
  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  // On each step: scroll the target into view, then measure once it settles.
  useEffect(() => {
    if (!open) return undefined;
    const el = step?.selector ? document.querySelector(step.selector) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const id = setTimeout(measure, 320);
    return () => clearTimeout(id);
  }, [open, index, step, measure]);

  // Keep the highlight aligned while the page scrolls or resizes.
  useEffect(() => {
    if (!open) return undefined;
    const onMove = () => measure();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, measure]);

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && !isLast) setIndex((i) => i + 1);
      else if (e.key === "ArrowLeft" && index > 0) setIndex((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isLast, index, onClose]);

  if (!open || !step) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  let cardStyle;
  if (rect) {
    const spaceBelow = vh - (rect.top + rect.height);
    const placeBelow = spaceBelow > 240 || rect.top < 240;
    let left = rect.left + rect.width / 2 - CARD_W / 2;
    left = Math.max(16, Math.min(left, vw - CARD_W - 16));
    cardStyle = placeBelow
      ? { top: rect.top + rect.height + PAD + 14, left, transform: "none" }
      : { top: rect.top - PAD - 14, left, transform: "translateY(-100%)" };
  } else {
    cardStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setIndex((i) => Math.max(i - 1, 0));

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      {/* Click blocker — absorbs interaction with the page during the tour. */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Spotlight: a ring whose huge box-shadow dims everything outside it. */}
      {rect ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-brand-violet/80"
          initial={false}
          animate={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          style={{ boxShadow: "0 0 0 9999px rgba(2,4,10,0.72)" }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(2,4,10,0.72)" }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="glass-menu pointer-events-auto fixed w-[340px] max-w-[calc(100vw-32px)] rounded-2xl p-5 shadow-card"
          style={cardStyle}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-violet/15 px-2.5 py-1 text-xs font-semibold text-brand-violet">
              {t("studio.tour.step")} {index + 1}/{steps.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("studio.tour.skip")}
              className="focus-ring -mr-1 -mt-1 rounded-lg p-1 text-app-faint transition-colors hover:text-app-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="mt-3 font-display text-lg font-semibold text-app-text">
            {t(step.title)}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-app-muted">{t(step.body)}</p>

          <div className="mt-4 flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-5 bg-brand-violet" : "w-1.5 bg-app-line/20"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-app-faint transition-colors hover:text-app-muted"
            >
              {t("studio.tour.skip")}
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={back}>
                  {t("studio.tour.back")}
                </Button>
              )}
              {isLast ? (
                <Button size="sm" icon={Check} onClick={onClose}>
                  {t("studio.tour.done")}
                </Button>
              ) : (
                <Button size="sm" iconRight={ChevronRight} onClick={next}>
                  {t("studio.tour.next")}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
