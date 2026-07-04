import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "innerstyle-theme";

// Full-screen door transition timing (ms). Theme swaps while the doors are shut.
const CLOSE_MS = 420;
const HOLD_MS = 130;
const OPEN_MS = 420;

// Backdrop colors per target theme so the shut doors preview the next palette.
const PANEL = {
  dark: { from: "#0b0e17", to: "#05060c", text: "#eef1f8" },
  light: { from: "#ffffff", to: "#ebeef5", text: "#0f172a" },
};

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ----------------------------------------------- full-screen door transition */

function ThemeDoors({ transition }) {
  if (!transition) return null;
  const closing = transition.phase === "closing";
  const pal = PANEL[transition.to] || PANEL.dark;
  const D = CLOSE_MS / 1000;
  const ease = [0.7, 0, 0.3, 1];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden">
      {/* Left door */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ background: `linear-gradient(90deg, ${pal.to}, ${pal.from})` }}
        initial={{ x: "-100%" }}
        animate={{ x: closing ? "0%" : "-100%" }}
        transition={{ duration: D, ease }}
      />
      {/* Right door */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ background: `linear-gradient(-90deg, ${pal.to}, ${pal.from})` }}
        initial={{ x: "100%" }}
        animate={{ x: closing ? "0%" : "100%" }}
        transition={{ duration: D, ease }}
      />
      {/* Seam glow where the doors meet */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
        style={{ background: "linear-gradient(transparent, #5b6cff, transparent)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0.9 : 0 }}
        transition={{ duration: D * 0.6, ease }}
      />
      {/* Centered icon revealed while the doors are shut */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        style={{ color: pal.text }}
        initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
        animate={{
          scale: closing ? 1 : 0.3,
          opacity: closing ? 1 : 0,
          rotate: closing ? 0 : 45,
        }}
        transition={{ duration: D * 0.85, ease }}
      >
        <span
          className="absolute h-24 w-24 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(91,108,255,0.45), transparent 70%)" }}
        />
        {transition.to === "dark" ? (
          <Moon className="relative h-14 w-14" />
        ) : (
          <Sun className="relative h-14 w-14" />
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ provider */

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [transition, setTransition] = useState(null);
  const timers = useRef([]);

  // Apply the theme class to <html> before paint to avoid a flash.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Follow system changes only while the user hasn't picked explicitly.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setThemeState(e.matches ? "light" : "dark");
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Clear any pending transition timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  // Toggle with a full-screen "closing door" reveal. The theme swaps behind the
  // shut doors, so the page change itself is hidden until the doors reopen.
  const toggleTheme = useCallback(() => {
    if (transition) return; // ignore while a transition is running
    const next = theme === "dark" ? "light" : "dark";

    if (prefersReducedMotion()) {
      setTheme(next);
      return;
    }

    setTransition({ to: next, phase: "closing" });
    const t1 = setTimeout(() => {
      setTheme(next);
      setTransition({ to: next, phase: "opening" });
    }, CLOSE_MS + HOLD_MS);
    const t2 = setTimeout(() => setTransition(null), CLOSE_MS + HOLD_MS + OPEN_MS);
    timers.current = [t1, t2];
  }, [theme, setTheme, transition]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, transitioning: !!transition }}>
      {children}
      <ThemeDoors transition={transition} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
