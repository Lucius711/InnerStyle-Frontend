import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

const ConfirmContext = createContext(null);

/**
 * Promise-based confirm dialog. Call `confirm({ title, message, confirmLabel, tone })` and await
 * the boolean result. Used to confirm wallet charges before creating models / placing print orders.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (opts) => new Promise((resolve) => setState({ ...opts, resolve })),
    []
  );

  const close = (value) => {
    setState((s) => {
      if (s) s.resolve(value);
      return null;
    });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => close(false)}
            />
            <motion.div
              className="glass-strong relative w-full max-w-sm rounded-2xl p-6 shadow-card"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-violet/15 text-brand-violet">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-app-text">
                    {state.title || "Confirm"}
                  </h3>
                  {state.message && (
                    <p className="mt-1 text-sm text-app-muted">{state.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => close(false)}>
                  {state.cancelLabel || "Cancel"}
                </Button>
                <Button
                  variant={state.tone === "danger" ? "danger" : "primary"}
                  size="sm"
                  onClick={() => close(true)}
                >
                  {state.confirmLabel || "Confirm"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}
