import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useT } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();

  const links = [
    { label: t("nav.how"), href: "/#how" },
    { label: t("nav.features"), href: "/#features" },
    { label: t("nav.showcase"), href: "/#showcase" },
  ];

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  useEffect(() => setOpen(false), [pathname]);

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
        <Link to="/" className="group flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight text-app-text">
            Inner<span className="text-gradient">Style</span>
          </span>
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
          <Link
            to="/gallery"
            className="rounded-lg px-4 py-2 text-sm font-medium text-app-muted transition-colors hover:text-app-text"
          >
            {t("nav.gallery")}
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <MagneticButton as="div">
            <Link to="/studio">
              <Button size="sm" icon={Sparkles}>
                {t("nav.start")}
              </Button>
            </Link>
          </MagneticButton>
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
              <Link
                to="/gallery"
                className="rounded-lg px-4 py-3 text-sm font-medium text-app-muted hover:bg-app-line/5 hover:text-app-text"
              >
                {t("nav.gallery")}
              </Link>
              <Link to="/studio" className="mt-2">
                <Button className="w-full" icon={Sparkles}>
                  {t("nav.start")}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Logo() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c5cff,#22d3ee)] shadow-glow">
      <svg viewBox="0 0 64 64" className="h-5 w-5" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round">
        <path d="M32 12 L50 22 L50 42 L32 52 L14 42 L14 22 Z" />
        <path d="M32 12 L32 32 L50 22 M32 32 L14 22 M32 32 L32 52" strokeWidth="2" opacity="0.9" />
      </svg>
    </span>
  );
}
