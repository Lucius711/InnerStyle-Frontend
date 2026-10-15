import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useT } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { PRINT_MATERIALS, PRINT_SIZES, loadPrintPricing, vnd } from "@/lib/pricing";

/**
 * Landing page as one continuous scroll "film": a photo becomes points, a mesh, a print, a figure
 * on a shelf, then one stand in a gallery of sample models. The WebGL stage (filmStage.js) is
 * lazy-loaded so three.js stays out of the landing bundle; captions are plain DOM driven by the
 * same progress value.
 */
const END_P = 1.4; // keep in sync with filmStage.END_P (not imported, so three.js stays lazy)
const STORY_VH = 1300;
const HERO = { photo: "/samples/luffy.jpg", model: "/samples/luffy.glb" };
const GALLERY = [
  { key: "c1", url: "/samples/product.glb" },
  { key: "c2", url: "/samples/robot.glb" },
  { key: "c3", url: "/samples/fox.glb" },
  { key: "c4", url: "/samples/character.glb" },
];
const SCENES = [
  { key: "s1", a: 0, b: 0.105 },
  { key: "s2", a: 0.12, b: 0.195 },
  { key: "s3", a: 0.21, b: 0.295 },
  { key: "s4", a: 0.31, b: 0.445 },
  { key: "s5", a: 0.46, b: 0.655, hot: true },
  { key: "s6", a: 0.67, b: 0.815 },
  { key: "s7", a: 0.84, b: 1.28 },
  { key: "s8", a: 1.3, b: END_P + 0.01 },
];
// Navbar/Footer links (/#how, /#features, /#showcase) land on these points of the film.
const ANCHORS = { how: 0.12, features: 0.46, showcase: 0.88 };
const PRINT_CM = 12;
// film palette as RGB channels, so Tailwind arbitrary classes can add alpha: rgb(var(--film-bg)/0.9)
const PALETTE = {
  dark: { bg: "10 9 16", surface: "20 18 28", ink: "238 234 247", muted: "157 151 179", line: "42 38 56", accent: "139 108 255", hot: "255 154 77" },
  light: { bg: "244 241 251", surface: "255 255 255", ink: "27 22 48", muted: "93 86 119", line: "217 211 234", accent: "109 76 230", hot: "214 106 26" },
};
const PRINT_MINUTES = 252;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const vh = (q) => `${(q / END_P) * (STORY_VH - 100)}vh`;

