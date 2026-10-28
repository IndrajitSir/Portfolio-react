import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const ParticleSaturn = lazy(() => import("@/components/originkit/ui/particle-saturn-03"));

/**
 * HeroSaturn
 * ─────────────────────────────────────────────────────────────────────────────
 * A decorative particle-ringed planet floating in the hero's background
 * stack, behind the content and topology instrument.
 *
 * Adaptations from the raw OriginKit component:
 *   • Colors follow the portfolio's teal/indigo accents instead of the
 *     component's default red, so it stays inside the dark-only palette.
 *   • Particle density is trimmed relative to the defaults — at this size the
 *     additive cloud still reads fully without a heavy GPU bill.
 *   • The wrapper is `pointer-events-none`, so the component's drag surface is
 *     disabled and the planet can never steal clicks, hovers, Strobi, or page
 *     scroll — it is scenery, not an interactive node.
 *   • The wrapper is `aria-hidden`; the inner `role="img"` label is for the
 *     component's interactive use, not for this backdrop.
 *   • `prefers-reduced-motion` visitors get no planet: the composition is a
 *     persistent spin loop, there is no meaningful "calm frame", and the
 *     hero's other layers tell the same story in stillness.
 *   • The WebGL scene only mounts while the hero is (near) the viewport, so
 *     the render loop can't burn frames behind sections it can't be seen in.
 */

const ACCENT_TEAL = "rgb(94, 234, 212)";
const ACCENT_INDIGO = "rgb(129, 140, 248)";

export default function HeroSaturn() {
  const reduceMotion = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, [reduceMotion]);

  /* Mounting the planet pulls the whole Three.js chunk, and its setup runs on
     the main thread — the same thread that owes the hero its first paint. So it
     waits for the browser to go quiet rather than racing the LCP element. The
     2s cap is only the fallback for an engine without `requestIdleCallback`. */
  useEffect(() => {
    if (reduceMotion) return;
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (!w.requestIdleCallback) {
      const t = window.setTimeout(() => setIdle(true), 2000);
      return () => window.clearTimeout(t);
    }
    const id = w.requestIdleCallback(() => setIdle(true), { timeout: 2500 });
    return () => w.cancelIdleCallback?.(id);
  }, [reduceMotion]);

  return (
    <div
      ref={anchorRef}
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 z-0 h-[62vmin] w-[62vmin]
        opacity-[0.26]
        translate-x-[24%] -translate-y-[30%]
        sm:h-[56vmin] sm:w-[56vmin] sm:opacity-[0.48]
        sm:translate-x-[12%] sm:-translate-y-[10%]"
    >
      {inView && idle && (
        <Suspense fallback={null}>
          <ParticleSaturn
            coreColor={ACCENT_TEAL}
            ringColor={ACCENT_INDIGO}
            density={9}
            particleSize={14}
            glow={16}
            tilt={31}
            roll={-36}
            spinSpeed={7}
            ringOptions={{
              gaps: 2,
              orbitSpeed: 8,
              innerRadius: 128,
              outerRadius: 224,
            }}
            dragSensitivity={2}
            sizePercent={120}
          />
        </Suspense>
      )}
    </div>
  );
}
