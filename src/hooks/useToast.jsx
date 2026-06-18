import {
  createContext,
  useCallback as useCb,
  useContext,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const TONE = {
  success: "text-emerald-400",
  error: "text-rose-400",
  info: "text-brand-cyan",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCb((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCb(
    (toast) => {
      const id = ++seq.current;
      const item = { id, type: "info", duration: 4500, ...toast };
      setToasts((t) => [...t, item]);
      if (item.duration > 0) {
        setTimeout(() => dismiss(id), item.duration);
      }
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (title, message) => push({ type: "success", title, message }),
    error: (title, message) => push({ type: "error", title, message }),
    info: (title, message) => push({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 shadow-glow"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${TONE[t.type]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-app-text">{t.title}</p>
                  {t.message && (
                    <p className="mt-0.5 text-sm text-app-muted">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-lg p-1 text-app-faint transition hover:bg-app-line/10 hover:text-app-text"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
