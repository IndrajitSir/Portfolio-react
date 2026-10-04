import { memo, useEffect, useRef, useState, type ComponentType } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { FiTarget, FiLayers, FiCode, FiActivity, FiSend } from 'react-icons/fi'
import { DURATION, EASE_STANDARD } from '@/utils/motion'

/**
 * The engineering mindset, shown rather than listed.
 *
 * This is the animated explanation of how an idea becomes a working system. It
 * runs on **scroll, not a timer**: the page owns the clock, so the trace is
 * genuinely still when the reader is still, and nothing re-renders in the
 * background. Five stages — the ones the section already described — advance one
 * bottleneck at a time as the card travels the viewport:
 *
 *   1. Problem   — a single intent takes shape on an empty grid
 *   2. Model     — the intent organises into connected modules
 *   3. Build     — the modules fill in and link into a structure
 *   4. Measure   — the structure is probed and corrected
 *   5. Ship      — everything converges into one coherent system
 *
 * The route up top is the journey; the modules below are the system those five
 * steps produce, and they build in the same order. One `useScroll` value drives
 * both, so the picture and the stage you are reading can never disagree.
 *
 * Performance notes, because this section must not reintroduce the problems the
 * rest of the page just shed:
 *  - there is exactly one scroll subscription and no `setInterval`;
 *  - the active stage is state, but it only changes when the integer changes;
 *  - every transform is a scroll-derived `MotionValue`, so nothing loops;
 *  - reduced motion pins progress at 1 and prints all five stages as static text.
 */

interface Stage {
  id: string
  label: string
  detail: string
  icon: ComponentType<{ size?: number }>
}

const STAGES: Stage[] = [
  {
    id: 'problem',
    label: 'Problem',
    detail: 'Start from the real constraint — who is affected, what breaks, what "done" actually means.',
    icon: FiTarget,
  },
  {
    id: 'model',
    label: 'Model',
    detail: 'Map the data and the boundaries first: entities, relationships, access, and failure paths.',
    icon: FiLayers,
  },
  {
    id: 'build',
    label: 'Build',
    detail: 'Write the smallest correct thing, keep modules decoupled, and let contracts define the seams.',
    icon: FiCode,
  },
  {
    id: 'measure',
    label: 'Measure',
    detail: 'Index the queries that matter, trace the hot paths, and prove the improvement instead of assuming it.',
    icon: FiActivity,
  },
  {
    id: 'ship',
    label: 'Ship',
    detail: 'Ship it, document the trade-offs, then fold what worked back into the next system.',
    icon: FiSend,
  },
]

// Viewbox geometry. Markers, the route and the modules are all placed from these
// vertices, so the layers cannot drift apart.
const VB_W = 500
const VB_H = 200
const VERTICES = [
  { x: 34, y: 46 },
  { x: 140, y: 28 },
  { x: 250, y: 46 },
  { x: 360, y: 28 },
  { x: 466, y: 46 },
]

const PATH_D = VERTICES.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

const MOD_Y = 96
const MOD_W = 64
const MOD_H = 64
const MODULE_X = (i: number) => VERTICES[i].x - MOD_W / 2
const CONV_Y = 182

const SEGMENTS = VERTICES.slice(1).map((p, i) => {
  const a = VERTICES[i]
  return { a, b: p, len: Math.hypot(p.x - a.x, p.y - a.y) }
})
const TOTAL_LEN = SEGMENTS.reduce((sum, s) => sum + s.len, 0)

function pointAtFraction(t: number) {
  const target = Math.min(Math.max(t, 0), 1) * TOTAL_LEN
  let walked = 0
  for (const seg of SEGMENTS) {
    if (walked + seg.len >= target) {
      const local = seg.len === 0 ? 0 : (target - walked) / seg.len
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * local,
        y: seg.a.y + (seg.b.y - seg.a.y) * local,
      }
    }
    walked += seg.len
  }
  return { ...VERTICES[VERTICES.length - 1] }
}

const pctX = (x: number) => `${(x / VB_W) * 100}%`
const pctY = (y: number) => `${(y / VB_H) * 100}%`

