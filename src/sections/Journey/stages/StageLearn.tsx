import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { Label, StageCanvas } from './stageKit'
import { useBeat } from './useBeat'
import { milestoneLabels } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter I — Learn to code.
 *
 * The seed. One small square in the middle of an empty field, and four
 * documented first proofs fanning away from it. As the visitor scrolls through
 * the chapter the links draw themselves and a single traveller steps from the
 * seed to each proof in the order they were earned.
 *
 * This square is the object the whole section is about: it is still on screen in
 * Chapter VIII, sitting inside the published package. Nothing else in the
 * journey ties the eight chapters together so tightly.
 */

const SEED = { x: 132, y: 158 }
const NODES = [
  { x: 252, y: 70 },
  { x: 288, y: 154 },
  { x: 252, y: 238 },
  { x: 164, y: 66 },
]

/** Abbreviations of the four milestone labels, for the space inside the artwork. */
const SHORT = ['Java badge', 'Skill certificate', '75 days of Java', 'Security workshop']
if (milestoneLabels('learn').length !== SHORT.length) {
  // Keeps the artwork honest: four nodes means four documented milestones, and
  // this fails the build rather than quietly dropping one.
  throw new Error('Chapter I artwork expects exactly four milestones')
}

const LEGS = NODES.map((node, i) => {
  const from = i === 0 ? SEED : NODES[i - 1]
  return { from, to: node, len: Math.hypot(node.x - from.x, node.y - from.y) }
})
const TOTAL = LEGS.reduce((sum, leg) => sum + leg.len, 0)
const LEG_STARTS = LEGS.map((_, i) => LEGS.slice(0, i).reduce((s, l) => s + l.len, 0) / TOTAL)

/** Point a fraction of the way along the whole route. */
function pointAt(t: number) {
  const target = Math.min(Math.max(t, 0), 1) * TOTAL
  let walked = 0
  for (const leg of LEGS) {
    if (walked + leg.len >= target) {
      const local = leg.len === 0 ? 0 : (target - walked) / leg.len
      return {
        x: leg.from.x + (leg.to.x - leg.from.x) * local,
        y: leg.from.y + (leg.to.y - leg.from.y) * local,
      }
    }
    walked += leg.len
  }
  return { x: NODES[NODES.length - 1].x, y: NODES[NODES.length - 1].y }
}

/** One link out to one proof, drawn over its own slice of the chapter. */
function Leg({
  leg,
  index,
  draw,
  rgb,
}: {
  leg: (typeof LEGS)[number]
  index: number
  draw: ReturnType<typeof useBeat>
  rgb: string
}) {
  const legStart = LEG_STARTS[index]
  const legEnd = legStart + leg.len / TOTAL
  const pathLength = useTransform(draw, [0, 1], [legStart, legEnd])
  return (
    <motion.line
      x1={leg.from.x}
      y1={leg.from.y}
      x2={leg.to.x}
      y2={leg.to.y}
      stroke={`rgba(${rgb},0.55)`}
      strokeWidth={1.2}
      strokeLinecap="round"
      style={{ pathLength }}
    />
  )
}

/** One documented first proof, lighting as the traveller arrives. */
function Proof({
  node,
  index,
  progress,
  rgb,
}: {
  node: (typeof NODES)[number]
  index: number
  progress: StageProps['progress']
  rgb: string
}) {
  const arrive = useBeat(progress, 0.16 + index * 0.16, 0.3 + index * 0.16)
  const lit = useTransform(arrive, [0, 1], [0.15, 1])
  const ringScale = useTransform(lit, [0, 1], [0.6, 1])

  return (
    <g>
      <motion.circle cx={node.x} cy={node.y} r={5.5} fill={`rgba(${rgb},0.1)`} style={{ opacity: lit }} />
      <motion.circle cx={node.x} cy={node.y} r={3} fill={`rgb(${rgb})`} style={{ opacity: lit }} />
      <motion.circle
        cx={node.x}
        cy={node.y}
        r={11}
        fill="none"
        stroke={`rgba(${rgb},0.4)`}
        strokeWidth={1}
        style={{ opacity: lit, scale: ringScale }}
      />
      {/* The four proofs are named in the picture at every size — this is the
          one place the labels are worth the ink even on a phone, because an
          unnamed dot says nothing on its own. */}
      <motion.g style={{ opacity: lit }}>
        <Label x={node.x} y={node.y + 24} anchor="middle" size={9}>
          {SHORT[index]}
        </Label>
      </motion.g>
    </g>
  )
}

export default function StageLearn({ progress, rgb, travelled }: StageProps) {
  const reduceMotion = useReducedMotion()
  // Links finish drawing early so the traveller has the rest of the chapter.
  const draw = useBeat(progress, 0.1, 0.55)
  const walk = useBeat(progress, 0.18, 0.9)

  const tx = useTransform(walk, (v) => pointAt(v).x)
  const ty = useTransform(walk, (v) => pointAt(v).y)

  // The seed ring breathes with the reader's travel rather than on a timer. A
  // perpetual `repeat: Infinity` loop keeps the compositor busy every frame of
  // the section's life, even after the reader has stopped — driving the same
  // swell from scroll keeps the picture alive but still when the page is still.
  const breath = useTransform(walk, (v) => 1 + Math.sin(v * Math.PI * 3) * 0.22)
  const breathOpacity = useTransform(walk, (v) => 0.16 + (Math.sin(v * Math.PI * 3) * 0.5 + 0.5) * 0.32)

  return (
    <StageCanvas rgb={rgb} travelled={travelled}>
      {LEGS.map((leg, i) => (
        <Leg key={`leg${i}`} leg={leg} index={i} draw={draw} rgb={rgb} />
      ))}

      {NODES.map((node, i) => (
        <Proof key={`proof${i}`} node={node} index={i} progress={progress} rgb={rgb} />
      ))}

      {/* The seed itself, breathing with the chapter as it is read. */}
      <motion.circle
        cx={SEED.x}
        cy={SEED.y}
        r={16}
        fill="none"
        stroke={`rgba(${rgb},0.35)`}
        strokeWidth={1}
        style={{ scale: breath, opacity: breathOpacity, transformOrigin: `${SEED.x}px ${SEED.y}px` }}
      />
      <rect x={SEED.x - 6} y={SEED.y - 6} width={12} height={12} rx={2} fill={`rgb(${rgb})`} />
      <Label x={SEED.x} y={SEED.y + 26} anchor="middle" size={9} fill={`rgba(${rgb},0.9)`}>
        chapter I
      </Label>

      {/* The traveller. */}
      <motion.circle
        cx={tx}
        cy={ty}
        r={3.4}
        fill="var(--bg-primary)"
        stroke={`rgb(${rgb})`}
        strokeWidth={1.4}
        style={{ opacity: reduceMotion ? 0 : 1 }}
      />

      <Label x={344} y={300} anchor="end" size={9}>
        Java · HackerRank
      </Label>
    </StageCanvas>
  )
}