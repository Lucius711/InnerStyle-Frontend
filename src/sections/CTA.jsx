import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import MagneticButton from "@/components/motion/MagneticButton";
import Reveal from "@/components/motion/Reveal";
import { useT } from "@/hooks/useI18n";

export default function CTA() {
  const t = useT();
  return (
    <section className="relative px-6 py-20">
      <Reveal direction="none" className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-app-line/10 px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,#7c5cff,#5b6cff,#22d3ee,#d946ef,#7c5cff)] bg-[length:300%_300%] opacity-20 animate-gradient-pan" />
          <div className="absolute inset-0 -z-10 bg-app-bg/40" />
          <motion.div
            aria-hidden
            className="absolute -left-20 top-0 h-60 w-60 rounded-full bg-brand-violet/40 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-brand-cyan/40 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />

          <h2 className="font-display text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
            {t("cta.title")} <span className="text-gradient">{t("cta.titleHi")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-app-muted">
            {t("cta.subtitle")}
          </p>
          <div className="mt-9 flex justify-center">
            <MagneticButton as="div" strength={0.4}>
              <Link to="/studio">
                <Button size="lg" icon={Sparkles} iconRight={ArrowRight}>
                  {t("cta.button")}
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
