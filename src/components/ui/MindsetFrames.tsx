import { memo, type ComponentType } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

/**
 * The five diagrams that live inside the "How I Build" stage frames.
 *
 * Each frame is one engineering idea rendered as a miniature system diagram:
 *
 *   1. Problem → one node splits into connected tasks
 *   2. Model   → modules joined through explicit ports
 *   3. Build   → code compiled, then checks pass
 *   4. Measure → a hot query traced, then flattened
 *   5. Ship    → five inputs gathered into one artifact
 *
 * Two rules keep them honest rather than decorative:
 *
 *  - **Nodes are always there.** Every module is drawn from the start at a low
 *    opacity — the blueprint — and *brightens* as its stage is reached. Only the
 *    connectors draw. A relationship appearing therefore means a relationship
 *    was established, which is the only animation here that carries meaning.
 *  - **One clock.** Every reveal is a window on the same `progress` MotionValue
 *    the timeline and the route already use, so nothing here runs its own loop.
 *    Off-screen there is no work to pause, and the finished state is stable.
 *
 * Geometry is authored in each frame's own 84×76 space and rendered with
 * `vector-effect: non-scaling-stroke`, so the hairlines stay 1px whether the
 * trace is squeezed onto a phone or stretched across a wide screen — and no
 * shape is measured or scaled by its own box.
 */

/** Frame size, in the trace's 500×200 viewBox units. */
export const FRAME_W = 84
export const FRAME_H = 76

/** What each frame is showing, for anyone who cannot see it. */
const FRAME_LABELS = [
  'One problem broken into three connected tasks',
  'Four modules joined through explicit ports',
  'Code compiled, then three checks passed',
  'A slow query traced, then flattened after the fix',
  'Five inputs gathered into one shipped artifact',
] as const

type Reveal = MotionValue<number>

/**
 * A 0→1 window on the frame's local progress: nothing before `from`, finished
 * after `to`. Every element in a frame is one of these, which is what keeps the
 * whole set choreographed instead of five unrelated loops.
 */
const useWindow = (t: Reveal, from: number, to: number) =>
  useTransform(t, [from, to], [0, 1], { clamp: true })

/** 1px hairline that ignores the trace's horizontal stretch. */
const LINE = {
  fill: 'none',
  stroke: 'var(--accent-teal)',
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  vectorEffect: 'non-scaling-stroke',
} as const

const SOLID = { fill: 'var(--accent-teal)', stroke: 'none' } as const

/** A tick: the same shape wherever something is confirmed done. */
const tick = (cx: number, cy: number) => `M${cx - 2.6} ${cy}l2.2 2.4 4-5.2`

/**
 * One module. The outline carries the "always present" floor — a dim blueprint
 * that brightens as the stage is reached — and a wash fills in behind it.
 * `reveal` is the frame-local window for this module, so a node only ever costs
 * the one interpolated opacity it actually needs.
 */
const Node = memo(function Node({
  x,
  y,
  w,
  h,
  reveal,
  rx = 3,
}: {
  x: number
  y: number
  w: number
  h: number
  reveal: Reveal
  rx?: number
}) {
  const edge = useTransform(reveal, [0, 1], [0.26, 0.9])
  return (
    <g>
      <motion.rect x={x} y={y} width={w} height={h} rx={rx} {...LINE} style={{ opacity: edge }} />
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        {...SOLID}
        fillOpacity={0.1}
        style={{ opacity: reveal }}
      />
    </g>
  )
})

/** A small filled square: the "core" inside a module. */
const Core = memo(function Core({ cx, cy, reveal }: { cx: number; cy: number; reveal: Reveal }) {
  return <motion.rect x={cx - 2} y={cy - 2} width={4} height={4} rx={1} {...SOLID} style={{ opacity: reveal }} />
})

/** A connector point on a module's edge — where an interface actually is. */
const Port = memo(function Port({ cx, cy, reveal }: { cx: number; cy: number; reveal: Reveal }) {
  return (
    <>
      <motion.circle cx={cx} cy={cy} r={2.6} {...LINE} style={{ opacity: reveal }} />
      <motion.circle cx={cx} cy={cy} r={1.1} {...SOLID} style={{ opacity: reveal }} />
    </>
  )
})

