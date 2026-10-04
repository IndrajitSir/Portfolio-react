import { memo, useEffect, useRef, useState, type ComponentType } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'framer-motion'
import { FiTarget, FiLayers, FiCode, FiActivity, FiSend } from 'react-icons/fi'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'
import StageFrame, { FRAME_H, FRAME_W } from './MindsetFrames'

/**
 * The engineering mindset, shown rather than listed.
 *
 * This is the animated explanation of how an idea becomes a working system. It
 * runs on **scroll, not on a timer**: the page owns the clock, so the trace is
 * genuinely still when the reader is still, and nothing re-renders in the
 * background. Five stages — the ones the section already described — advance one
 * at a time as the card travels the viewport:
 *
 *   1. Problem   — a single constraint takes shape, then splits into work
 *   2. Model     — the constraints organise into modules and their interfaces
 *   3. Build     — the modules fill in and link into a working structure
 *   4. Measure   — the structure is probed and the hot path corrected
 *   5. Ship      — everything converges into one coherent system
 *
 * The route up top is the journey; the five frames below are the system those
 * steps produce, one diagram each, and they build in the same order. A single
 * `useScroll` value drives the route, the frames and the active stage, so the
 * picture and the sentence you are reading can never disagree.
 *
 * Performance notes, because this section must not reintroduce the problems the
 * rest of the page just shed:
 *  - there is exactly one scroll subscription and no `setInterval`;
 *  - the active stage is state, but it only changes when the integer changes;
 *  - every transform is a scroll-derived `MotionValue`, so nothing loops, and
 *    an off-screen section has no animation work to pause at all;
 *  - the frames are plain SVG with `non-scaling-stroke`, so nothing is measured
 *    or reflowed while they draw;
 *  - reduced motion pins progress at 1 and prints all five stages as static text.
 */

interface Stage {
  id: string
  label: string
  detail: string
  /** What the frame below this stage is showing. */
  frame: string
  icon: ComponentType<{ size?: number }>
}

const STAGES: Stage[] = [
  {
    id: 'problem',
    label: 'Problem',
    frame: 'Decomposition',
    detail: 'Start from the real constraint — who is affected, what breaks, what "done" actually means.',
    icon: FiTarget,
  },
  {
    id: 'model',
    label: 'Model',
    frame: 'Architecture',
    detail: 'Map the data and the boundaries first: entities, relationships, access, and failure paths.',
    icon: FiLayers,
  },
  {
    id: 'build',
    label: 'Build',
    frame: 'Implementation',
    detail: 'Write the smallest correct thing, keep modules decoupled, and let contracts define the seams.',
    icon: FiCode,
  },
  {
    id: 'measure',
    label: 'Measure',
    frame: 'Measurement',
    detail: 'Index the queries that matter, trace the hot paths, and prove the improvement instead of assuming it.',
    icon: FiActivity,
  },
  {
    id: 'ship',
    label: 'Ship',
    frame: 'Release',
    detail: 'Ship it, document the trade-offs, then fold what worked back into the next system.',
    icon: FiSend,
  },
]

// Viewbox geometry. Markers, the route and the frames are all placed from these
// vertices, so the layers cannot drift apart.
const VB_W = 500
const VB_H = 200
const VERTICES = [
  { x: 42, y: 46 },
  { x: 146, y: 28 },
  { x: 250, y: 46 },
  { x: 354, y: 28 },
  { x: 458, y: 46 },
]

const PATH_D = VERTICES.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

const MOD_Y = 94
const MODULE_X = (i: number) => VERTICES[i].x - FRAME_W / 2
const FRAME_MID_Y = MOD_Y + FRAME_H / 2
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

