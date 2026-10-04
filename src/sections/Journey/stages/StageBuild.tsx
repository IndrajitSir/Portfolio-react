import { useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { Label, StageCanvas } from './stageKit'
import { useBeat } from './useBeat'
import { BUILD_TASKS } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter II — Build something.
 *
 * Four browser windows, one per internship task, fly in from the four corners and
 * settle into a grid. The metaphor is literal on purpose: the sources describe
 * four tasks that each became a working front-end application, so the picture
 * *is* the claim rather than a decoration next to it.
 *
 * Hovering or focusing a window lifts it and prints its name larger. The name is
 * on the window the whole time, so nothing here is hover-only.
 */

const W = 152
const H = 100
const SLOTS = [
  { x: 32, y: 52, from: { x: -46, y: -34 } },
  { x: 196, y: 52, from: { x: 46, y: -34 } },
  { x: 32, y: 170, from: { x: -46, y: 34 } },
  { x: 196, y: 170, from: { x: 46, y: 34 } },
]

function TaskWindow({
  slot,
  label,
  index,
  progress,
  rgb,
  raised,
  onHover,
  onLeave,
}: {
  slot: (typeof SLOTS)[number]
  label: string
  index: number
  progress: StageProps['progress']
  rgb: string
  raised: boolean
  onHover: () => void
  onLeave: () => void
}) {
  const enter = useBeat(progress, 0.08 + index * 0.13, 0.3 + index * 0.13)
  const x = useTransform(enter, [0, 1], [slot.from.x, 0])
  const y = useTransform(enter, [0, 1], [slot.from.y, raised ? -4 : 0])
  const opacity = useTransform(enter, [0, 1], [0, 1])
  const glow = useTransform(enter, [0, 1], [0.08, 0.34])

  return (
    <motion.g
      style={{ x, y, opacity }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      tabIndex={-1}
      aria-hidden="true"
    >
      <rect
        x={slot.x}
        y={slot.y}
        width={W}
        height={H}
        rx={9}
        fill="var(--bg-secondary)"
        stroke={raised ? `rgba(${rgb},0.75)` : 'var(--border)'}
        strokeWidth={raised ? 1.4 : 1}
      />
      <motion.rect
        x={slot.x}
        y={slot.y}
        width={W}
        height={H}
        rx={9}
        fill={`rgba(${rgb},1)`}
        style={{ opacity: glow }}
      />

      {/* Browser chrome */}
      <line x1={slot.x} y1={slot.y + 17} x2={slot.x + W} y2={slot.y + 17} stroke="var(--border)" />
      {[0, 1, 2].map((d) => (
        <circle
          key={d}
          cx={slot.x + 11 + d * 7}
          cy={slot.y + 8.5}
          r={2}
          fill={`rgba(${rgb},${0.35 + 0.2 * d * 0})`}
          opacity={0.4 + d * 0.2}
        />
      ))}

      {/* Interface wireframe — the actual work, abstracted to bars. */}
      <rect x={slot.x + 10} y={slot.y + 26} width={44} height={40} rx={4} fill={`rgba(${rgb},0.14)`} />
      {[0, 1, 2].map((r) => (
        <rect
          key={r}
          x={slot.x + 62}
          y={slot.y + 28 + r * 11}
          width={78 - r * 18}
          height={5}
          rx={2.5}
          fill={`rgba(${rgb},0.3)`}
        />
      ))}
      <rect
        x={slot.x + 62}
        y={slot.y + 62}
        width={34}
        height={9}
        rx={4.5}
        fill={`rgba(${rgb},0.55)`}
      />

      {/* The task name is always on the window. */}
      <line
        x1={slot.x}
        y1={slot.y + H - 21}
        x2={slot.x + W}
        y2={slot.y + H - 21}
        stroke="var(--border)"
      />
      <Label
        x={slot.x + 11}
        y={slot.y + H - 8}
        size={10}
        fill={raised ? `rgb(${rgb})` : 'var(--text-secondary)'}
        weight={raised ? 600 : 500}
      >
        {label}
      </Label>
    </motion.g>
  )
}

export default function StageBuild({ progress, rgb, travelled }: StageProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const settled = useBeat(progress, 0.55, 0.8)

  return (
    <StageCanvas rgb={rgb} travelled={travelled}>
      <Label x={28} y={26} size={10} fill="var(--text-secondary)">
        SystemTron · 22 Apr – 19 May 2024
      </Label>

      {SLOTS.map((slot, i) => (
        <TaskWindow
          key={BUILD_TASKS[i]}
          slot={slot}
          label={BUILD_TASKS[i]}
          index={i}
          progress={progress}
          rgb={rgb}
          raised={hovered === i}
          onHover={() => setHovered(i)}
          onLeave={() => setHovered((h) => (h === i ? null : h))}
        />
      ))}

      {/* Once all four have landed, the grid states the fact in one line. */}
      <motion.g style={{ opacity: settled }}>
        <Label x={344} y={300} anchor="end" size={9} fill={`rgba(${rgb},0.95)`}>
          4 tasks · 4 working applications
        </Label>
      </motion.g>
    </StageCanvas>
  )
}