import {
  Palette,
  PersonStanding,
  Gauge,
  Layers,
  Wand2,
  Boxes,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SectionEyebrow } from "@/components/ui/primitives";
import { useT } from "@/hooks/useI18n";

const FEATURES = [
  { key: "f1", icon: Palette, tone: "from-brand-violet/20" },
  { key: "f2", icon: PersonStanding, tone: "from-brand-cyan/20" },
  { key: "f3", icon: Gauge, tone: "from-brand-fuchsia/20" },
  { key: "f4", icon: Layers, tone: "from-emerald-400/20" },
  { key: "f5", icon: Wand2, tone: "from-amber-400/20" },
  { key: "f6", icon: Boxes, tone: "from-indigo-400/20" },
];

export default function Features() {
  const t = useT();
  return (
    <section id="features" className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>{t("features.eyebrow")}</SectionEyebrow>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
          {t("features.title")}{" "}
          <span className="text-gradient">{t("features.titleHi")}</span>
        </h2>
        <p className="mt-4 text-lg text-app-muted">{t("features.subtitle")}</p>
      </Reveal>

      <StaggerGroup className="mx-auto mt-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <StaggerItem key={f.key}>
            <article className="group relative h-full overflow-hidden rounded-3xl border border-app-line/10 bg-app-surface/70 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-app-line/20 hover:shadow-glow dark:bg-app-line/[0.03] dark:shadow-none">
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.tone} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-app-line/10 bg-app-line/[0.04] text-brand-violet transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-app-text">
                  {t(`features.${f.key}.title`)}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-app-muted">
                  {t(`features.${f.key}.body`)}
                </p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
