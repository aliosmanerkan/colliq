"use client";

import * as React from "react";

/*
 * Card Deck Carousel — photos & slabs stacked like a loose deck of prints.
 * Throw the top card in any direction (drag and let go) and it flies off,
 * then slides back in at the bottom of the pile; the next one is already waiting.
 */

export type LandPalette = "dawn" | "alpine" | "dusk" | "mist";

export type Slide = {
  image?: string;
  title?: string;
  caption?: string;
  alt?: string;
  category?: string;
  grade?: string;
  /** Palette and seed of the painted landscape used when `image` is empty. */
  palette?: LandPalette;
  seed?: number;
};

export type CardDeckCarouselProps = {
  slides?: Slide[];
  /** Any CSS length. Default auto. */
  height?: number | string;
  /** Width of a card, any CSS length. */
  cardWidth?: string;
  /** CSS aspect-ratio of a card. */
  aspect?: string;
  /** How messy the pile is: the largest tilt in degrees of the cards behind. */
  scatter?: number;
  /** ms per card; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number;
  background?: string;
  ink?: string;
  showButtons?: boolean;
  showCount?: boolean;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

/** Resting pose of a card `depth` places down the pile. Only the top four show. */
export function deckPose(depth: number, tilt: number, reduce = false) {
  const d = Math.min(depth, 3);
  return {
    y: d ? -d * 14 : 0,
    scale: 1 - d * 0.05,
    rot: depth === 0 || reduce ? 0 : tilt,
    opacity: depth > 3 ? 0 : 1,
    shade: 1 - d * 0.06,
  };
}

/** A stable, slightly random tilt per card, in [-max, max] degrees. */
export function tiltFor(i: number, max: number): number {
  const u = (((i + 1) * 2654435761) >>> 0) / 4294967296;
  return (u * 2 - 1) * max;
}

/** Did the drag end as a throw? dx in px, vx in px/ms, w = card width. */
export function isThrow(dx: number, vx: number, w: number): boolean {
  return Math.abs(dx) > w * 0.28 || (Math.abs(vx) > 0.55 && Math.abs(dx) > 24);
}

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}
// #endregion logic

/* ------------------------------------------------------- painted images fallback */

const PALETTES = {
  dawn: { top: "#e7b7a5", bottom: "#f8e8d6", sun: "#fff4df", far: "#d2b2bb", near: "#3a2a3b", mist: "255,240,232" },
  alpine: { top: "#7ea5c8", bottom: "#e3ecf2", sun: "#ffffff", far: "#a9bfd0", near: "#1c3044", mist: "236,244,250" },
  dusk: { top: "#2a2450", bottom: "#ef8d60", sun: "#ffd9a6", far: "#93607c", near: "#18121f", mist: "255,196,160" },
  mist: { top: "#c4d0cb", bottom: "#eef1ec", sun: "#ffffff", far: "#aebcb5", near: "#2c3a33", mist: "246,248,245" },
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hexRgb(h: string): [number, number, number] {
  const v = parseInt(h.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function mixRgb(a: string, b: string, t: number): string {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")";
}

function paintLandscape(seed: number, palette: LandPalette, w = 1600, h = 1000): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return "";
  const P = PALETTES[palette] ?? PALETTES.dawn;
  const r = mulberry32(seed * 104729 + 7);

  const sky = g.createLinearGradient(0, 0, 0, h * 0.72);
  sky.addColorStop(0, P.top);
  sky.addColorStop(1, P.bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  const sx = w * (0.22 + r() * 0.56);
  const sy = h * (0.26 + r() * 0.16);
  const halo = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.45);
  halo.addColorStop(0, "rgba(" + hexRgb(P.sun).join(",") + ",.85)");
  halo.addColorStop(0.08, "rgba(" + hexRgb(P.sun).join(",") + ",.55)");
  halo.addColorStop(1, "rgba(" + hexRgb(P.sun).join(",") + ",0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, w, h);
  g.fillStyle = P.sun;
  g.beginPath();
  g.arc(sx, sy, h * 0.045, 0, Math.PI * 2);
  g.fill();

  const layers = 5;
  for (let L = 0; L < layers; L++) {
    const k = L / (layers - 1);
    const base = h * (0.42 + k * 0.4);
    const amp = h * (0.07 + k * 0.1);
    const ph = [r(), r(), r(), r()].map((v) => v * Math.PI * 2);
    const fr = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4, 17 + r() * 8];
    const ridge = (x: number) => {
      const u = x / w;
      return (
        base -
        amp *
          (0.55 * Math.sin(u * fr[0] + ph[0]) +
            0.28 * Math.sin(u * fr[1] + ph[1]) +
            0.12 * Math.abs(Math.sin(u * fr[2] + ph[2])) +
            0.05 * Math.sin(u * fr[3] + ph[3]))
      );
    };
    const mist = g.createLinearGradient(0, base - amp * 1.4, 0, base + amp * 0.4);
    mist.addColorStop(0, "rgba(" + P.mist + ",0)");
    mist.addColorStop(1, "rgba(" + P.mist + "," + (0.55 - k * 0.35).toFixed(2) + ")");
    g.fillStyle = mist;
    g.fillRect(0, base - amp * 1.4, w, amp * 1.8);
    const body = g.createLinearGradient(0, base - amp, 0, h);
    body.addColorStop(0, mixRgb(P.far, P.near, Math.pow(k, 1.3)));
    body.addColorStop(1, mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.18)));
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) g.lineTo(x, ridge(x));
    g.lineTo(w, h);
    g.closePath();
    g.fill();
  }

  const vig = g.createRadialGradient(w / 2, h * 0.45, h * 0.3, w / 2, h / 2, w * 0.78);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,.32)");
  g.fillStyle = vig;
  g.fillRect(0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.88);
}

