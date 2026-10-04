import { motion, useTransform } from 'framer-motion'
import { Label, StageCanvas } from './stageKit'
import { useBeat } from './useBeat'
import { PUBLISH_PACKAGES } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter VIII — Build for other developers.
 *
 * The culmination, and it only works because of Chapter I: the seed square from
 * the very first chapter is back, and it is now the entry point of a published
 * package rather than a lone mark on an empty field. The visitor has watched
 * everything else accumulate, so the last picture is earned rather than asserted.
 *
 * The shape of it is the distinction the chapter actually makes — a
 * persistence-agnostic core with an adapter plugged into its port — and the two
 * packages are named exactly as they are on npm.
 */

const CORE = { x: 24, y: 88, w: 196, h: 96 }
const ADAPTER = { x: 252, y: 88, w: 104, h: 96 }
const PORT = { top: 126, bottom: 152 }
const CONSUMERS = [
  { x: 24, line: '@indrajitsir/' },
  { x: 132, line: 'nest-auth-core' },
  { x: 240, line: 'install' },
]

export default function StagePublish({ progress, rgb, travelled }: StageProps) {
  const core = useBeat(progress, 0.06, 0.34)
  const port = useBeat(progress, 0.26, 0.56)
  const adapter = useBeat(progress, 0.36, 0.64)
  const consumers = useBeat(progress, 0.6, 0.94)

  const coreScale = useTransform(core, [0, 1], [0.96, 1])
  const adapterX = useTransform(adapter, [0, 1], [28, 0])
  const adapterOpacity = useTransform(adapter, [0, 1], [0, 1])
  const portWidth = useTransform(port, [0, 1], [0, 26])
  const consumerY = useTransform(consumers, [0, 1], [14, 0])
  const consumerOpacity = useTransform(consumers, [0, 1], [0, 1])

  return (
    <StageCanvas rgb={rgb} travelled={travelled}>
      <Label x={28} y={40} size={10} fill={`rgba(${rgb},0.95)`}>
        built for other developers
      </Label>

      {/* ── The core package, holding the Chapter I seed ────────────── */}
      <motion.g style={{ scale: coreScale, opacity: core, transformOrigin: `${CORE.x + CORE.w / 2}px ${CORE.y + CORE.h / 2}px` }}>
        <rect
          x={CORE.x}
          y={CORE.y}
          width={CORE.w}
          height={CORE.h}
          rx={10}
          fill={`rgba(${rgb},0.08)`}
          stroke={`rgba(${rgb},0.6)`}
          strokeWidth={1.3}
        />
        <Label x={CORE.x + 14} y={CORE.y + 22} size={9.5} weight={600} fill="var(--text-primary)">
          {PUBLISH_PACKAGES.core}
        </Label>

        {/* The seed — the same square the journey opened with. */}
        <rect x={CORE.x + 16} y={CORE.y + 44} width={14} height={14} rx={2} fill={`rgb(${rgb})`} />
        <Label x={CORE.x + 38} y={CORE.y + 55} size={8}>
          chapter I
        </Label>
        <Label x={CORE.x + 16} y={CORE.y + 80} size={8.5}>
          persistence-agnostic
        </Label>
        <rect
          x={CORE.x + CORE.w - 50}
          y={CORE.y + 66}
          width={38}
          height={14}
          rx={7}
          fill={`rgba(${rgb},0.18)`}
          stroke={`rgba(${rgb},0.4)`}
        />
        <Label x={CORE.x + CORE.w - 31} y={CORE.y + 76} anchor="middle" size={8}>
          v0.1.0
        </Label>
      </motion.g>

      {/* ── The port, then the adapter plugging into it ─────────────── */}
      <motion.rect
        x={CORE.x + CORE.w}
        y={PORT.top}
        width={portWidth}
        height={PORT.bottom - PORT.top}
        fill="var(--bg-secondary)"
        stroke={`rgba(${rgb},0.7)`}
        strokeWidth={1.4}
      />

      <motion.g style={{ x: adapterX, opacity: adapterOpacity }}>
        <rect
          x={ADAPTER.x}
          y={ADAPTER.y}
          width={ADAPTER.w}
          height={ADAPTER.h}
          rx={10}
          fill="var(--bg-secondary)"
          stroke={`rgba(${rgb},0.5)`}
          strokeWidth={1.1}
        />
        <Label x={ADAPTER.x + 12} y={ADAPTER.y + 34} size={8.5} weight={600} fill="var(--text-primary)">
          @indrajitsir/
        </Label>
        <Label x={ADAPTER.x + 12} y={ADAPTER.y + 47} size={8.5} weight={600} fill="var(--text-primary)">
          nest-auth-sql-
        </Label>
        <Label x={ADAPTER.x + 12} y={ADAPTER.y + 60} size={8.5} weight={600} fill="var(--text-primary)">
          adapter
        </Label>
        <Label x={ADAPTER.x + 12} y={ADAPTER.y + 80} size={8}>
          typeorm
        </Label>
      </motion.g>

      {/* ── Who it is for ───────────────────────────────────────────── */}
      <motion.g style={{ y: consumerY, opacity: consumerOpacity }}>
        <Label x={28} y={216} size={8.5}>
          consumers
        </Label>
        {CONSUMERS.map((consumer, i) => (
          <Consumer key={consumer.x} consumer={consumer} index={i} consumers={consumers} rgb={rgb} />
        ))}
      </motion.g>

      <Label x={346} y={300} anchor="end" size={9} fill={`rgba(${rgb},0.95)`}>
        2 packages on npm
      </Label>
    </StageCanvas>
  )
}

/** One install line — the audience the chapter is aimed at. */
function Consumer({
  consumer,
  index,
  consumers,
  rgb,
}: {
  consumer: { x: number; line: string }
  index: number
  consumers: ReturnType<typeof useBeat>
  rgb: string
}) {
  const opacity = useTransform(consumers, [0, 1], [0, 0.45 + index * 0.275])
  return (
    <motion.g style={{ opacity }}>
      <rect x={consumer.x} y={228} width={96} height={42} rx={8} fill="var(--surface)" stroke="var(--border)" />
      <Label x={consumer.x + 10} y={246} size={9} fill={`rgba(${rgb},0.9)`}>
        $
      </Label>
      <Label x={consumer.x + 10} y={261} size={8}>
        {consumer.line}
      </Label>
    </motion.g>
  )
}