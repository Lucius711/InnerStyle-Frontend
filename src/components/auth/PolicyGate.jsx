import { useEffect, useRef, useState } from "react";
import { ScrollText } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/hooks/useToast";
import { authApi } from "@/lib/authApi";

/**
 * Blocking Terms & Policies dialog. Shown for any signed-in customer whose profile says
 * `policyAccepted: false` — i.e. first sign-in (any login method) or after the backend bumps
 * `app.auth.policy-version`. It has no close button, no backdrop/Esc dismissal: the only way
 * out is scrolling to the end, ticking the checkbox and pressing Continue.
 */
export default function PolicyGate() {
  const { user, refreshUser } = useAuth();
  const mustAccept =
    !!user && Array.isArray(user.roles) && user.roles.includes("USER") && user.policyAccepted === false;
  return mustAccept ? <PolicyDialog version={user.policyVersion} onAccepted={refreshUser} /> : null;
}

function PolicyDialog({ version, onAccepted }) {
  const { t, tServer } = useI18n();
  const toast = useToast();
  const scrollRef = useRef(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const sections = t("policy.sections");

  const checkEnd = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setReachedEnd(true);
  };
  // Short content on a tall screen never scrolls — treat "fits entirely" as read.
  useEffect(checkEnd, []);

  const accept = async () => {
    setSaving(true);
    try {
      await authApi.acceptPolicy(version);
      await onAccepted();
    } catch (err) {
      toast.error(t("policy.saveFailed"), tServer(err.message));
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="glass-strong relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl shadow-card">
        <div className="flex items-start gap-3 border-b border-app-line/10 p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-violet/15 text-brand-violet">
            <ScrollText className="h-5 w-5" />
          </span>
          <div>
            <h2 id="policy-title" className="font-display text-xl font-bold text-app-text">
              {t("policy.title")}
            </h2>
            <p className="mt-1 text-sm text-app-muted">{t("policy.subtitle")}</p>
            <p className="mt-1 text-xs text-app-faint">{t("policy.version", { version })}</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={checkEnd}
          tabIndex={0}
          className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-app-muted"
        >
          {Array.isArray(sections) &&
            sections.map((s) => (
              <section key={s.title}>
                <h3 className="mb-2 font-semibold text-app-text">{s.title}</h3>
                <ul className="list-disc space-y-1.5 pl-5">
                  {s.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ))}
        </div>

        <div className="space-y-4 border-t border-app-line/10 p-6">
          {!reachedEnd && <p className="text-xs text-app-faint">{t("policy.scrollHint")}</p>}
          <label
            className={`flex items-start gap-3 text-sm ${
              reachedEnd ? "cursor-pointer text-app-text" : "cursor-not-allowed text-app-faint"
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-brand-violet"
              disabled={!reachedEnd}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            {t("policy.agree")}
          </label>
          <div className="flex justify-end">
            <Button onClick={accept} disabled={!reachedEnd || !checked} loading={saving}>
              {t("policy.continue")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