// Every slide as an image URL; slides without one are painted after mount.
function useSlideImages(slides: Slide[]): string[] {
  const key = slides.map((s) => s.image || (s.palette || "dawn") + ":" + (s.seed ?? 1)).join("|");
  const [painted, setPainted] = React.useState(() => slides.map(() => ""));
  React.useEffect(() => {
    setPainted(slides.map((s, i) => (s.image ? "" : paintLandscape(s.seed ?? i + 1, s.palette || "dawn"))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return slides.map((s, i) => s.image || painted[i] || "");
}

const CD_CSS = [
  ".cd-root{position:relative;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;overflow:visible;background:var(--cd-bg);color:var(--cd-ink);outline:none;padding:12px 0;box-sizing:border-box}",
  ".cd-root:focus-visible{box-shadow:none}",
  ".cd-deck{position:relative;width:var(--cd-w);aspect-ratio:var(--cd-aspect);max-width:100%;touch-action:pan-y;user-select:none;perspective:1000px}",
  ".cd-card{position:absolute;inset:0;border-radius:24px;overflow:hidden;background:#06080d;border:2px solid rgba(255,255,255,0.45);box-shadow:0 12px 36px rgba(0,0,0,0.22),0 32px 64px -16px rgba(4,50,36,0.38);transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease,filter .4s ease;will-change:transform}",
  ".cd-card[data-top='1']{cursor:grab}",
  ".cd-card[data-drag='1']{cursor:grabbing;transition:none}",
  ".cd-card[data-fly='1']{transition:transform .45s cubic-bezier(.3,.5,.3,1),opacity .45s ease}",
  ".cd-card[data-snap='1']{transition:none}",
  ".cd-card img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none;user-select:none}",
  ".cd-meta{display:flex;align-items:center;justify-content:center;gap:14px;width:min(var(--cd-w),100%);max-width:440px}",
  ".cd-cap{flex:1;min-width:0;overflow:hidden;text-align:center}",
  ".cd-cap>*{display:block;animation:cd-in .5s cubic-bezier(.2,.8,.2,1) both}",
  ".cd-title{font-family:var(--font-squada-one),'Squada One',cursive,sans-serif;letter-spacing:0.04em;text-transform:uppercase;font-size:clamp(20px,2.4vw,25px);line-height:1.15;color:var(--cd-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".cd-sub{margin-top:3px;font-family:var(--font-poppins),'Poppins',sans-serif;font-size:12px;font-weight:500;line-height:1.4;color:var(--cd-muted);animation-delay:.05s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".cd-count{font-family:var(--font-poppins),sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;color:var(--cd-ink);background:rgba(255,255,255,0.45);backdrop-filter:blur(6px);padding:3px 10px;border-radius:9999px;border:1px solid rgba(4,50,36,0.18);shrink:0}",
  ".cd-count b{font-weight:700}",
  ".cd-btn{appearance:none;border:1px solid var(--cd-line);background:transparent;color:inherit;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;flex:none;transition:background .2s ease,color .2s ease}",
  ".cd-btn:hover{background:var(--cd-ink);color:var(--cd-bg)}",
  ".cd-btn:focus-visible{outline:2px solid var(--cd-ink);outline-offset:2px}",
  ".cd-badge{position:absolute;top:12px;left:12px;z-index:10;padding:4px 10px;border-radius:9999px;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:var(--font-poppins),sans-serif;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#043224;box-shadow:0 2px 8px rgba(0,0,0,0.15);pointer-events:none}",
  ".cd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
  "@keyframes cd-in{from{transform:translateY(60%);opacity:0}to{transform:none;opacity:1}}",
  "@media (prefers-reduced-motion:reduce){.cd-card,.cd-card[data-fly='1']{transition:opacity .3s ease}.cd-cap>*{animation:none}}",
].join("\n");

type Override = { i: number; x: number; y: number; r: number; mode: "drag" | "fly" | "snap" };

export default function CardDeckCarousel({
  slides = [],
  height = "auto",
  cardWidth = "min(82vw, 340px)",
  aspect = "3.2 / 4.3",
  scatter = 7,
  autoplay = 3400,
  background = "transparent",
  ink = "#043224",
  showButtons = false,
  showCount = true,
  onChange,
  className,
  style,
  ariaLabel = "Featured Graded Card Slabs",
}: CardDeckCarouselProps) {
  const n = slides.length;
  const srcs = useSlideImages(slides);
  const [top, setTop] = React.useState(0);
  const [over, setOver] = React.useState(null as Override | null);
  const rootRef = React.useRef(null as HTMLDivElement | null);
  const deckRef = React.useRef(null as HTMLDivElement | null);
  const busy = React.useRef(false);
  const lastTouch = React.useRef(0);
  const topRef = React.useRef(0);
  topRef.current = top;
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const later = (fn: () => void, ms: number) => window.setTimeout(fn, ms);

  // Fly the top card off toward (dirX, dirY), then tuck it under the pile.
  const throwTop = React.useCallback(
    (dirX: number, fromX = 0, fromY = 0, dirY = 0) => {
      const w = deckRef.current?.offsetWidth || 340;
      if (busy.current || n < 2) return;
      busy.current = true;
      const i = topRef.current;
      const sx = dirX >= 0 ? 1 : -1;
      setOver({ i, x: fromX + sx * w * 1.25, y: fromY + dirY * 0.4 - 30, r: sx * 15, mode: "fly" });
      later(() => {
        setOver(null);
        setTop((t) => wrap(t + 1, n));
        busy.current = false;
      }, reduce ? 200 : 430);
    },
    [n, reduce],
  );

  // Pull the bottom card back on top from the left.
  const pullBack = React.useCallback(() => {
    const w = deckRef.current?.offsetWidth || 340;
    if (busy.current || n < 2) return;
    busy.current = true;
    const i = wrap(topRef.current - 1, n);
    setOver({ i, x: -w * 1.25, y: -30, r: -15, mode: "snap" });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOver({ i, x: 0, y: 0, r: 0, mode: "fly" });
        later(() => {
          setOver(null);
          setTop(i);
          busy.current = false;
        }, reduce ? 200 : 450);
      }),
    );
  }, [n, reduce]);

  React.useEffect(() => {
    onChange?.(top);
  }, [top, onChange]);

  React.useEffect(() => {
    if (!autoplay || n < 2) return;
    const root = rootRef.current;
    let seen = true;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    if (root) io.observe(root);
    const t = window.setInterval(() => {
      if (!seen || document.hidden || performance.now() - lastTouch.current < autoplay) return;
      throwTop(1);
    }, autoplay);
    return () => {
      window.clearInterval(t)
      io.disconnect();
    };
  }, [autoplay, n, throwTop]);

  // dragging the top card
  const drag = React.useRef(null as null | { x: number; y: number; lx: number; lt: number; vx: number });
  const onDown = (e: React.PointerEvent) => {
    lastTouch.current = performance.now();
    if (busy.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: e.timeStamp, vx: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.vx = 0.8 * ((e.clientX - d.lx) / dt) + 0.2 * d.vx;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    setOver({ i: topRef.current, x: dx, y: dy, r: reduce ? 0 : dx * 0.05, mode: "drag" });
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    lastTouch.current = performance.now();
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const w = deckRef.current?.offsetWidth || 340;
    if (isThrow(dx, d.vx, w)) throwTop(dx, dx, dy, dy);
    else setOver(null);
  };
  const onKey = (e: React.KeyboardEvent) => {
    lastTouch.current = performance.now();
    if (e.key === "ArrowRight") throwTop(1);
    else if (e.key === "ArrowLeft") pullBack();
    else return;
    e.preventDefault();
  };

  const s = slides[top] || {};

  return (
    <div
      ref={rootRef}
      className={["cd-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--cd-h" as string]: typeof height === "number" ? height + "px" : height,
        ["--cd-w" as string]: cardWidth,
        ["--cd-aspect" as string]: aspect,
        ["--cd-ar" as string]: aspect,
        ["--cd-bg" as string]: background,
        ["--cd-ink" as string]: ink,
        ["--cd-muted" as string]: "rgba(4, 50, 36, 0.72)",
        ["--cd-line" as string]: "rgba(4, 50, 36, 0.18)",
        ...style,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <style>{CD_CSS}</style>
      <div ref={deckRef} className="cd-deck">
        {slides.map((sl, i) => {
          const depth = wrap(i - top, n);
          const p = deckPose(depth, tiltFor(i, scatter), reduce);
          const o = over && over.i === i ? over : null;
          const isTop = depth === 0;
          const transform = o
            ? "translate(" + o.x + "px," + o.y + "px) rotate(" + o.r + "deg)"
            : "translateY(" + p.y + "px) scale(" + p.scale + ") rotate(" + p.rot.toFixed(2) + "deg)";
          return (
            <div
              key={i}
              className="cd-card group"
              data-top={isTop ? "1" : "0"}
              data-drag={o?.mode === "drag" ? "1" : "0"}
              data-fly={o?.mode === "fly" ? "1" : "0"}
              data-snap={o?.mode === "snap" ? "1" : "0"}
              style={{
                transform,
                zIndex: o ? n + 1 : n - depth,
                opacity: o ? 1 : p.opacity,
                filter: o || isTop ? "none" : "brightness(" + p.shade + ")",
              }}
              aria-hidden={isTop ? undefined : true}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
            >
              {sl.category && (
                <div className="cd-badge">
                  {sl.category} {sl.grade && `• ${sl.grade}`}
                </div>
              )}
              {srcs[i] ? (
                <img 
                  src={srcs[i]} 
                  alt={isTop ? sl.alt || sl.title || "" : ""} 
                  draggable={false} 
                />
              ) : null}
              {/* Subtle protective slab sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Underneath: Card Name & Set Information (Arrows omitted as requested) */}
      <div className="cd-meta">
        {showButtons && (
          <button 
            type="button" 
            className="cd-btn" 
            aria-label="Previous card" 
            onClick={() => ((lastTouch.current = performance.now()), pullBack())}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        )}

        <div className="cd-cap" key={top} aria-hidden="true">
          {s.title ? <span className="cd-title">{s.title}</span> : null}
          {s.caption ? <span className="cd-sub">{s.caption}</span> : null}
        </div>

        {showCount && (
          <span className="cd-count" aria-hidden="true">
            <b>{pad2(top + 1)}</b> / {pad2(n)}
          </span>
        )}

        {showButtons && (
          <button 
            type="button" 
            className="cd-btn" 
            aria-label="Next card" 
            onClick={() => ((lastTouch.current = performance.now()), throwTop(1))}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        )}
      </div>

      <div className="cd-sr" aria-live="polite">
        {"Card " + (top + 1) + " of " + n + (s.title ? ": " + s.title : "")}
      </div>
    </div>
  );
}
