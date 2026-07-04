import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** True on phones/small screens — used to drop expensive animated blur on mobile. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  return mobile;
}

/**
 * Fixed, full-viewport ambient background:
 *  - animated gradient blobs (aurora) — subtler in light mode
 *  - floating orbs
 * Rendered once behind everything. Pointer-events disabled.
 *
 * On mobile (and with reduced-motion) the blobs are STATIC with a much smaller blur and the
 * orbs are dropped: iOS Safari re-rasterizes a large CSS blur every frame while it animates,
 * which janks the whole page. A static, lighter blur keeps the look without the per-frame cost.
 */
export default function AnimatedBackground() {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const lite = reduce || mobile;

  const blob = (anim) =>
    lite ? {} : { animate: anim, transition: { duration: 18, repeat: Infinity, ease: "easeInOut" } };
  // Big soft blur on desktop; a much cheaper radius on mobile.
  const b = (desktop, mobileClass) => (mobile ? mobileClass : desktop);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-app-bg">
      {/* aurora blobs — much softer in light mode to avoid a washed-out look */}
      <motion.div
        className={`absolute -left-32 -top-32 h-[42rem] w-[42rem] rounded-full bg-brand-violet/10 dark:bg-brand-violet/25 ${b("blur-[150px]", "blur-[70px]")}`}
        {...blob({ x: [0, 80, -40, 0], y: [0, 60, -30, 0], scale: [1, 1.12, 0.95, 1] })}
      />
      <motion.div
        className={`absolute right-[-12rem] top-1/4 h-[38rem] w-[38rem] rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/20 ${b("blur-[160px]", "blur-[70px]")}`}
        {...blob({ x: [0, -70, 30, 0], y: [0, -50, 40, 0], scale: [1, 0.9, 1.1, 1] })}
      />
      <motion.div
        className={`absolute bottom-[-14rem] left-1/3 h-[40rem] w-[40rem] rounded-full bg-brand-fuchsia/[0.06] dark:bg-brand-fuchsia/15 ${b("blur-[170px]", "blur-[70px]")}`}
        {...blob({ x: [0, 50, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.08, 0.92, 1] })}
      />

      {/* floating orbs — desktop only (skip the extra animated layers on mobile) */}
      {!lite &&
        ORBS.map((o, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: o.left,
              top: o.top,
              width: o.size,
              height: o.size,
              background: o.color,
              boxShadow: `0 0 ${o.size} ${o.color}`,
            }}
            animate={{ y: [0, -28, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
          />
        ))}

      {/* vignette — dark theme only */}
      <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(5,6,12,0.7)_100%)] dark:block" />
    </div>
  );
}

const ORBS = [
  { left: "12%", top: "30%", size: "8px", color: "#7c5cff", dur: 6, delay: 0 },
  { left: "82%", top: "22%", size: "6px", color: "#22d3ee", dur: 7, delay: 1.2 },
  { left: "68%", top: "62%", size: "10px", color: "#d946ef", dur: 8, delay: 0.6 },
  { left: "30%", top: "72%", size: "5px", color: "#5b6cff", dur: 6.5, delay: 1.8 },
  { left: "48%", top: "16%", size: "7px", color: "#22d3ee", dur: 7.5, delay: 0.3 },
];
