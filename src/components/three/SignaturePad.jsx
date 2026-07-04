import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { useT } from "@/hooks/useI18n";

/**
 * A small canvas where the customer signs with finger/mouse. Emits the signature as a list of
 * strokes (each a list of [x, y] points) normalised by the canvas WIDTH — so x is in [0,1] and
 * the aspect ratio is preserved — via `onChange(strokes | null)`. `penWidth` is a fraction of the
 * canvas width and is sent back so the backend can thicken the strokes to match what was drawn.
 */
export default function SignaturePad({ onChange, penWidth = 0.04, height = 150 }) {
  const t = useT();
  const canvasRef = useRef(null);
  const strokesRef = useRef([]); // [[ [px,py], ... ], ...] in CSS pixels
  const drawingRef = useRef(false);
  const [empty, setEmpty] = useState(true);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const g = c.getContext("2d");
    const rect = c.getBoundingClientRect();
    g.clearRect(0, 0, c.width, c.height);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#e8e8ef";
    g.lineWidth = Math.max(1.5, penWidth * rect.width);
    for (const stroke of strokesRef.current) {
      if (stroke.length < 1) continue;
      g.beginPath();
      g.moveTo(stroke[0][0], stroke[0][1]);
      for (let i = 1; i < stroke.length; i += 1) g.lineTo(stroke[i][0], stroke[i][1]);
      if (stroke.length === 1) g.lineTo(stroke[0][0] + 0.1, stroke[0][1]);
      g.stroke();
    }
  }, [penWidth]);

  // Keep the backing store in sync with the CSS size (and devicePixelRatio) for crisp lines.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return undefined;
    const fit = () => {
      const rect = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
      const g = c.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [redraw]);

  const posOf = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const emit = () => {
    const rect = canvasRef.current.getBoundingClientRect();
    const w = rect.width || 1;
    const strokes = strokesRef.current
      .filter((s) => s.length > 0)
      .map((s) => s.map(([x, y]) => [+(x / w).toFixed(4), +(y / w).toFixed(4)]));
    onChange?.(strokes.length ? strokes : null);
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    strokesRef.current.push([posOf(e)]);
    setEmpty(false);
  };
  const onPointerMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    strokesRef.current[strokesRef.current.length - 1].push(posOf(e));
    redraw();
  };
  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    redraw();
    emit();
  };

  const clear = () => {
    strokesRef.current = [];
    setEmpty(true);
    redraw();
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-app-line/15 bg-[#0b0e17]">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height, display: "block", touchAction: "none", cursor: "crosshair" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-app-faint">
            {t("editor.signatureDrawHere")}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        disabled={empty}
        className="inline-flex items-center gap-1.5 rounded-lg border border-app-line/15 px-2.5 py-1 text-xs text-app-muted transition-colors hover:bg-app-line/10 disabled:opacity-40"
      >
        <Eraser className="h-3.5 w-3.5" /> {t("editor.signatureClear")}
      </button>
    </div>
  );
}