/* ── 1 · Decomposition — one constraint, split into tractable units ───────── */

const DecompositionDiagram = memo(function DecompositionDiagram({ t }: { t: Reveal }) {
  const root = useWindow(t, 0, 0.18)
  const stem = useWindow(t, 0.16, 0.36)
  const bus = useWindow(t, 0.26, 0.44)
  const drops = useWindow(t, 0.36, 0.54)
  const task = [useWindow(t, 0.44, 0.6), useWindow(t, 0.52, 0.68), useWindow(t, 0.6, 0.76)]
  const dep = useWindow(t, 0.7, 0.84)

  return (
    <g>
      {/* The problem, before anyone touched it. */}
      <Node x={29} y={8} w={26} h={13} reveal={root} />
      <Core cx={42} cy={14.5} reveal={root} />

      {/* The split itself: one trunk, a bus, three drops. */}
      <motion.path d="M42 21V44" {...LINE} strokeOpacity={0.7} style={{ pathLength: stem }} />
      <motion.path d="M17 32H67" {...LINE} strokeOpacity={0.7} style={{ pathLength: bus }} />
      <motion.path d="M17 32V44M67 32V44" {...LINE} strokeOpacity={0.7} style={{ pathLength: drops }} />

      {/* Three tasks, each with a core and its own confirmation. */}
      {[17, 42, 67].map((cx, i) => (
        <g key={cx}>
          <Node x={cx - 8.5} y={44} w={17} h={11} reveal={task[i]} rx={2.5} />
          <Core cx={cx - 3.4} cy={49.5} reveal={task[i]} />
          <motion.path d={tick(cx, 64.5)} {...LINE} style={{ pathLength: task[i] }} />
        </g>
      ))}

      {/* The one dependency between them — drawn dimmer than the split. */}
      <motion.line x1={50.5} y1={49.5} x2={58.5} y2={49.5} {...LINE} strokeOpacity={0.45} style={{ pathLength: dep }} />
    </g>
  )
})

/* ── 2 · Architecture — modules meeting only at declared ports ────────────── */

const ArchitectureDiagram = memo(function ArchitectureDiagram({ t }: { t: Reveal }) {
  const api = useWindow(t, 0, 0.18)
  const stem = useWindow(t, 0.18, 0.34)
  const topBus = useWindow(t, 0.26, 0.42)
  const topDrops = useWindow(t, 0.34, 0.48)
  const service = useWindow(t, 0.44, 0.58)
  const auth = useWindow(t, 0.52, 0.66)
  const lowDrops = useWindow(t, 0.58, 0.72)
  const lowBus = useWindow(t, 0.64, 0.76)
  const trunk = useWindow(t, 0.7, 0.82)
  const data = useWindow(t, 0.78, 0.92)

  return (
    <g>
      {/* The entry point, then the two capabilities it fans out to. */}
      <Node x={29} y={7} w={26} h={11} reveal={api} />
      <Core cx={42} cy={12.5} reveal={api} />
      <Port cx={42} cy={18} reveal={api} />
      <motion.path d="M42 18V24" {...LINE} strokeOpacity={0.7} style={{ pathLength: stem }} />
      <motion.path d="M19.5 24H64.5" {...LINE} strokeOpacity={0.7} style={{ pathLength: topBus }} />
      <motion.path d="M19.5 24V31M64.5 24V31" {...LINE} strokeOpacity={0.7} style={{ pathLength: topDrops }} />

      <Node x={7} y={31} w={25} h={11} reveal={service} />
      <Core cx={19.5} cy={36.5} reveal={service} />
      <Port cx={19.5} cy={31} reveal={service} />
      <Port cx={19.5} cy={42} reveal={service} />

      <Node x={52} y={31} w={25} h={11} reveal={auth} />
      <Core cx={64.5} cy={36.5} reveal={auth} />
      <Port cx={64.5} cy={31} reveal={auth} />
      <Port cx={64.5} cy={42} reveal={auth} />

      {/* Both capabilities meet a single storage layer through a shared bus. */}
      <motion.path d="M19.5 42V49M64.5 42V49" {...LINE} strokeOpacity={0.7} style={{ pathLength: lowDrops }} />
      <motion.path d="M19.5 49H64.5" {...LINE} strokeOpacity={0.7} style={{ pathLength: lowBus }} />
      <motion.path d="M42 49V57" {...LINE} strokeOpacity={0.7} style={{ pathLength: trunk }} />

      <Node x={28} y={57} w={28} h={11} reveal={data} />
      <Core cx={42} cy={62.5} reveal={data} />
      <Port cx={42} cy={57} reveal={data} />
    </g>
  )
})

