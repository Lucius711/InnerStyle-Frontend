import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Wallet,
  LogIn,
  LogOut,
  User,
  Boxes,
  Printer,
  ChevronDown,
} from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useT } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const t = useT();
  const { isAuthenticated, user, logout } = useAuth();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();

  const onLogout = async () => {
    try {
      await logout();
      toast.success(t("nav.logout"));
    } catch {
      toast.error("Sign out failed");
    }
  };

  const links = [
    { label: t("nav.how"), href: "/#how" },
    { label: t("nav.features"), href: "/#features" },
    { label: t("nav.showcase"), href: "/#showcase" },
  ];

  const accountLinks = [
    { to: "/profile", icon: User, label: t("nav.profile") },
    { to: "/my-3d-printing", icon: Boxes, label: t("nav.myModels") },
    { to: "/print-history", icon: Printer, label: t("nav.printHistory") },
    { to: "/membership", icon: Wallet, label: t("nav.membership") },
  ];

  const initial = (user?.fullName || user?.email || "?").charAt(0).toUpperCase();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6",
          scrolled ? "glass-strong shadow-card" : "border border-transparent"
        )}
      >
        <Link to="/" className="group flex items-center">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-app-muted transition-colors hover:text-app-text"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <MagneticButton as="div">
                <Link to="/studio">
                  <Button size="sm" icon={Sparkles}>
                    {t("nav.start")}
                  </Button>
                </Link>
              </MagneticButton>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="focus-ring flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-app-line/5"
                  aria-label={t("nav.account")}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={t("nav.account")}
                      className="h-8 w-8 rounded-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7c5cff,#5b6cff)] text-sm font-bold text-white">
                      {initial}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-app-muted" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="glass-strong absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-card"
                    >
                      <div className="border-b border-app-line/10 px-3 py-2">
                        <p className="truncate text-sm font-medium text-app-text">
                          {user?.fullName || t("profile.info.noName")}
                        </p>
                        <p className="truncate text-xs text-app-faint">{user?.email}</p>
                      </div>
                      <div className="mt-1 flex flex-col">
                        {accountLinks.map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-line/5 hover:text-app-text"
                          >
                            <Icon className="h-4 w-4" /> {label}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={onLogout}
                          className="mt-1 flex items-center gap-2.5 rounded-lg border-t border-app-line/10 px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:bg-app-line/5 hover:text-app-text"
                        >
                          <LogOut className="h-4 w-4" /> {t("nav.logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-app-muted transition-colors hover:text-app-text"
              >
                <LogIn className="h-4 w-4" /> {t("nav.login")}
              </Link>
              <MagneticButton as="div">
                <Link to="/register">
                  <Button size="sm" icon={Sparkles}>
                    {t("nav.start")}
                  </Button>
                </Link>
              </MagneticButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            className="focus-ring rounded-lg p-2 text-app-text"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong absolute inset-x-4 top-20 rounded-2xl p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-app-muted hover:bg-app-line/5 hover:text-app-text"
                >
                  {l.label}
                </a>
              ))}
              {isAuthenticated &&
                accountLinks.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-app-muted hover:bg-app-line/5 hover:text-app-text"
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-3 text-sm font-medium text-app-muted hover:bg-app-line/5 hover:text-app-text"
                >
                  {t("nav.login")}
                </Link>
              )}
              <Link to={isAuthenticated ? "/studio" : "/register"} className="mt-2">
                <Button className="w-full" icon={Sparkles}>
                  {t("nav.start")}
                </Button>
              </Link>
              {isAuthenticated && (
                <Button className="mt-2 w-full" variant="ghost" icon={LogOut} onClick={onLogout}>
                  {t("nav.logout")}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Logo() {
  const { theme } = useTheme();
  const src =
    theme === "dark"
      ? "/innerstyle_logo_breakthrough_dark.svg"
      : "/innerstyle_logo_light.svg";
  return (
    <img
      src={src}
      alt="InnerStyle"
      className="h-14 w-auto select-none sm:h-16"
      draggable={false}
    />
  );
}
