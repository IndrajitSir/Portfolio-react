import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { FiTarget, FiLayers, FiCode, FiActivity, FiSend } from 'react-icons/fi'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'

/**
 * The engineering mindset, shown rather than listed.
 *
 * About used to be a paragraph plus a shell block. This trace turns "how I
 * approach building software" into a walkable path: a packet travels the route,
 * each stage lights as it passes, and the active stage explains what actually
 * happens there. It is deliberately a *path*, not a rail of dots, so it reads
 * differently from the Experience workflow stories.
 *
 * The route is a polyline with known vertices, so the packet position is sampled
 * arithmetically — no `offset-path` support assumptions, and the markers and the
 * path share one coordinate system.
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

const STEP_MS = 2800

// Viewbox geometry. Markers and the packet are both placed from these vertices,
// so the two can never drift apart.
const VB_W = 500
const VB_H = 60
const VERTICES = [
  { x: 34, y: 40 },
  { x: 140, y: 20 },
  { x: 250, y: 40 },
  { x: 360, y: 20 },
  { x: 466, y: 40 },
]

const PATH_D = VERTICES.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

/** Lengths of each segment plus the running total, for arc-length sampling. */
const SEGMENTS = VERTICES.slice(1).map((p, i) => {
  const a = VERTICES[i]
  return { a, b: p, len: Math.hypot(p.x - a.x, p.y - a.y) }
})
const TOTAL_LEN = SEGMENTS.reduce((sum, s) => sum + s.len, 0)

/** Point at a fraction (0–1) of the polyline's arc length. */
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
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Arc-length position of the travelling packet, animated rather than snapped.
  const progress = useMotionValue(0)
  const packetX = useTransform(progress, (p) => pctX(pointAtFraction(p).x))
  const packetY = useTransform(progress, (p) => pctY(pointAtFraction(p).y))

  const target = useMemo(() => active / (STAGES.length - 1), [active])

  useEffect(() => {
    if (reduceMotion) {
      progress.set(1)
      return
    }
    const controls = animate(progress, target, { duration: DURATION.reveal, ease: EASE_OUT_EXPO })
    return () => controls.stop()
  }, [target, progress, reduceMotion])

  useEffect(() => {
    if (reduceMotion || paused) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % STAGES.length), STEP_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion, paused])

  const stage = STAGES[active]
  const StageIcon = stage.icon
  const drawn = useTransform(progress, [0, 1], [0.02, 1])

  return (
    <div
      className="rounded-xl border border-[var(--border)] p-4 sm:p-5"
      style={{ background: 'var(--bg-primary)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: 'var(--accent-teal)' }}>
          How I build
        </p>
        <span className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
          {String(active + 1).padStart(2, '0')}/{String(STAGES.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── The path: route + stage markers in one coordinate system ── */}
      <div className="relative h-[86px] w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-[60px] w-full"
          fill="none"
          aria-hidden="true"
        >
          <path d={PATH_D} stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
          <motion.path
            d={PATH_D}
            stroke="var(--accent-teal)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ pathLength: drawn, opacity: 0.85 }}
          />
        </svg>

        {/* Travelling packet */}
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

        {/* Stage markers, positioned from the same vertices */}
        {STAGES.map((s, i) => {
          const lit = i <= active
          const isActive = i === active
          const Icon = s.icon
          const vertex = VERTICES[i]
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Stage ${i + 1}: ${s.label}`}
              aria-pressed={isActive}
              className="group absolute flex flex-col items-center outline-offset-4"
              style={{ left: pctX(vertex.x), top: pctY(vertex.y), transform: 'translate(-50%, -50%)' }}
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
            </button>
          )
        })}

        {/* Labels sit on a fixed baseline so they never collide with the path */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between">
          {STAGES.map((s, i) => (
            <span
              key={`${s.id}-label`}
              className="font-mono-code text-[0.56rem] uppercase tracking-wide transition-colors duration-200"
              style={{ color: i <= active ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Active stage explanation ────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className="relative mt-4 flex items-start gap-3 overflow-hidden rounded-lg border border-[var(--border)] p-3"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <span
          className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: 'var(--glow-teal)', color: 'var(--accent-teal)' }}
          aria-hidden="true"
        >
          <StageIcon size={14} />
        </span>
        <AnimatePresence mode="wait">
          <motion.p
            key={stage.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: DURATION.micro, ease: EASE_STANDARD }}
            className="text-[0.82rem] leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {stage.detail}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
