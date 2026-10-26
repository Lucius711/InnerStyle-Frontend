import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useT } from "@/hooks/useI18n";

/**
 * Intro splash: the logo's mascot hops in as a 2D sketch, squashes the "I" of Inner, is sprung into
 * the scanner box, gets coloured in by the scan line and its head pops up on a coil into the logo pose.
 * Plays on every full page load of the home page "/" (gated in App.jsx); tap, scroll or any key skips it. The underline under the tagline
 * only completes once the page has finished loading.
 */
const NS = "http://www.w3.org/2000/svg";
const SPEED = 1.12; // timeline below is authored in ms; >1 plays it faster
const END = 6300;
const GROUND = 668; // floor line under the wordmark
const FLOOR = 565; // box floor

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (x) => 1 - Math.pow(1 - x, 3);
const seg = (T, a, b) => clamp((T - a) / (b - a));
const smooth = (a, b, x) => {
  const t = seg(x, a, b);
  return t * t * (3 - 2 * t);
};
const spring = (u, k = 5, w = 12) => (u <= 0 ? 0 : 1 - Math.exp(-k * u) * Math.cos(w * u));

const KID_ART = `
  <rect class="arm" x="-82" y="-176" width="32" height="120" rx="16"/><rect class="arm" x="50" y="-176" width="32" height="120" rx="16"/>
  <rect class="torso" x="-46" y="-184" width="92" height="170" rx="18"/>
  <circle class="skin" cx="-66" cy="-58" r="19"/><circle class="skin" cx="66" cy="-58" r="19"/>
  <ellipse class="skin" cx="-24" cy="-8" rx="25" ry="15"/><ellipse class="skin" cx="24" cy="-8" rx="25" ry="15"/>
  <g class="head" transform="translate(0 -237)">
    <circle class="skin" r="65"/>
    <path class="hair" d="M-80 34C-86-30-62-86 0-86C62-86 86-30 80 34C74 36 68 34 64 28C62 4 58-14 54-26L-54-26C-58-14-62 4-64 28C-68 34-74 36-80 34Z"/>
    <ellipse class="blush" cx="-44" cy="13" rx="15" ry="8"/><ellipse class="blush" cx="44" cy="13" rx="15" ry="8"/>
    <g class="eyes"><circle class="eye" cx="-23" cy="-5" r="19"/><circle class="iris" cx="-23" cy="-5" r="14"/><circle class="shine" cx="-28" cy="-11" r="5"/>
      <circle class="eye" cx="23" cy="-5" r="19"/><circle class="iris" cx="23" cy="-5" r="14"/><circle class="shine" cx="18" cy="-11" r="5"/></g>
    <path class="smile" d="M-12 22Q0 33 12 22"/>
  </g>`;
const STAR = "M0-1C.12-.12.12-.12 1 0C.12.12.12.12 0 1C-.12.12-.12.12-1 0C-.12-.12-.12-.12 0-1Z";

const CSS = `
.splash-logo text{font-family:Inter,ui-sans-serif,system-ui,sans-serif}
.splash-logo .lt,.splash-logo .brk,.splash-logo .eyes{transform-box:fill-box;transform-origin:50% 100%}
.splash-logo .brk,.splash-logo .eyes{transform-origin:50% 50%}
.kc .arm{fill:#6d28d9}.kc .torso{fill:#5b21b6}.kc .skin{fill:#f8c9a2}.kc .hair{fill:#1c1130}
.kc .blush{fill:#f19a9a;opacity:.55}.kc .eye{fill:#1c1130}.kc .iris{fill:#7c3aed}.kc .shine{fill:#fff}
.kc .smile{fill:none;stroke:#cf5468;stroke-width:3.5;stroke-linecap:round}
.ks *{fill:#fff;stroke:#8b5cf6;stroke-width:2.5;vector-effect:non-scaling-stroke}
.ks .blush,.ks .shine{display:none}.ks .iris{fill:#efe8ff}.ks .smile{fill:none}`;