/** Enough of the picture is drawn to read at any width without measuring it. */
const HAIRLINE = {
  stroke: 'var(--accent-teal)',
  strokeWidth: 1,
  strokeLinecap: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const

export default function MindsetTrace() {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)

  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 0.85', 'end 0.45'],
  })

  // Reduced motion pins the value at 1: the whole system renders assembled and
  // the stage list below is printed in full.
  const finished = useMotionValue(1)
  const base = reduceMotion ? finished : scrollYProgress

  // Choosing a stage by hand hands the *whole* trace to it — route, frames and
  // caption included — and animates the picture there, so a frame is never
  // highlighted while it is still empty. Scrolling gives the page its clock back.
  const pinned = useMotionValue(0)
  const followPage = useMotionValue(1)
  const progress = useTransform(
    [base, pinned, followPage],
    ([scrolled, held, follow]: number[]) => scrolled + (held - scrolled) * (1 - follow),
  )
  const playRef = useRef<AnimationPlaybackControls | null>(null)
  const anchorRef = useRef<number | null>(null)

  // State only when the integer stage changes — never per frame.
  useMotionValueEvent(progress, 'change', (v) => {
    const next = Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length)))
    setActive((prev) => (prev === next ? prev : next))
  })

  // A real scroll (not a pixel of jitter) releases the hold.
  useMotionValueEvent(scrollYProgress, 'change', () => {
    if (anchorRef.current === null) return
    if (Math.abs(scrollYProgress.get() - anchorRef.current) <= 0.004) return
    anchorRef.current = null
    followPage.set(1)
  })

  useEffect(() => () => playRef.current?.stop(), [])

  const stage = STAGES[active]
  const StageIcon = stage.icon

  const selectStage = (i: number) => {
    // 0.9 of the way through this stage: the stage still reads as the current
    // one, and its frame has finished assembling.
    const target = (i + 0.9) / STAGES.length
    anchorRef.current = scrollYProgress.get()
    pinned.set(progress.get())
    followPage.set(0)
    playRef.current?.stop()
    if (reduceMotion) {
      pinned.set(target)
      return
    }
    playRef.current = animate(pinned, target, { duration: DURATION.base, ease: EASE_OUT_EXPO })
  }

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

        {/* The wiring: each route vertex drops into its frame, and each frame
            links to the next. Kept in its own layer so these hairlines stay a
            crisp pixel wide however far the trace is stretched. */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {STAGES.map((s, i) => (
            <FrameWiring key={s.id} index={i} progress={progress} />
          ))}
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

        {/* The five diagrams — one per stage, assembled in build order. */}
        {STAGES.map((s, i) => (
          <StageFrame
            key={s.id}
            index={i}
            progress={progress}
            active={i === active}
            left={pctX(MODULE_X(i))}
            top={pctY(MOD_Y)}
          />
        ))}

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
              onClick={() => selectStage(i)}
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
                    {String(i + 1).padStart(2, '0')} · <span style={{ color: 'var(--text-primary)' }}>{s.label}</span>
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
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.micro, ease: EASE_STANDARD }}
          >
            <p className="font-mono-code text-[0.56rem] uppercase tracking-widest" style={{ color: 'var(--accent-teal)' }}>
              {stage.frame}
            </p>
            <p className="mt-0.5 text-[0.82rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {stage.detail}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

/**
 * The wiring into and between the frames.
 *
 * The drop from a route vertex and the link to the next frame both draw over the
 * stage's slice of the scroll, which is what makes the frames read as one system
 * being assembled in order rather than five unrelated pictures. Memoised and
 * scroll-derived throughout: a still page means a still picture.
 */
const FrameWiring = memo(function FrameWiring({
  index,
  progress,
}: {
  index: number
  progress: MotionValue<number>
}) {
  const start = index / STAGES.length
  const enter = useTransform(progress, [start, start + 0.12], [0, 1], { clamp: true })
  const wire = useTransform(enter, [0, 1], [0.3, 0.8])

  const vertex = VERTICES[index]
  const left = MODULE_X(index)

  return (
    <g>
      <motion.line
        x1={vertex.x}
        y1={vertex.y}
        x2={vertex.x}
        y2={MOD_Y}
        strokeDasharray="2 4"
        {...HAIRLINE}
        style={{ opacity: wire }}
      />
      {index > 0 && (
        <motion.line
          x1={MODULE_X(index - 1) + FRAME_W}
          y1={FRAME_MID_Y}
          x2={left}
          y2={FRAME_MID_Y}
          {...HAIRLINE}
          style={{ pathLength: enter, opacity: 0.55 }}
        />
      )}
    </g>
  )
})