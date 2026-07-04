import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Type } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SectionEyebrow, Badge } from "@/components/ui/primitives";
import { useT } from "@/hooks/useI18n";

// three.js / @react-three live behind this lazy boundary so they're not in the Landing bundle.
const ShowcaseModel = lazy(() => import("@/components/three/ShowcaseModel"));

// `image` cards show a 2D source photo on the left; `text` cards show just the
// prompt text (text-to-3D has no source image). Both kinds show the resulting
// 3D `model` on the right. Files live in /public/samples/ — drop them in to show
// them; the model falls back to an animated hex until its .glb exists.
const CARDS = [
  { key: "c1", kind: "image", hue: "#7c5cff", image: "/samples/product.jpg", model: "/samples/product.glb" },
  { key: "c2", kind: "text", hue: "#22d3ee", model: "/samples/robot.glb" },
  { key: "c3", kind: "text", hue: "#d946ef", model: "/samples/fox.glb" },
  { key: "c4", kind: "image", hue: "#5b6cff", image: "/samples/character.jpg", model: "/samples/character.glb" },
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
              image={c.image}
              model={c.model}
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

function ShowcaseCard({ kind, label, prompt, hue, index, image, model, ready }) {
  const Icon = kind === "image" ? ImageIcon : Type;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;
  return (
    <div className="group glass relative overflow-hidden rounded-3xl p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left: 2D source image for image cards, prompt text for text cards. */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-app-line/10 bg-app-elevated">
          {/* Placeholder/text panel — always rendered; the image covers it once it loads. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
            <Icon className="h-6 w-6 text-app-faint" />
            <p className="text-sm font-medium leading-relaxed text-app-text">"{prompt}"</p>
            <Badge tone="slate" className="text-[10px]">
              {label}
            </Badge>
          </div>

          {showImage && (
            <img
              src={image}
              alt={prompt}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {showImage && loaded && (
            <>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                <span className="text-xs font-medium text-white/90">"{prompt}"</span>
              </div>
              <Badge tone="slate" className="absolute left-2 top-2 text-[10px]">
                {label}
              </Badge>
            </>
          )}
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
          <Suspense fallback={<HexPlaceholder hue={hue} index={index} />}>
            <ShowcaseModel url={model} fallback={<HexPlaceholder hue={hue} index={index} />} />
          </Suspense>
          <Badge tone="emerald" className="absolute bottom-2 left-2 z-10 text-[10px]">
            {ready}
          </Badge>
        </div>
      </div>
    </div>
  );
}

/** Decorative spinning wireframe shown while a model loads or if none is set. */
function HexPlaceholder({ hue, index }) {
  return (
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
  );
}
