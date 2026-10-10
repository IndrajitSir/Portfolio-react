import { useRef, type ComponentProps, type CSSProperties, type PointerEvent } from 'react';
import MagneticButton from './MagneticButton'; // adjust to your path

type Side = 'top' | 'right' | 'bottom' | 'left';

interface Drop { side: Side; at: string; size: number; delay: number; dur: number }

// Drops spill from every edge. Delays start after the fill has landed (~0.6s).
const DROPS: Drop[] = [
  { side: 'bottom', at: '20%', size: 10, delay: 0.65, dur: 2.4 },
  { side: 'bottom', at: '62%', size: 12, delay: 0.95, dur: 2.8 },
  { side: 'top',    at: '36%', size: 9,  delay: 0.8,  dur: 2.6 },
  { side: 'top',    at: '80%', size: 10, delay: 1.2,  dur: 2.3 },
  { side: 'left',   at: '48%', size: 9,  delay: 0.85, dur: 2.5 },
  { side: 'right',  at: '52%', size: 10, delay: 1.1,  dur: 2.7 },
];

function dropStyle(d: Drop): CSSProperties {
  const h = d.size / 2;
  const base = {
    width: d.size,
    height: d.size,
    background: 'var(--accent-teal)',
    '--dl': `${d.delay}s`,
    '--dur': `${d.dur}s`,
    '--d': d.side === 'bottom' || d.side === 'right' ? 1 : -1,
  } as CSSProperties;

  switch (d.side) {
    case 'top':    return { ...base, top: -h, left: `calc(${d.at} - ${h}px)` };
    case 'bottom': return { ...base, top: `calc(100% - ${h}px)`, left: `calc(${d.at} - ${h}px)` };
    case 'left':   return { ...base, left: -h, top: `calc(${d.at} - ${h}px)` };
    case 'right':  return { ...base, left: `calc(100% - ${h}px)`, top: `calc(${d.at} - ${h}px)` };
  }
}

/** Which edge of the element is the pointer closest to (works for just-outside points too). */
function nearestSide(e: PointerEvent<HTMLElement>): Side {
  const r = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const dist: Record<Side, number> = { left: x, right: r.width - x, top: y, bottom: r.height - y };
  return (Object.keys(dist) as Side[]).reduce((a, b) => (dist[a] <= dist[b] ? a : b));
}

type Props = { onClick?: ComponentProps<typeof MagneticButton>['onClick'] };

export default function HireMeButton({ onClick }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const idle = useRef(true);

  const enter = (side: Side) => {
    const el = root.current;
    if (!el) return;
    // If the fill is parked off-screen, teleport it to the entry edge first
    // (transitions off), then let it flow in. If it's mid-drain, just reverse.
    if (idle.current) {
      el.dataset.side = side;
      el.classList.add('hb-snap');
      void el.offsetWidth; // flush styles
      el.classList.remove('hb-snap');
    }
    idle.current = false;
    el.dataset.idle = 'false';
    el.dataset.active = 'true';
  };

  const leave = (side: Side) => {
    const el = root.current;
    if (!el) return;
    el.dataset.side = side; // drain out through the exit edge
    el.dataset.active = 'false';
  };

  const onTransitionEnd = (e: React.TransitionEvent) => {
    const el = root.current;
    if (!el || !(e.target as HTMLElement).classList.contains('hb-fill')) return;
    if (el.dataset.active === 'false') {
      idle.current = true;
      el.dataset.idle = 'true'; // stops the wobble so nothing animates at rest
    }
  };

  return (
    <div
      ref={root}
      className="hb hidden lg:block w-fit"
      data-side="bottom"
      data-active="false"
      data-idle="true"
      onPointerEnter={(e) => enter(nearestSide(e))}
      onPointerLeave={(e) => leave(nearestSide(e))}
      onTransitionEnd={onTransitionEnd}
    >
      <MagneticButton
        href="#contact"
        strength={0.18}
        onClick={onClick}
        className="
          hb-btn relative inline-flex items-center justify-center
          px-4 py-1.5 rounded-full border border-[var(--accent-teal)]
          text-[var(--accent-teal)] text-[0.72rem] font-semibold tracking-wide
          2xl:px-5 2xl:py-2 2xl:text-[0.8rem]
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
          focus-visible:outline-[var(--accent-teal)]
        "
      >
        {/* Goo filter: blur, then crush alpha so neighbouring shapes fuse */}
        <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
          <defs>
            <filter id="hb-goo" x="-40%" y="-120%" width="180%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>

        {/* Gooey layer: liquid fill (clipped to the pill) + drops (free to spill outside) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ filter: 'url(#hb-goo)' }}
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="hb-fill absolute inset-0" style={{ background: 'var(--accent-teal)' }}>
              {/* Wobbling bubbles along the leading edge give the front a liquid look */}
              <span className="hb-crest absolute flex justify-around">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="block h-[14px] w-[14px] shrink-0 rounded-full"
                    style={{ background: 'var(--accent-teal)' }}
                  />
                ))}
              </span>
            </span>
          </span>

          {DROPS.map((d, i) => (
            <span
              key={i}
              className="hb-drop absolute block rounded-full"
              data-axis={d.side === 'top' || d.side === 'bottom' ? 'v' : 'h'}
              style={dropStyle(d)}
            />
          ))}
        </span>

        {/* Base label (teal) */}
        <span className="relative">Hire Me</span>

        {/* Inverted label, revealed by a clip that moves with the fill.
            The inner span counter-translates so the text itself never moves. */}
        <span aria-hidden="true" className="hb-wipe pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="hb-unwipe absolute inset-0 flex items-center justify-center"
            style={{ color: 'var(--bg-primary)' }}
          >
            Hire Me
          </span>
        </span>
      </MagneticButton>
    </div>
  );
}