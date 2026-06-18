import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Type } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SectionEyebrow, Badge } from "@/components/ui/primitives";
import { useT } from "@/hooks/useI18n";

const CARDS = [
  { key: "c1", kind: "image", hue: "#7c5cff" },
  { key: "c2", kind: "text", hue: "#22d3ee" },
  { key: "c3", kind: "text", hue: "#d946ef" },
  { key: "c4", kind: "image", hue: "#5b6cff" },
];

export default function Showcase() {
  const t = useT();
  return (
    <section id="showcase" className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>{t("showcase.eyebrow")}</SectionEyebrow>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
          {t("showcase.title")}{" "}
          <span className="text-gradient">{t("showcase.titleHi")}</span>
        </h2>
        <p className="mt-4 text-lg text-app-muted">{t("showcase.subtitle")}</p>
      </Reveal>

      <StaggerGroup className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2">
        {CARDS.map((c, i) => (
          <StaggerItem key={c.key}>
            <ShowcaseCard
              kind={c.kind}
              hue={c.hue}
              index={i}
              label={t(`showcase.${c.key}.label`)}
              prompt={t(`showcase.${c.key}.prompt`)}
              ready={t("showcase.ready")}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function ShowcaseCard({ kind, label, prompt, hue, index, ready }) {
  const Icon = kind === "image" ? ImageIcon : Type;
  return (
    <div className="group glass relative overflow-hidden rounded-3xl p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="aspect-square overflow-hidden rounded-2xl border border-app-line/10 bg-app-elevated">
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <Icon className="h-7 w-7 text-app-faint" />
            <span className="text-xs text-app-muted">"{prompt}"</span>
            <Badge tone="slate" className="text-[10px]">
              {label}
            </Badge>
          </div>
        </div>

        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-app-line/[0.06] text-brand-violet"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.div>

        <div
          className="relative aspect-square overflow-hidden rounded-2xl border border-app-line/10"
          style={{
            background: `radial-gradient(ellipse at center, ${hue}22, #05060c)`,
          }}
        >
          <div className="absolute inset-0 bg-grid-faint [background-size:24px_24px] opacity-30" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 22 + index * 3, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 120 120" className="h-1/2 w-1/2" fill="none" stroke={hue} strokeWidth="2">
              <path d="M60 12 L102 36 L102 84 L60 108 L18 84 L18 36 Z" strokeLinejoin="round" />
              <path d="M60 12 L60 60 L102 36 M60 60 L18 36 M60 60 L60 108" strokeWidth="1.2" opacity="0.8" />
            </svg>
          </motion.div>
          <Badge tone="emerald" className="absolute bottom-2 left-2 text-[10px]">
            {ready}
          </Badge>
        </div>
      </div>
    </div>
  );
}