/* ── 3 · Implementation — written, compiled, then verified ───────────────── */

const ImplementationDiagram = memo(function ImplementationDiagram({ t }: { t: Reveal }) {
  const panel = useWindow(t, 0, 0.14)
  const line1 = useWindow(t, 0.1, 0.26)
  const line2 = useWindow(t, 0.18, 0.34)
  const line3 = useWindow(t, 0.26, 0.42)
  const build = useWindow(t, 0.34, 0.52)
  const check = [useWindow(t, 0.54, 0.68), useWindow(t, 0.64, 0.78), useWindow(t, 0.74, 0.9)]

  return (
    <g>
      {/* The change, as a small editor buffer. */}
      <Node x={8} y={6} w={68} h={22} reveal={panel} rx={3} />
      <motion.line x1={14} y1={6} x2={14} y2={28} {...LINE} strokeOpacity={0.4} style={{ opacity: panel }} />
      <motion.line x1={18} y1={11.5} x2={56} y2={11.5} {...LINE} strokeWidth={2.4} style={{ pathLength: line1 }} />
      <motion.line x1={18} y1={17} x2={44} y2={17} {...LINE} strokeWidth={2.4} stroke="var(--accent-indigo)" style={{ pathLength: line2 }} />
      <motion.line x1={24} y1={22.5} x2={42} y2={22.5} {...LINE} strokeWidth={2.4} style={{ pathLength: line3 }} />

      {/* The build, running to completion. */}
      <motion.line x1={12} y1={35} x2={72} y2={35} {...LINE} strokeWidth={3} style={{ opacity: 0.25 }} />
      <motion.path d="M30 33V37M48 33V37" {...LINE} strokeOpacity={0.4} style={{ opacity: build }} />
      <motion.line x1={12} y1={35} x2={72} y2={35} {...LINE} strokeWidth={3} style={{ pathLength: build }} />

      {/* Three checks, one at a time, until the work is provably good. */}
      {[47, 57, 67].map((y, i) => (
        <g key={y}>
          <motion.path d={tick(12.5, y)} {...LINE} style={{ pathLength: check[i] }} />
          <motion.line x1={23} y1={y} x2={56} y2={y} {...LINE} strokeWidth={2} style={{ pathLength: check[i] }} />
          <motion.circle cx={70} cy={y} r={2.4} {...LINE} style={{ opacity: check[i] }} />
          <motion.circle cx={70} cy={y} r={1.3} {...SOLID} style={{ opacity: check[i] }} />
        </g>
      ))}
    </g>
  )
})

/* ── 4 · Measurement — find the hot path, then prove it is gone ──────────── */

const MeasurementDiagram = memo(function MeasurementDiagram({ t }: { t: Reveal }) {
  const before = useWindow(t, 0.04, 0.34)
  const mark = useWindow(t, 0.34, 0.5)
  const after = useWindow(t, 0.52, 0.82)
  const area = useWindow(t, 0.66, 0.94)
  // The axes stay put at the floor of their chart, the way a grid does.
  const topAxis = useTransform(before, [0, 1], [0.25, 0.55])
  const lowAxis = useTransform(area, [0, 1], [0.25, 0.55])

  return (
    <g>
      {/* The profile as it was: one query dominating everything around it. */}
      <Node x={8} y={8} w={68} h={26} reveal={before} rx={3} />
      <motion.line x1={10} y1={32} x2={74} y2={32} {...LINE} style={{ opacity: topAxis }} />
      <motion.path
        d="M10 27l12-2.5 9-12.5 9 15 12-3.5 22 1.5"
        {...LINE}
        stroke="var(--accent-indigo)"
        style={{ pathLength: before }}
      />
      <motion.circle cx={31} cy={12} r={1.8} {...SOLID} fillOpacity={0.8} style={{ opacity: mark }} />
      <motion.line x1={31} y1={14} x2={31} y2={32} {...LINE} strokeOpacity={0.4} style={{ opacity: mark }} />

      {/* The same query, pulled down to the floor of the chart. */}
      <Node x={8} y={40} w={68} h={32} reveal={after} rx={3} />
      <motion.path
        d="M10 66l12-4 9 1.5 9-2.5 12 1.5 11-4.5 11 2v10H10Z"
        {...SOLID}
        fillOpacity={0.08}
        style={{ opacity: area }}
      />
      <motion.path
        d="M10 66l12-4 9 1.5 9-2.5 12 1.5 11-4.5 11 2"
        {...LINE}
        style={{ pathLength: after }}
      />
      <motion.line x1={10} y1={70} x2={74} y2={70} {...LINE} style={{ opacity: lowAxis }} />
      <motion.circle cx={31} cy={63.5} r={2.4} {...LINE} style={{ opacity: after }} />
      <motion.circle cx={31} cy={63.5} r={1.2} {...SOLID} style={{ opacity: after }} />
    </g>
  )
})

