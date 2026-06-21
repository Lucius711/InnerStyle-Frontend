import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

/**
 * Intro splash shown on every page load.
 * Reveals the logo with a smooth fade + scale over a luxurious,
 * sparkling backdrop, then fades out into the app.
 */
export default function SplashScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [show, setShow] = useState(true);

  // Stable, scattered sparkle positions (computed once).
  const sparkles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 1.8,
        duration: 1.4 + Math.random() * 1.6,
      })),
    []
  );

  useEffect(() => {
    if (!show) return;
    // Lock scroll while the splash is visible.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setShow(false), 2900);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prev;
    };
  }, [show]);

  const src = isDark
    ? "/innerstyle_logo_breakthrough_dark.svg"
    : "/innerstyle_logo_light.svg";

  const sparkleColor = isDark ? "#e9d5ff" : "#a855f7";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 120% 90% at 50% 50%, #14122b 0%, #0a0b14 45%, #05060c 100%)"
              : "radial-gradient(ellipse 120% 90% at 50% 50%, #ffffff 0%, #f5f2ff 50%, #ece7fb 100%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Drifting soft color orbs */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute h-[42vw] w-[42vw] rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(124,92,255,0.55), transparent 70%)",
              top: "8%",
              left: "12%",
            }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute h-[38vw] w-[38vw] rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(34,211,238,0.45), transparent 70%)",
              bottom: "6%",
              right: "10%",
            }}
            animate={{ x: [0, -50, 0], y: [0, -25, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Rotating conic halo behind the logo */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute rounded-full blur-3xl"
            style={{
              width: "min(640px, 86vw)",
              height: "min(640px, 86vw)",
              background:
                "conic-gradient(from 0deg, #7c5cff, #22d3ee, #d946ef, #7c5cff)",
              opacity: isDark ? 0.38 : 0.22,
            }}
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: [0.85, 1.05, 0.95], rotate: 360 }}
            transition={{
              rotate: { duration: 14, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
          />

          {/* Twinkling sparkles */}
          {sparkles.map((s) => (
            <motion.span
              key={s.id}
              aria-hidden
              className="pointer-events-none absolute rounded-full"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                background: sparkleColor,
                boxShadow: `0 0 ${s.size * 2.5}px ${sparkleColor}`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                repeatDelay: Math.random(),
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Logo */}
          <motion.img
            src={src}
            alt="InnerStyle"
            draggable={false}
            className="relative z-10 w-[520px] max-w-[88vw] select-none"
            style={{
              filter: isDark
                ? "drop-shadow(0 8px 50px rgba(124,92,255,0.55))"
                : "drop-shadow(0 8px 40px rgba(124,92,255,0.30))",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
