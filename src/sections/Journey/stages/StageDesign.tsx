import { useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { ControlChip, ControlDetail, ControlRow, Label, StageCanvas } from './stageKit'
import { useBeat } from './useBeat'
import { DESIGN_PATTERNS } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter VI — Think in systems.
 *
 * Two pictures in one chapter, because the sources document two: a UML class
 * diagram of the five recorded design patterns, and a sequence diagram. The
 * chapter cross-fades from the first into the second as it is read, and the
 * missing README lands at the end — the omission that became the lesson.
 *
 * Everything in the class diagram is captioned as an illustration of the
 * documented patterns, not a reproduction of a repository. The pattern notes
 * under the controls are standard definitions of each pattern's purpose; they
 * explain the vocabulary the chapter already lists rather than adding a claim.
 */

const CLASSES = [
  { name: DESIGN_PATTERNS[0].name, x: 20, y: 74 },
  { name: DESIGN_PATTERNS[1].name, x: 130, y: 74 },
  { name: DESIGN_PATTERNS[3].name, x: 240, y: 74 },
  { name: DESIGN_PATTERNS[2].name, x: 75, y: 168 },
  { name: DESIGN_PATTERNS[4].name, x: 185, y: 168 },
]
const CLASS_W = 100
const CLASS_H = 78
const METHODS: Record<string, string[]> = {
  Strategy: ['+ run()', '— abstract'],
  Factory: ['+ create()', '— concrete'],
  Observer: ['+ update()', '+ subscribe()'],
  Singleton: ['+ instance()', '— private ctor'],
  Decorator: ['+ wrap()', '— delegates'],
}

const LIFELINES = [70, 180, 290]
const LIFELINE_LABELS = ['request', 'authorise', 'persist']
const MESSAGES = [
  { y: 126, from: 0, to: 1, label: 'call', dashed: false },
  { y: 168, from: 1, to: 2, label: 'check', dashed: false },
  { y: 210, from: 2, to: 0, label: 'result', dashed: true },
]

export default function StageDesign({ progress, accent, rgb, travelled }: StageProps) {
  const [selected, setSelected] = useState<string>(DESIGN_PATTERNS[0].name)

  // Class diagram first, sequence diagram second, README last.
  const classes = useBeat(progress, 0.04, 0.4)
  const sequence = useBeat(progress, 0.42, 0.8)
  const readme = useBeat(progress, 0.76, 0.98)

  const classOpacity = useTransform(sequence, [0, 0.55], [1, 0])
  const seqOpacity = useTransform(sequence, [0.35, 1], [0, 1])

  const pattern = DESIGN_PATTERNS.find((p) => p.name === selected)

  return (
    <div>
      <StageCanvas rgb={rgb} travelled={travelled}>
        {/* ── Class diagram ─────────────────────────────────────────── */}
        <motion.g style={{ opacity: classOpacity }}>
          {/* Factory creates Strategy; Strategy notifies observers. */}
          <motion.line
            x1={130}
            y1={CLASSES[0].y + CLASS_H / 2}
            x2={CLASSES[0].x + CLASS_W}
            y2={CLASSES[0].y + CLASS_H / 2}
            stroke={`rgba(${rgb},0.6)`}
            strokeWidth={1}
            strokeDasharray="3 3"
            style={{ pathLength: classes }}
          />
          <motion.line
            x1={CLASSES[0].x + CLASS_W}
            y1={CLASSES[0].y + 16}
            x2={CLASSES[2].x}
            y2={CLASSES[2].y + 16}
            stroke={`rgba(${rgb},0.45)`}
            strokeWidth={1}
            style={{ pathLength: classes }}
          />

          {CLASSES.map((cls, i) => (
            <ClassBox
              key={cls.name}
              cls={cls}
              index={i}
              progress={progress}
              rgb={rgb}
              selected={selected}
            />
          ))}

          <Label x={344} y={40} anchor="end" size={8.5}>
            an illustration of the five documented patterns
          </Label>
        </motion.g>

        {/* ── Sequence diagram ──────────────────────────────────────── */}
        <motion.g style={{ opacity: seqOpacity }}>
          {LIFELINES.map((x, i) => (
            <g key={`ll${i}`}>
              <Label x={x} y={68} anchor="middle" size={9} fill="var(--text-secondary)">
                {LIFELINE_LABELS[i]}
              </Label>
              <motion.line
                x1={x}
                y1={78}
                x2={x}
                y2={236}
                stroke="var(--text-muted)"
                strokeWidth={1}
                strokeDasharray="3 4"
                style={{ pathLength: sequence }}
              />
              <motion.rect
                x={x - 3}
                y={MESSAGES.find((m) => m.from === i || m.to === i)?.y ?? 140}
                width={6}
                height={34}
                rx={2}
                fill={`rgba(${rgb},0.2)`}
                style={{ opacity: sequence }}
              />
            </g>
          ))}

          {MESSAGES.map((message) => (
            <motion.g key={message.label} style={{ opacity: sequence }}>
              <motion.line
                x1={LIFELINES[message.from]}
                y1={message.y}
                x2={LIFELINES[message.to]}
                y2={message.y}
                stroke={`rgba(${rgb},0.85)`}
                strokeWidth={1.2}
                strokeDasharray={message.dashed ? '3 3' : undefined}
                style={{ pathLength: sequence }}
              />
              <polygon
                points={`${LIFELINES[message.to] - (message.to > message.from ? 6 : -6)},${message.y - 3.5} ${LIFELINES[message.to]},${message.y} ${LIFELINES[message.to] - (message.to > message.from ? 6 : -6)},${message.y + 3.5}`}
                fill={`rgba(${rgb},0.95)`}
              />
              <Label
                x={(LIFELINES[message.from] + LIFELINES[message.to]) / 2}
                y={message.y - 7}
                anchor="middle"
                size={8.5}
                fill="var(--text-secondary)"
              >
                {message.label}
              </Label>
            </motion.g>
          ))}

          <Label x={344} y={256} anchor="end" size={8.5}>
            sequence
          </Label>
        </motion.g>

        {/* ── The lesson: the write-up that was missing ─────────────── */}
        <motion.g style={{ opacity: readme }}>
          <rect
            x={20}
            y={258}
            width={126}
            height={44}
            rx={7}
            fill="var(--bg-secondary)"
            stroke={`rgba(${rgb},0.5)`}
          />
          <Label x={32} y={274} size={9} fill="var(--text-primary)">
            README.md
          </Label>
          {[0, 1, 2].map((r) => (
            <rect
              key={r}
              x={32}
              y={281 + r * 7}
              width={r === 2 ? 40 : 62 - r * 8}
              height={3}
              rx={1.5}
              fill={`rgba(${rgb},0.35)`}
            />
          ))}
          <circle cx={160} cy={268} r={7} fill={`rgba(${rgb},0.18)`} stroke={`rgba(${rgb},0.7)`} />
          <Label x={160} y={272} anchor="middle" size={9} fill={`rgb(${rgb})`}>
            ✓
          </Label>
        </motion.g>
      </StageCanvas>

      <ControlRow>
        {DESIGN_PATTERNS.map((p) => (
          <ControlChip
            key={p.name}
            label={p.name}
            active={selected === p.name}
            onClick={() => setSelected(p.name)}
            accent={accent}
          />
        ))}
      </ControlRow>
      <ControlDetail>{pattern?.role}</ControlDetail>
    </div>
  )
}

/** One UML class box, lifting when its pattern is the selected one. */
function ClassBox({
  cls,
  index,
  progress,
  rgb,
  selected,
}: {
  cls: { name: string; x: number; y: number }
  index: number
  progress: StageProps['progress']
  rgb: string
  selected: string
}) {
  const enter = useBeat(progress, 0.06 + index * 0.07, 0.3 + index * 0.07)
  const opacity = useTransform(enter, [0, 1], [0, 1])
  const active = selected === cls.name

  return (
    <motion.g style={{ opacity }}>
      <rect
        x={cls.x}
        y={cls.y}
        width={CLASS_W}
        height={CLASS_H}
        rx={7}
        fill={active ? `rgba(${rgb},0.1)` : 'var(--bg-secondary)'}
        stroke={active ? `rgba(${rgb},0.75)` : 'var(--border)'}
        strokeWidth={active ? 1.4 : 1}
      />
      <line x1={cls.x} y1={cls.y + 22} x2={cls.x + CLASS_W} y2={cls.y + 22} stroke="var(--border)" />
      <Label x={cls.x + 10} y={cls.y + 15} size={9.5} weight={600} fill={active ? `rgb(${rgb})` : 'var(--text-primary)'}>
        {cls.name}
      </Label>
      {METHODS[cls.name].map((line, r) => (
        <Label key={line} x={cls.x + 10} y={cls.y + 40 + r * 13} size={8}>
          {line}
        </Label>
      ))}
    </motion.g>
  )
}