export default function SplashScreen() {
  const { theme } = useTheme();
  const t = useT();
  const isDark = theme === "dark";
  const [show, setShow] = useState(() => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const [ready, setReady] = useState(() => document.readyState === "complete");
  const svgRef = useRef(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    if (ready) return undefined;
    const on = () => setReady(true);
    window.addEventListener("load", on);
    return () => window.removeEventListener("load", on);
  }, [ready]);

  useEffect(() => {
    if (!show) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const finish = () => setShow(false);
    const evs = ["wheel", "touchstart", "keydown"];
    const arm = setTimeout(() => evs.forEach((e) => window.addEventListener(e, finish, { passive: true, once: true })), 400);

    const svg = svgRef.current;
    const $ = (sel) => svg.querySelector(sel);
    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      parent?.appendChild(n);
      return n;
    };
    let raf = 0;
    let cancelled = false;

    // wall grid
    const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    let d = "";
    [
      [[263, 265], [500, 152], [500, 395], [263, 522]],
      [[500, 152], [737, 265], [737, 522], [500, 395]],
    ].forEach(([a, b, c, dd]) => {
      for (let i = 1; i < 4; i++) {
        const f = i / 4;
        d += `M${mix(a, b, f)}L${mix(dd, c, f)}M${mix(a, dd, f)}L${mix(b, c, f)}`;
      }
    });
    $("[data-grid]").setAttribute("d", d.replace(/,/g, " "));

    $("[data-sketch]").innerHTML = `<g class="ks">${KID_ART}</g>`;
    $("[data-color]").innerHTML = `<g class="kc">${KID_ART}</g>`;
    const kid = $("[data-kid]");
    const heads = [...kid.querySelectorAll(".head")];
    const eyes = [...kid.querySelectorAll(".eyes")];
    const neck = $("[data-neck]");
    const shadow = $("[data-shadow]");
    const clipRect = $("[data-cliprect]");
    const scan = $("[data-scan]");
    const hex = $("[data-hex]");
    const walls = $("[data-walls]");
    const HEX_LEN = hex.getTotalLength();
    hex.style.strokeDasharray = HEX_LEN;
    const brackets = [...svg.querySelectorAll(".brk")];
    const sparkles = $("[data-sparkles]");
    sparkles.innerHTML = "";
    const stars = [
      [602, 100, 26, 1],
      [406, 120, 16, 1],
      [606, 180, 9, 0.35],
    ].map(([x, y, s, o]) => ({ x, y, s, n: el("path", { d: STAR, opacity: o, transform: "scale(0)" }, sparkles) }));

    // wordmark: one <text> per letter so each can drop and squash on its own
    const words = $("[data-words]");
    words.innerHTML = "";
    const spell = (str, x, y, attrs) => {
      const m = el("text", { x, y, ...attrs }, words);
      m.textContent = str;
      const out = [];
      for (let i = 0; i < str.length; i++) {
        if (str[i] === " ") continue;
        const n = el("text", { x: m.getStartPositionOfChar(i).x, y, ...attrs, class: "lt" }, words);
        n.textContent = str[i];
        out.push(n);
      }
      m.remove();
      return out;
    };
    const fonts = document.fonts
      ? Promise.race([
          Promise.all(["700 100px Inter", "500 100px Inter"].map((f) => document.fonts.load(f))),
          new Promise((r) => setTimeout(r, 1200)),
        ])
      : Promise.resolve();

    fonts.then(() => {
      if (cancelled) return;
      const inner = spell("Inner", 862, 350, { "font-size": 190, "font-weight": 700, fill: "url(#splashInner)", "letter-spacing": -4 });
      const style = spell("Style", 856, 538, { "font-size": 200, "font-weight": 500, fill: "url(#splashStyle)", "letter-spacing": -3 });
      const tag = spell("YOUR STORY. IN 3D.", 864, 628, { "font-size": 33, "font-weight": 500, fill: isDark ? "#6f6390" : "#ded1f8", "letter-spacing": 17 });
      const uline = el("rect", { x: 862, y: 648, width: 0, height: 5, rx: 2.5, fill: "#8b5cf6" }, words);
      const letters = [...inner, ...style];
      const bb = inner[0].getBBox();
      const I = { el: inner[0], x: bb.x + bb.width / 2, top: bb.y + 6, bot: bb.y + bb.height, h: bb.height - 6 };

      const H = {
        A: { c0: 1300, a0: 1370, a1: 1750, l1: 1850, x0: 1900, y0: GROUND, x1: 1480, y1: GROUND, h: 120, crouch: 0.8, lean: -7 },
        B: { c0: 1950, a0: 2020, a1: 2380, l1: 2480, x0: 1480, y0: GROUND, x1: 1150, y1: GROUND, h: 110, crouch: 0.8, lean: -7 },
        C: { c0: 2720, a0: 2830, a1: 3300, x0: 1150, y0: GROUND, x1: I.x, y1: I.top, h: 110, crouch: 0.68, lean: -9 },
        D: { c0: 3600, a0: 3600, a1: 4300, l1: 4460, x0: I.x, y0: I.top, x1: 500, y1: FLOOR, h: 120, crouch: 1.18, lean: -11 },
      };
      const hop = (T, h) => {
        if (T < h.a0) return { x: h.x0, y: h.y0, sy: 1 - (1 - h.crouch) * Math.sin((seg(T, h.c0, h.a0) * Math.PI) / 2), rot: 0 };
        if (T < h.a1) {
          const a = seg(T, h.a0, h.a1);
          return {
            x: lerp(h.x0, h.x1, a),
            y: lerp(h.y0, h.y1, a) - h.h * Math.sin(Math.PI * a),
            sy: a < 0.25 ? lerp(h.crouch, 1.16, a / 0.25) : lerp(1.16, 0.97, (a - 0.25) / 0.75),
            rot: h.lean * Math.sin(Math.PI * a),
          };
        }
        const l = h.l1 ? seg(T, h.a1, h.l1) : 1;
        return { x: h.x1, y: h.y1, sy: 1 - 0.27 * Math.sin(Math.PI * l) * (1 - 0.4 * l), rot: 0 };
      };
      // the I gets sat on, then springs the mascot into the box
      const iSquash = (T) => {
        if (T < 3300) return 1;
        if (T < 3420) return lerp(1, 0.5, ease(seg(T, 3300, 3420)));
        if (T < 3520) return 0.5;
        if (T < 3600) return lerp(0.5, 1.13, ease(seg(T, 3520, 3600)));
        return 1 + 0.13 * Math.exp((-6 * (T - 3600)) / 1000) * Math.cos((16 * (T - 3600)) / 1000);
      };

      const pose = (T) => {
        letters.forEach((n, i) => {
          const k = seg(T, 300 + i * 60, 820 + i * 60);
          let dy = 0;
          let sy = 1;
          if (k < 0.6) dy = -110 * (1 - Math.pow(k / 0.6, 2));
          else {
            const l = (k - 0.6) / 0.4;
            sy = 1 - 0.22 * Math.sin(Math.PI * l) * (1 - l * 0.5);
          }
          if (n === I.el) sy *= iSquash(T);
          n.style.opacity = Math.min(1, k * 5).toFixed(3);
          n.style.transform = `translateY(${dy.toFixed(1)}px) scale(${(1 + (1 - sy) * 0.6).toFixed(3)}, ${sy.toFixed(3)})`;
        });
        hex.style.strokeDashoffset = (HEX_LEN * (1 - ease(seg(T, 0, 800)))).toFixed(1);
        brackets.forEach((b, i) => {
          const k = spring(seg(T, 250 + i * 70, 1250 + i * 70), 6, 14);
          b.style.transform = `scale(${(0.4 + 0.6 * k).toFixed(3)})`;
          b.style.opacity = Math.min(1, k * 2).toFixed(2);
        });
        walls.style.opacity = ease(seg(T, 350, 950)).toFixed(3);

        // mascot
        let st;
        let s = 0.42;
        if (T < H.A.c0) st = { x: 1900, y: GROUND, sy: 1, rot: 0 };
        else if (T < H.B.c0) st = hop(T, H.A);
        else if (T < H.C.c0) st = hop(T, H.B);
        else if (T < H.C.a1) st = hop(T, H.C);
        else if (T < H.D.a0) {
          const ksy = T < 3420 ? lerp(1, 0.7, ease(seg(T, 3300, 3420))) : T < 3520 ? 0.7 : lerp(0.7, 1.18, seg(T, 3520, 3600));
          st = { x: I.x, y: I.bot - I.h * iSquash(T), sy: ksy, rot: 0 };
        } else {
          st = hop(T, H.D);
          s = lerp(0.42, 1, ease(T < H.D.a1 ? seg(T, H.D.a0, H.D.a1) : 1));
        }
        const sx = 1 + (1 - st.sy) * 0.7;
        kid.setAttribute("transform", `translate(${st.x.toFixed(1)} ${st.y.toFixed(1)}) rotate(${st.rot.toFixed(2)}) scale(${(s * sx).toFixed(4)} ${(s * st.sy).toFixed(4)})`);

        let ground = null;
        if (T >= H.A.c0 && T < H.C.a0) ground = GROUND;
        else if (T >= H.D.a0 + 350) ground = FLOOR;
        if (ground == null) shadow.setAttribute("opacity", 0);
        else {
          const lift = clamp((ground - st.y) / 260);
          shadow.setAttribute("cx", st.x);
          shadow.setAttribute("cy", ground + 2);
          shadow.setAttribute("rx", (60 * s * (1 - 0.55 * lift)).toFixed(1));
          shadow.setAttribute("ry", (11 * s * (1 - 0.55 * lift)).toFixed(1));
          shadow.setAttribute("opacity", (0.14 * (1 - 0.6 * lift)).toFixed(3));
        }

        // scan sweeps down the box colouring the sketch in, then rests where the logo has it
        const scanY = T < 5050 ? lerp(230, 570, smooth(4460, 5050, T)) : lerp(570, 372, smooth(5050, 5420, T));
        scan.setAttribute("opacity", seg(T, 4420, 4520).toFixed(3));
        scan.setAttribute("transform", `translate(0 ${scanY.toFixed(1)})`);
        clipRect.setAttribute("height", T < 4460 ? 0 : T < 5050 ? Math.max(0, scanY - FLOOR + 620) : 800);

        // head: a curious tilt at the I, then springs up on a coil into the logo's floating-head pose
        const hy = -237 - 138 * spring((T - 5100) / 1000, 4.5, 11);
        const tilt = -16 * Math.sin(Math.PI * seg(T, 2480, 2720)) + 8 * Math.sin(Math.PI * seg(T, 3420, 3520));
        heads.forEach((h) => h.setAttribute("transform", `translate(0 ${hy.toFixed(1)}) rotate(${tilt.toFixed(2)})`));
        const top = hy + 58;
        const pts = [];
        for (let i = 0; i <= 9; i++) pts.push(`${i === 0 || i === 9 ? 0 : i % 2 ? 13 : -13},${(-182 + ((top + 182) * i) / 9).toFixed(1)}`);
        neck.setAttribute("points", pts.join(" "));
        neck.setAttribute("opacity", T < 5100 ? 0 : (1 - seg(T, 5650, 6050)).toFixed(3));
        const blink = Math.max(Math.sin(Math.PI * seg(T, 2560, 2660)), Math.sin(Math.PI * seg(T, 5900, 6000)));
        eyes.forEach((e) => {
          e.style.transform = `scaleY(${(1 - 0.9 * blink).toFixed(3)})`;
        });

        stars.forEach((sp, i) => {
          const k = spring((T - 5250 - i * 120) / 1000, 6, 10);
          sp.n.setAttribute("transform", `translate(${sp.x} ${sp.y}) rotate(${(45 * (1 - Math.min(1, k))).toFixed(1)}) scale(${(sp.s * Math.max(0, k)).toFixed(2)})`);
        });
        tag.forEach((n, i) => {
          const k = seg(T, 5400 + i * 35, 5700 + i * 35);
          n.style.opacity = k.toFixed(3);
          n.style.transform = `translateY(${(8 * (1 - ease(k))).toFixed(1)}px)`;
        });
      };

      const t0 = performance.now();
      const tick = (now) => {
        if (cancelled) return;
        const real = now - t0;
        const T = real * SPEED;
        const done = readyRef.current || real > 10000;
        pose(T);
        uline.setAttribute("width", (116 * Math.min(ease(seg(T, 5400, 6200)), done ? 1 : 0.85)).toFixed(1));
        if (T >= END && done) {
          setTimeout(finish, 450);
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(arm);
      evs.forEach((e) => window.removeEventListener(e, finish));
      document.body.style.overflow = prevOverflow;
    };
    // the scene is built once per showing; the theme only changes two fills read at build time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center content-center gap-2.5 overflow-hidden"
          style={{ background: isDark ? "#0a0910" : "#ffffff" }}
          role="status"
          aria-label={t("splash.aria")}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <style>{CSS}</style>
          <svg ref={svgRef} className="splash-logo h-auto w-[min(94vw,980px)] overflow-visible" viewBox="200 60 1300 640" aria-hidden="true">
            <defs>
              <linearGradient id="splashWallL" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#1e0b47" />
                <stop offset="1" stopColor="#3a1785" />
              </linearGradient>
              <linearGradient id="splashWallR" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2a0f60" />
                <stop offset="1" stopColor="#4b21a8" />
              </linearGradient>
              <linearGradient id="splashInner" gradientUnits="userSpaceOnUse" x1="0" y1="215" x2="0" y2="352">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#c4a3f7" />
              </linearGradient>
              <linearGradient id="splashStyle" gradientUnits="userSpaceOnUse" x1="860" y1="0" x2="1290" y2="0">
                <stop offset="0" stopColor="#a25ff5" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="splashScan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#a78bfa" stopOpacity="0" />
                <stop offset=".5" stopColor="#a78bfa" stopOpacity=".75" />
                <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
              <clipPath id="splashKidClip" clipPathUnits="userSpaceOnUse">
                <rect data-cliprect x="-220" y="-620" width="440" height="0" />
              </clipPath>
            </defs>
            <g fill="none" stroke="#8b5cf6" strokeWidth="5">
              <path className="brk" d="M240 242V188h56" />
              <path className="brk" d="M705 188h56v54" />
              <path className="brk" d="M240 545v55h56" />
              <path className="brk" d="M705 600h56v-55" />
            </g>
            <g data-walls style={{ opacity: 0 }}>
              <path d="M263 265L500 152V395L263 522Z" fill="url(#splashWallL)" />
              <path d="M500 152L737 265V522L500 395Z" fill="url(#splashWallR)" />
              <path d="M263 522L500 395L737 522L500 653Z" fill="#fff" />
              <path data-grid fill="none" stroke="#8b5cf6" strokeOpacity=".35" strokeWidth="1.5" />
            </g>
            <g data-words />
            <ellipse data-shadow rx="50" ry="10" fill="#1c1130" opacity="0" />
            <g data-kid transform={`translate(1900 ${GROUND}) scale(.42)`}>
              <polyline data-neck fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinejoin="round" opacity="0" />
              <g data-sketch />
              <g data-color clipPath="url(#splashKidClip)" />
            </g>
            <g data-scan opacity="0">
              <rect x="263" y="-14" width="474" height="28" fill="url(#splashScan)" />
              <rect x="263" y="-1.5" width="474" height="3" fill="#c4b5fd" />
            </g>
            <path data-hex d="M500 152L737 265V522L500 653L263 522V265Z" fill="none" stroke="#7c3aed" strokeWidth="4.5" strokeLinejoin="round" />
            <g data-sparkles fill="#8b5cf6" />
          </svg>
          <p className="min-h-[1.6em] font-mono text-xs text-[#9a8fbd]">{ready ? t("splash.ready") : t("splash.loading")}</p>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="absolute bottom-[calc(24px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 text-xs text-[#9a8fbd] hover:text-[#7c3aed]"
          >
            {t("splash.skip")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