export default function FilmStory() {
  const t = useT();
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const isDark = theme !== "light";
  const stageRef = useRef(null);
  const storyRef = useRef(null);
  const hostRef = useRef(null);
  const capRefs = useRef([]);
  const railRefs = useRef([]);
  const read = useRef({});
  const tRef = useRef(t);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;
  tRef.current = t; // the rAF loop reads strings through this so a language switch shows up at once
  const [failed, setFailed] = useState(false);
  const [focus, setFocus] = useState(0);
  const [sizes, setSizes] = useState(PRINT_SIZES);
  const [size, setSize] = useState(12);
  const [mat, setMat] = useState("PLA");

  useEffect(() => {
    let active = true;
    loadPrintPricing().then((s) => active && setSizes(s));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    stageRef.current?.setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    let alive = true;
    let stage = null;
    let raf = 0;
    let P = 0;
    let lastT = performance.now();
    let lastFocus = -1;
    let stats = { verts: 30727, tris: 37749, depthUnits: 1.527 };

    import("@/components/three/filmStage")
      .then(({ createFilmStage }) =>
        createFilmStage({ host: hostRef.current, photoUrl: HERO.photo, modelUrl: HERO.model, gallery: GALLERY, reduce })
      )
      .then((s) => {
        if (!alive) return s.dispose();
        stage = s;
        stageRef.current = s;
        s.setTheme(isDarkRef.current);
        stats = s.stats;
      })
      .catch(() => alive && setFailed(true));

    const fmt = (n) => Math.round(n).toLocaleString("vi-VN");
    function hud(p) {
      SCENES.forEach((s, i) => {
        const el = capRefs.current[i];
        if (!el) return;
        const f = 0.012;
        const o = s.a === 0 ? 1 - smooth(s.b - f, s.b, p) : smooth(s.a, s.a + f, p) * (1 - smooth(s.b - f, s.b, p));
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translateY(${((1 - o) * 16).toFixed(1)}px)`;
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        el.inert = o < 0.5;
      });
      const r = read.current;
      const lift = smooth(0.12, 0.22, p);
      if (r.pts) r.pts.textContent = fmt(stats.verts * lift);
      if (r.depth) r.depth.textContent = `${((PRINT_CM * stats.depthUnits) / 1.9 * lift).toFixed(1).replace(".", ",")} cm`;
      if (r.tris) r.tris.textContent = fmt(stats.tris * smooth(0.3, 0.39, p));
      if (r.skin) r.skin.textContent = `${Math.round(100 * smooth(0.33, 0.44, p))}%`;
      const pr = smooth(0.51, 0.64, p);
      if (r.layer) r.layer.textContent = fmt(1000 * pr);
      const left = Math.round(PRINT_MINUTES * (1 - pr));
      const tt = tRef.current;
      if (r.eta) r.eta.textContent = left ? tt("film.s5.etaValue", { h: Math.floor(left / 60), m: left % 60 }) : tt("film.s5.done");
      let sc = 0;
      SCENES.forEach((s, i) => {
        if (p >= s.a - 0.008) sc = i;
      });
      railRefs.current.forEach((b, i) => b && (i === sc ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
      const f = Math.round(clamp((p - 0.88) / 0.38) * GALLERY.length);
      if (f !== lastFocus) {
        lastFocus = f;
        setFocus(f);
      }
    }

    function frame(now) {
      const el = storyRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const target = clamp(-rect.top / (rect.height - window.innerHeight)) * END_P;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        P = reduce ? target : P + (target - P) * Math.min(1, dt * 5);
        if (Math.abs(P - target) < 0.0002) P = target;
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          hud(P);
          if (stage) {
            stage.draw(P, now);
            if (P > 0.6) stage.loadGallery();
          }
        }
      }
      lastT = now;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stage?.dispose();
      stageRef.current = null;
    };
  }, [reduce]);


  const jump = (i) => {
    const el = storyRef.current;
    if (!el) return;
    const q = SCENES[i].a + (i === 0 ? 0 : 0.02);
    const top = el.getBoundingClientRect().top + window.scrollY + (q / END_P) * (el.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  const one = (sizes.find((s) => s.cm === size)?.price || 0) + (PRINT_MATERIALS.find((m) => m.code === mat)?.surcharge || 0);
  const item = focus > 0 ? GALLERY[focus - 1] : null;
  const setRead = (k) => (n) => {
    read.current[k] = n;
  };

  return (
    <section ref={storyRef} className="film relative" style={{ height: `${STORY_VH}vh`, ...Object.fromEntries(Object.entries(PALETTE[isDark ? "dark" : "light"]).map(([k, v]) => [`--film-${k}`, v])) }} aria-label={t("film.aria")}>
      {Object.entries(ANCHORS).map(([id, q]) => (
        <span key={id} id={id} className="pointer-events-none absolute left-0 h-px w-px" style={{ top: vh(q) }} />
      ))}

      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[rgb(var(--film-bg))] text-[rgb(var(--film-ink))]">
        <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
        {failed && (
          <div className="absolute inset-0 grid place-items-center">
            <img src={HERO.photo} alt="" className="max-h-[60svh] max-w-[80vw] rounded-xl" />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 60% 45%, transparent 55%, rgb(var(--film-bg)) 100%)" }}
        />


        {/* right-hand navigation: one line per part of the story, label only */}
        <nav className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 md:grid" aria-label={t("film.railAria")}>
          {SCENES.map((s, i) => (
            <button
              key={s.key}
              ref={(n) => (railRefs.current[i] = n)}
              type="button"
              onClick={() => jump(i)}
              className="group flex items-center justify-end gap-2.5 py-1.5 text-right text-[12px] text-[rgb(var(--film-muted))] transition-colors hover:text-[rgb(var(--film-ink))] aria-[current=step]:text-[rgb(var(--film-ink))]"
            >
              <span className="whitespace-nowrap opacity-60 transition-opacity group-hover:opacity-100 group-aria-[current=step]:opacity-100 group-aria-[current=step]:font-medium">
                {t(`film.${s.key}.rail`)}
              </span>
              <i className="h-px w-5 bg-[rgb(var(--film-line))] transition-all group-aria-[current=step]:w-9 group-aria-[current=step]:bg-[rgb(var(--film-accent))]" />
            </button>
          ))}
        </nav>

        {/* shot list captions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[62svh] bg-gradient-to-t from-[rgb(var(--film-bg))] via-[rgb(var(--film-bg)/0.9)] to-transparent md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[560px] md:bg-gradient-to-r md:from-[rgb(var(--film-bg)/0.9)] md:via-[rgb(var(--film-bg)/0.7)]">
          {SCENES.map((s, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            return (
              <article
                key={s.key}
                ref={(n) => (capRefs.current[i] = n)}
                className="absolute bottom-6 left-4 right-4 grid gap-3 opacity-0 md:bottom-[10vh] md:left-12 md:right-10"
                style={i === 0 ? { opacity: 1 } : undefined}
              >
                <Heading
                  className={`font-display font-bold leading-[1.08] tracking-tight [text-wrap:balance] ${
                    i === 0 ? "text-[clamp(32px,4.4vw,52px)]" : "text-[clamp(26px,3.4vw,40px)]"
                  }`}
                >
                  {t(`film.${s.key}.pre`)}
                  <span className={s.hot ? "text-[rgb(var(--film-hot))]" : "text-[rgb(var(--film-accent))]"}>{t(`film.${s.key}.hi`)}</span>
                  {t(`film.${s.key}.post`)}
                </Heading>
                {s.key !== "s6" && <p className="max-w-[42ch] text-[15px] text-[rgb(var(--film-muted))]">{t(`film.${s.key}.body`)}</p>}

                {s.key === "s2" && (
                  <Readout>
                    <span>
                      {t("film.s2.points")} <b ref={setRead("pts")}>0</b>
                    </span>
                    <span>
                      {t("film.s2.source")} <b>{t("film.s2.sourceValue")}</b>
                    </span>
                  </Readout>
                )}
                {s.key === "s3" && (
                  <Readout>
                    <span>
                      {t("film.s3.depth")} <b ref={setRead("depth")}>0 cm</b>
                    </span>
                    <span>{t("film.s3.atHeight", { cm: PRINT_CM })}</span>
                  </Readout>
                )}
                {s.key === "s4" && (
                  <Readout>
                    <span>
                      {t("film.s4.tris")} <b ref={setRead("tris")}>0</b>
                    </span>
                    <span>
                      {t("film.s4.skin")} <b ref={setRead("skin")}>0%</b>
                    </span>
                  </Readout>
                )}
                {s.key === "s5" && (
                  <Readout hot>
                    <span>
                      {t("film.s5.layer")} <b ref={setRead("layer")}>0</b> / 1000
                    </span>
                    <span>
                      {t("film.s5.eta")} <b ref={setRead("eta")} />
                    </span>
                  </Readout>
                )}
                {s.key === "s6" && (
                  <div className="grid max-w-[420px] gap-2.5 rounded-2xl border border-[rgb(var(--film-line))] bg-[rgb(var(--film-surface)/0.9)] p-3.5 backdrop-blur">
                    <span className="text-[11.5px] text-[rgb(var(--film-muted))]">{t("film.s6.size")}</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {sizes.map((o) => (
                        <Opt key={o.cm} on={o.cm === size} onClick={() => setSize(o.cm)} title={`${o.cm} cm`} sub={vnd.format(o.price)} />
                      ))}
                    </div>
                    <span className="text-[11.5px] text-[rgb(var(--film-muted))]">{t("film.s6.material")}</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRINT_MATERIALS.map((m) => (
                        <Opt
                          key={m.code}
                          on={m.code === mat}
                          onClick={() => setMat(m.code)}
                          title={m.name}
                          sub={m.surcharge ? `+${vnd.format(m.surcharge)}` : t("film.s6.base")}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[rgb(var(--film-line))] pt-2.5">
                      <span className="text-[11.5px] text-[rgb(var(--film-muted))]">{t("film.s6.subtotal")}</span>
                      <strong className="whitespace-nowrap font-mono text-2xl font-bold text-[rgb(var(--film-hot))]">{vnd.format(one)}</strong>
                    </div>
                  </div>
                )}
                {s.key === "s7" && (
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[12px] text-[rgb(var(--film-muted))]" aria-live="polite">
                    <span className="rounded-full border border-[rgb(var(--film-line))] px-2.5 py-0.5 text-[rgb(var(--film-ink))]">
                      {item ? t(`showcase.${item.key}.label`) : t("film.s7.heroLabel")}
                    </span>
                    <span>“{item ? t(`showcase.${item.key}.prompt`) : t("film.s7.heroPrompt")}”</span>
                    <span>
                      {focus + 1} / {GALLERY.length + 1}
                    </span>
                  </div>
                )}
                {s.key === "s8" && (
                  <div className="flex flex-wrap gap-3">
                    <Link to="/studio">
                      <Button size="lg" icon={Sparkles} iconRight={ArrowRight}>
                        {t("film.s8.cta")}
                      </Button>
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Readout({ hot, children }) {
  return (
    <p
      className={`flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] tabular-nums text-[rgb(var(--film-muted))] [&_b]:font-medium ${
        hot ? "[&_b]:text-[rgb(var(--film-hot))]" : "[&_b]:text-[rgb(var(--film-ink))]"
      }`}
    >
      {children}
    </p>
  );
}

function Opt({ on, onClick, title, sub }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`grid gap-px rounded-xl border px-1 py-1.5 text-center transition-colors ${
        on ? "border-[rgb(var(--film-hot))] bg-[rgb(var(--film-hot)/0.1)]" : "border-[rgb(var(--film-line))] hover:border-[rgb(var(--film-muted))]"
      }`}
    >
      <b className="text-sm font-semibold">{title}</b>
      <small className="font-mono text-[10.5px] text-[rgb(var(--film-muted))]">{sub}</small>
    </button>
  );
}
