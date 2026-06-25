import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/hooks/useI18n";

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-app-line/10 py-3.5 last:border-0">
      <span className="text-sm text-app-muted">{label}</span>
      <span className="text-right text-sm font-medium text-app-text">{children}</span>
    </div>
  );
}

/** Personal information from the authenticated account (GET /account/me). */
export default function Profile() {
  const t = useT();
  const { user } = useAuth();
  if (!user) return null;

  const created = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—";

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-lg font-semibold text-app-text">{t("profile.info.title")}</h2>
      <div className="rounded-2xl border border-app-line/10 bg-app-line/[0.03] px-5">
        <Row label={t("profile.info.fullName")}>{user.fullName || t("profile.info.noName")}</Row>
        <Row label={t("profile.info.email")}>{user.email}</Row>
        <Row label={t("profile.info.emailVerified")}>
          {user.emailVerified ? (
            <Badge tone="emerald">
              <ShieldCheck className="h-3 w-3" /> {t("profile.info.verified")}
            </Badge>
          ) : (
            <Badge tone="amber">
              <ShieldAlert className="h-3 w-3" /> {t("profile.info.unverified")}
            </Badge>
          )}
        </Row>
        <Row label={t("profile.info.status")}>{user.status}</Row>
        <Row label={t("profile.info.roles")}>{(user.roles || []).join(", ") || "—"}</Row>
        <Row label={t("profile.info.memberSince")}>{created}</Row>
      </div>
    </div>
  );
}
