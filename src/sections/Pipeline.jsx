import { motion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import { SectionEyebrow, Badge } from "@/components/ui/primitives";
import { useT } from "@/hooks/useI18n";

const STEPS = [
  { key: "s1", tag: "image · text" },
  { key: "s2", tag: "image-to-3d · text-to-3d" },
  { key: "s3", tag: "refine · retexture" },
  { key: "s4", tag: "remesh" },
  { key: "s5", tag: "rig · animate" },
  { key: "s6", tag: "6 formats" },
];

export default function Pipeline() {
  const t = useT();
  return (
    <section id="how" className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>{t("pipeline.eyebrow")}</SectionEyebrow>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
          {t("pipeline.title")}{" "}
          <span className="text-gradient">{t("pipeline.titleHi")}</span>
        </h2>
        <p className="mt-4 text-lg text-app-muted">{t("pipeline.subtitle")}</p>
      </Reveal>

      <div className="relative mx-auto mt-16 max-w-3xl">
        <motion.div
          aria-hidden
          className="absolute left-[27px] top-2 w-px origin-top bg-gradient-to-b from-brand-violet via-brand-indigo to-brand-cyan sm:left-[31px]"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ height: "calc(100% - 1rem)" }}
        />

        <div className="space-y-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              className="relative flex gap-5"
            >
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-app-line/10 bg-app-surface font-display text-sm font-bold text-brand-violet shadow-glow">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="glass flex-1 rounded-2xl p-5 transition-transform duration-300 hover:translate-x-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-app-text">
                    {t(`pipeline.${s.key}.title`)}
                  </h3>
                  <Badge tone="slate" className="font-mono text-[10px]">
                    {s.tag}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-app-muted">
                  {t(`pipeline.${s.key}.body`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