export default function MindsetTrace() {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  const [override, setOverride] = useState<number | null>(null)
  const [scrollActive, setScrollActive] = useState(0)

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 0.85', 'end 0.45'],
  })

  // Reduced motion pins the value at 1: the whole system renders assembled and
  // the stage list below is printed in full.
  const finished = useMotionValue(1)
  const progress = reduceMotion ? finished : scrollYProgress

  useEffect(() => {
    if (reduceMotion) progress.set(1)
  }, [progress, reduceMotion])

  // State only when the integer stage changes — never per frame. Scrolling also
  // releases a manual selection so the picture goes back to following the page.
  useMotionValueEvent(progress, 'change', (v) => {
    const next = Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length)))
    setScrollActive((prev) => (prev === next ? prev : next))
    setOverride(null)
  })

  const active = override ?? scrollActive
  const stage = STAGES[active]
  const StageIcon = stage.icon

  // Route, packet and convergence, all scroll-derived.
  const drawn = useTransform(progress, [0, 0.18], [0.02, 1])
  const packetX = useTransform(progress, (p) => pctX(pointAtFraction(p).x))
  const packetY = useTransform(progress, (p) => pctY(pointAtFraction(p).y))
  const echoOpacity = useTransform(progress, [0, 0.4], [0.08, 0.3])
  const convergence = useTransform(progress, [0.82, 1], [0.02, 1])

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-xl border border-[var(--border)] p-4 sm:p-5"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: 'var(--accent-teal)' }}>
          How I build
        </p>
        <span className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
          {String(active + 1).padStart(2, '0')}/{String(STAGES.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── The picture: route above, the system it produces below ───── */}
      <div className="relative h-[200px] w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* Blueprint grid — the empty page every system starts on. */}
          <g stroke="var(--border)" strokeWidth="1" opacity="0.35">
            {[100, 200, 300, 400].map((x) => (
              <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={VB_H} />
            ))}
            {[40, 96, 132, 182].map((y) => (
              <line key={`gy${y}`} x1={0} y1={y} x2={VB_W} y2={y} />
            ))}
          </g>

          {/* A faint echo of the route, offset below for depth. */}
          <motion.path
            d={PATH_D}
            transform="translate(0, 10)"
            stroke="var(--accent-indigo)"
            strokeWidth="1"
            strokeDasharray="2 6"
            style={{ opacity: echoOpacity }}
          />

          {/* The route: dormant rail, then the travelled portion. */}
          <path d={PATH_D} stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
          <motion.path
            d={PATH_D}
            stroke="var(--accent-teal)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ pathLength: drawn, opacity: 0.85 }}
          />

          {/* Drops from each vertex to its module. */}
          {VERTICES.map((v, i) => (
            <DropLine key={`drop${i}`} x={v.x} y={v.y} index={i} progress={progress} />
          ))}

          {/* The modules, assembling one stage at a time. */}
          {STAGES.map((s, i) => (
            <Module key={s.id} index={i} progress={progress} />
          ))}

          {/* Convergence: one bar that fills as the system completes. */}
          <line
            x1={34}
            y1={CONV_Y}
            x2={VB_W - 34}
            y2={CONV_Y}
            stroke="var(--border)"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <motion.line
            x1={34}
            y1={CONV_Y}
            x2={VB_W - 34}
            y2={CONV_Y}
            stroke="var(--accent-teal)"
            strokeWidth={5}
            strokeLinecap="round"
            style={{ pathLength: convergence, opacity: 0.85 }}
          />
        </svg>

        {/* Travelling packet. */}
        {!reduceMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: packetX,
              top: packetY,
              background: 'var(--accent-teal)',
              boxShadow: '0 0 8px var(--accent-teal)',
            }}
          />
        )}

        {/* Stage markers — real buttons, positioned from the same vertices. */}
        {STAGES.map((s, i) => {
          const lit = i <= active
          const isActive = i === active
          const Icon = s.icon
          const vertex = VERTICES[i]
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setOverride(i)}
              aria-label={`Stage ${i + 1}: ${s.label}`}
              aria-pressed={isActive}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center outline-offset-4"
              style={{ left: pctX(vertex.x), top: pctY(vertex.y) }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors duration-200"
                style={{
                  borderColor: lit ? 'var(--accent-teal)' : 'var(--border)',
                  background: isActive ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                  color: isActive ? 'var(--bg-primary)' : lit ? 'var(--accent-teal)' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 0 14px var(--glow-teal)' : 'none',
                }}
              >
                <Icon size={13} />
              </span>
              <span
                className="mt-1 whitespace-nowrap font-mono-code text-[0.54rem] uppercase tracking-wide transition-colors duration-200"
                style={{ color: lit ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── The explanation ─────────────────────────────────────────── */}
      {reduceMotion ? (
        <ol className="mt-4 space-y-2">
          {STAGES.map((s, i) => {
            const Icon = s.icon
            return (
              <li
                key={s.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <span
                  className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{ background: 'var(--glow-teal)', color: 'var(--accent-teal)' }}
                  aria-hidden="true"
                >
                  <Icon size={14} />
                </span>
                <div>
                  <p
                    className="font-mono-code text-[0.6rem] uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {String(i + 1).padStart(2, '0')} · {s.label}
                  </p>
                  <p className="text-[0.82rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {s.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <span
            className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
            style={{ background: 'var(--glow-teal)', color: 'var(--accent-teal)' }}
            aria-hidden="true"
          >
            <StageIcon size={14} />
          </span>
          <motion.p
            key={stage.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.micro, ease: EASE_STANDARD }}
            className="text-[0.82rem] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {stage.detail}
          </motion.p>
        </div>
      )}
    </div>
  )
}

/** The dashed drop from a route vertex down to its module. */
const DropLine = memo(function DropLine({
  x,
  y,
  index,
  progress,
}: {
  x: number
  y: number
  index: number
  progress: MotionValue<number>
}) {
  const start = index / STAGES.length
  const opacity = useTransform(progress, [start, Math.min(1, start + 0.12)], [0, 0.5], { clamp: true })
  return (
    <motion.line x1={x} y1={y} x2={x} y2={MOD_Y} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" style={{ opacity }} />
  )
})

/**
 * One module of the system being assembled.
 *
 * The module for stage *i* lights over that stage's slice of the scroll, and the
 * link from the previous module draws with it — so scanning the trace reads as
 * the build order rather than five unrelated cards. Every value is scroll-derived
 * and the component is memoised, so a still page means a still picture.
 */
const Module = memo(function Module({
  index,
  progress,
}: {
  index: number
  progress: MotionValue<number>
}) {
  const start = index / STAGES.length
  const enter = useTransform(progress, [start, Math.min(1, start + 0.14)], [0, 1], { clamp: true })
  const lift = useTransform(enter, [0, 1], [12, 0])
  const linkLength = useTransform(enter, [0, 1], [0, 1])
  const linkOpacity = useTransform(enter, [0, 1], [0, 0.6])

  const x = MODULE_X(index)
  const isLast = index === STAGES.length - 1

  return (
    <g>
      {index > 0 && (
        <motion.line
          x1={MODULE_X(index - 1) + MOD_W}
          y1={MOD_Y + MOD_H / 2}
          x2={x}
          y2={MOD_Y + MOD_H / 2}
          stroke="var(--accent-teal)"
          strokeWidth="1"
          strokeDasharray="2 3"
          style={{ pathLength: linkLength, opacity: linkOpacity }}
        />
      )}

      <motion.g style={{ opacity: enter, y: lift }}>
        <rect
          x={x}
          y={MOD_Y}
          width={MOD_W}
          height={MOD_H}
          rx={9}
          fill="var(--bg-secondary)"
          stroke="var(--accent-teal)"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        {/* A little "structure": three bars that read as content. */}
        <rect x={x + 10} y={MOD_Y + 14} width={MOD_W - 20} height={6} rx={3} fill="var(--accent-teal)" opacity="0.35" />
        <rect x={x + 10} y={MOD_Y + 27} width={MOD_W - 30} height={6} rx={3} fill="var(--accent-teal)" opacity="0.22" />
        <rect x={x + 10} y={MOD_Y + 40} width={MOD_W - 24} height={6} rx={3} fill="var(--accent-teal)" opacity="0.16" />
        {isLast && <rect x={x + MOD_W - 16} y={MOD_Y + 8} width={8} height={8} rx={2} fill="var(--accent-teal)" />}
      </motion.g>
    </g>
  )
})
