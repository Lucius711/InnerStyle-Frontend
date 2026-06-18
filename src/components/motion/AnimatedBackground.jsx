import { motion, useReducedMotion } from "framer-motion";

/**
 * Fixed, full-viewport ambient background:
 *  - animated gradient blobs (aurora) — subtler in light mode
 *  - floating orbs
 * Rendered once behind everything. Pointer-events disabled.
 */
export default function AnimatedBackground() {
  const reduce = useReducedMotion();

  const blob = (anim) =>
    reduce ? {} : { animate: anim, transition: { duration: 18, repeat: Infinity, ease: "easeInOut" } };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-app-bg">
      {/* aurora blobs — much softer in light mode to avoid a washed-out look */}
      <motion.div
        className="absolute -left-32 -top-32 h-[42rem] w-[42rem] rounded-full bg-brand-violet/10 blur-[150px] dark:bg-brand-violet/25"
        {...blob({ x: [0, 80, -40, 0], y: [0, 60, -30, 0], scale: [1, 1.12, 0.95, 1] })}
      />
      <motion.div
        className="absolute right-[-12rem] top-1/4 h-[38rem] w-[38rem] rounded-full bg-brand-cyan/10 blur-[160px] dark:bg-brand-cyan/20"
        {...blob({ x: [0, -70, 30, 0], y: [0, -50, 40, 0], scale: [1, 0.9, 1.1, 1] })}
      />
      <motion.div
        className="absolute bottom-[-14rem] left-1/3 h-[40rem] w-[40rem] rounded-full bg-brand-fuchsia/[0.06] blur-[170px] dark:bg-brand-fuchsia/15"
        {...blob({ x: [0, 50, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.08, 0.92, 1] })}
      />

      {/* floating orbs */}
      {!reduce &&
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