/* ── 5 · Release — everything gathered into one thing that ships ─────────── */

const ReleaseDiagram = memo(function ReleaseDiagram({ t }: { t: Reveal }) {
  const inputs = useWindow(t, 0.02, 0.26)
  const feeds = useWindow(t, 0.16, 0.4)
  const bus = useWindow(t, 0.38, 0.56)
  const trunk = useWindow(t, 0.54, 0.7)
  const artifact = useWindow(t, 0.66, 0.82)
  const shipped = useWindow(t, 0.78, 0.94)
  const waiting = useTransform(inputs, [0, 1], [0.26, 0.9])

  return (
    <g>
      {/* The five stages, as five inputs — present from the first frame. */}
      {[16, 28, 40, 52, 64].map((y) => (
        <g key={y}>
          <motion.circle cx={10} cy={y} r={2.6} {...LINE} style={{ opacity: waiting }} />
          <motion.circle cx={10} cy={y} r={1.2} {...SOLID} style={{ opacity: waiting }} />
        </g>
      ))}

      {/* Gathered, not merely stacked: one bus, one trunk, one artifact. */}
      <motion.path d="M12.6 16H34M12.6 28H34M12.6 40H34M12.6 52H34M12.6 64H34" {...LINE} strokeOpacity={0.7} style={{ pathLength: feeds }} />
      <motion.path d="M34 16V64" {...LINE} strokeOpacity={0.7} style={{ pathLength: bus }} />
      <motion.path d="M34 40H52" {...LINE} strokeOpacity={0.7} style={{ pathLength: trunk }} />

      <Node x={52} y={28} w={24} h={24} reveal={artifact} rx={6} />
      <motion.path d="M58 41l4.5 5 8-9.5" {...LINE} style={{ pathLength: shipped }} />
      <motion.line x1={54} y1={58} x2={74} y2={58} {...LINE} strokeOpacity={0.45} style={{ opacity: shipped }} />
    </g>
  )
})

const DIAGRAMS: readonly ComponentType<{ t: Reveal }>[] = [
  DecompositionDiagram,
  ArchitectureDiagram,
  ImplementationDiagram,
  MeasurementDiagram,
  ReleaseDiagram,
]

/**
 * The SVG body of one frame. The frame's own clock is a window on the trace's
 * shared progress, so a frame is complete exactly when its stage is reached —
 * whether that happened by scrolling or by selecting the stage by hand.
 */
const StageFrame = memo(function StageFrame({
  index,
  progress,
  active,
  left,
  top,
}: {
  index: number
  progress: MotionValue<number>
  active: boolean
  left: string
  top: string
}) {
  const t = useTransform(progress, [index / 5, index / 5 + 0.16], [0, 1], { clamp: true })
  const Diagram = DIAGRAMS[index] ?? DIAGRAMS[0]

  return (
    <div
      data-lit={active ? 'true' : 'false'}
      className="mindset-frame absolute overflow-hidden rounded-lg"
      style={{
        left,
        top,
        width: `${(FRAME_W / 500) * 100}%`,
        height: `${(FRAME_H / 200) * 100}%`,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
      role="img"
      aria-label={FRAME_LABELS[index]}
    >
      <svg
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <Diagram t={t} />
      </svg>
    </div>
  )
})

export default StageFrame