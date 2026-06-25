import { NavLink, Outlet } from "react-router-dom";
import { User, Boxes, Printer } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/profile", icon: User, key: "navProfile" },
  { to: "/my-3d-printing", icon: Boxes, key: "navModels" },
  { to: "/print-history", icon: Printer, key: "navPrints" },
];

/** Shared shell for the profile area: header + internal nav list + routed content. */
export default function ProfileLayout() {
  const t = useT();
  const { user } = useAuth();
  const name = user?.fullName || t("profile.info.noName");
  const initial = (user?.fullName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen px-6 pb-24 pt-28">
      <Seo title={t("profile.title")} noindex />
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={name}
              className="h-16 w-16 rounded-2xl object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c5cff,#5b6cff)] text-2xl font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight text-app-text">{name}</h1>
            <p className="truncate text-sm text-app-muted">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-1 border-b border-app-line/10">
          {NAV.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-b-2 border-brand-violet text-app-text"
                    : "text-app-muted hover:text-app-text"
                )
              }
            >
              <Icon className="h-4 w-4" /> {t(`profile.${key}`)}
            </NavLink>
          ))}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
