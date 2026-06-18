import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, ArrowRight, Play, ImageIcon, Type } from "lucide-react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import { Badge } from "@/components/ui/primitives";
import { useT } from "@/hooks/useI18n";

export default function Hero() {
  const t = useT();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const yCard = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div style={{ y: yText, opacity }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge tone="violet" dot>
              {t("hero.badge")}
            </Badge>
          </motion.div>

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-app-text sm:text-6xl lg:text-7xl">
            <RevealLine delay={0.05}>{t("hero.l1")}</RevealLine>
            <RevealLine delay={0.15}>
              {t("hero.l2pre")}
              <span className="text-gradient animate-gradient-pan">
                {t("hero.l2hi")}
              </span>
            </RevealLine>
            <RevealLine delay={0.25}>{t("hero.l3")}</RevealLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-app-muted"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <MagneticButton as="div" strength={0.4}>
              <Link to="/studio">
                <Button size="lg" icon={Sparkles} iconRight={ArrowRight}>
                  {t("hero.ctaPrimary")}
                </Button>
              </Link>
            </MagneticButton>
            <a href="#how">
              <Button size="lg" variant="secondary" icon={Play}>
                {t("hero.ctaSecondary")}
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-app-faint"
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-violet" /> {t("hero.tagImage")}
            </span>
            <span className="flex items-center gap-2">
              <Type className="h-4 w-4 text-brand-cyan" /> {t("hero.tagText")}
            </span>
            <span>{t("hero.noCard")}</span>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: yCard }} className="relative">
          <FloatingPreview t={t} />
        </motion.div>
      </div>

      <ScrollCue />
    </section>
  );
}

function RevealLine({ children, delay }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function FloatingPreview({ t }) {
  const reduce = useReducedMotion();
  const stats = [
    { k: t("hero.statPolys"), v: "30K" },
    { k: t("hero.statTextures"), v: "PBR" },
    { k: t("hero.statRig"), v: "Auto" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -12 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-md"
      style={{ perspective: 1000 }}
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-[conic-gradient(from_180deg,#7c5cff,#22d3ee,#d946ef,#7c5cff)] opacity-25 blur-3xl" />

      <motion.div
        animate={reduce ? {} : { y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass-strong relative overflow-hidden rounded-[2rem] p-5 shadow-glow"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-app-text">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> {t("hero.complete")}
          </span>
          <span className="text-xs text-app-faint">00:47</span>
        </div>

        <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,#1a1d2e,#05060c)]">
          <div className="absolute inset-0 bg-grid-faint [background-size:32px_32px] opacity-40" />
          <OrbitingModel />
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {["GLB", "FBX", "USDZ"].map((f) => (
              <span
                key={f}
                className="glass rounded-md px-2 py-1 text-[10px] font-semibold text-app-text"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.k}
              className="rounded-xl border border-app-line/10 bg-app-line/[0.03] px-3 py-2 text-center"
            >
              <div className="text-sm font-bold text-app-text">{s.v}</div>
              <div className="text-[10px] uppercase tracking-wide text-app-faint">
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrbitingModel() {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 200 200"
        className="h-2/3 w-2/3 drop-shadow-[0_20px_40px_rgba(124,92,255,0.45)]"
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#5b6cff" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#hg)" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" />
          <path d="M100 20 L100 100 L170 60 M100 100 L30 60 M100 100 L100 180" strokeWidth="1.6" opacity="0.85" />
          <path d="M30 60 L170 140 M170 60 L30 140" strokeWidth="0.8" opacity="0.4" />
        </g>
      </motion.svg>
    </div>
  );
}

function ScrollCue() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 sm:block"
    >
      <div className="flex h-9 w-5 items-start justify-center rounded-full border border-app-line/20 p-1.5">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-app-line/70"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
