import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { Label, StageCanvas } from './stageKit'
import { useBeat } from './useBeat'
import { BACKEND_BADGES } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter IV — Understand the backend.
 *
 * The chapter's own sentence is the drawing: *from the browser to the server and
 * the database behind it*. So the picture is one vertical boundary. The interface
 * sits on the left, the request stack on the right, and two packets cross the
 * line — one out, one back.
 *
 * The three Microsoft Learn badges earned the same year sit underneath, drawn as
 * a small separate set and captioned "learning". The milestone detail in the
 * chapter says plainly that they are a learning area and not professional ML
 * work, and this picture keeps that distance: they are outside the server stack,
 * not inside it.
 */

const CLIENT = { x: 24, y: 106, w: 92, h: 92 }
const BOUNDARY_X = 150
const BOXES = [
  { y: 64, title: 'Route', sub: 'requests' },
  { y: 132, title: 'Handler', sub: 'logic' },
]
const SERVER_X = 184
const SERVER_W = 156
const DB = { y: 208, h: 58 }

const REQUEST_PATH = `M ${CLIENT.x + CLIENT.w} 128 H 134 V 88 H ${SERVER_X}`
const RESPONSE_PATH = `M ${SERVER_X} ${DB.y + 34} H 166 V 124 H ${CLIENT.x + CLIENT.w}`

export default function StageBackend({ progress, rgb, travelled, compact }: StageProps) {
  const reduceMotion = useReducedMotion()
  const client = useBeat(progress, 0.06, 0.3)
  const stack = useBeat(progress, 0.18, 0.6)
  const wires = useBeat(progress, 0.4, 0.78)
  const badges = useBeat(progress, 0.58, 0.92)

  const clientX = useTransform(client, [0, 1], [-40, 0])
  const stackX = useTransform(stack, [0, 1], [46, 0])
  const boundaryOpacity = useTransform(stack, [0, 1], [0, 1])

  return (
    <StageCanvas rgb={rgb} travelled={travelled}>
      {/* The boundary itself */}
      <motion.line
        x1={BOUNDARY_X}
        y1={36}
        x2={BOUNDARY_X}
        y2={264}
        stroke="var(--text-muted)"
        strokeWidth={1}
        strokeDasharray="2 5"
        style={{ opacity: boundaryOpacity }}
      />
      <Label x={BOUNDARY_X} y={296} anchor="middle" size={8.5}>
        the network
      </Label>

      {/* ── Interface, left of the line ─────────────────────────────── */}
      <motion.g style={{ x: clientX, opacity: client }}>
        <rect
          x={CLIENT.x}
          y={CLIENT.y}
          width={CLIENT.w}
          height={CLIENT.h}
          rx={8}
          fill={`rgba(${rgb},0.05)`}
          stroke="var(--border)"
        />
        <line
          x1={CLIENT.x}
          y1={CLIENT.y + 16}
          x2={CLIENT.x + CLIENT.w}
          y2={CLIENT.y + 16}
          stroke="var(--border)"
        />
        {[0, 1, 2].map((d) => (
          <circle key={d} cx={CLIENT.x + 9 + d * 6} cy={CLIENT.y + 8} r={1.8} fill="var(--text-muted)" />
        ))}
        <rect x={CLIENT.x + 10} y={CLIENT.y + 26} width={72} height={22} rx={4} fill={`rgba(${rgb},0.16)`} />
        {[0, 1, 2].map((r) => (
          <rect
            key={r}
            x={CLIENT.x + 10}
            y={CLIENT.y + 56 + r * 11}
            width={72 - r * 14}
            height={5}
            rx={2.5}
            fill={`rgba(${rgb},0.32)`}
          />
        ))}
        <Label x={CLIENT.x + CLIENT.w / 2} y={CLIENT.y - 10} anchor="middle" size={9}>
          interface
        </Label>
      </motion.g>

      {/* ── Server stack, right of the line ────────────────────────── */}
      <motion.g style={{ x: stackX, opacity: stack }}>
        <Label x={SERVER_X + SERVER_W / 2} y={44} anchor="middle" size={9} fill={`rgba(${rgb},0.9)`}>
          node.js · mongodb
        </Label>

        {BOXES.map((box, i) => (
          <StackBox
            key={box.title}
            box={box}
            index={i}
            progress={progress}
            rgb={rgb}
          />
        ))}

        {/* Database: a cylinder, the first shape in the section that is not a box. */}
        <g>
          <ellipse
            cx={SERVER_X + SERVER_W / 2}
            cy={DB.y}
            rx={SERVER_W / 2}
            ry={9}
            fill={`rgba(${rgb},0.16)`}
            stroke={`rgba(${rgb},0.5)`}
          />
          <path
            d={`M ${SERVER_X} ${DB.y} V ${DB.y + DB.h - 9} A ${SERVER_W / 2} 9 0 0 0 ${SERVER_X + SERVER_W} ${DB.y + DB.h - 9} V ${DB.y}`}
            fill={`rgba(${rgb},0.08)`}
            stroke={`rgba(${rgb},0.5)`}
          />
          <ellipse
            cx={SERVER_X + SERVER_W / 2}
            cy={DB.y}
            rx={SERVER_W / 2}
            ry={9}
            fill="none"
            stroke={`rgba(${rgb},0.5)`}
          />
          <Label x={SERVER_X + SERVER_W / 2} y={DB.y + 34} anchor="middle" size={9} fill="var(--text-secondary)">
            database
          </Label>
        </g>
      </motion.g>

      {/* ── The two wires ──────────────────────────────────────────── */}
      <motion.path
        d={REQUEST_PATH}
        fill="none"
        stroke={`rgba(${rgb},0.6)`}
        strokeWidth={1.2}
        style={{ pathLength: wires }}
      />
      <motion.path
        d={RESPONSE_PATH}
        fill="none"
        stroke={`rgba(${rgb},0.3)`}
        strokeWidth={1.2}
        strokeDasharray="2 4"
        style={{ pathLength: wires }}
      />

      {/* Packets crossing the line, in both directions. */}
      {!reduceMotion && (
        <>
          <motion.rect
            x={131}
            width={6}
            height={6}
            rx={1.5}
            fill={`rgb(${rgb})`}
            animate={{ y: [130, 84] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.rect
            x={163}
            width={6}
            height={6}
            rx={1.5}
            fill={`rgba(${rgb},0.7)`}
            animate={{ y: [244, 120] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
          />
        </>
      )}

      {/* ── Badges from the same year, kept outside the stack ───────── */}
      {!compact && (
        <g>
          <motion.g style={{ opacity: badges }}>
            <Label x={SERVER_X + SERVER_W / 2} y={282} anchor="middle" size={8.5}>
              microsoft learn · learning
            </Label>
            {BACKEND_BADGES.map((badge, i) => (
              <g key={badge.short}>
                <circle
                  cx={SERVER_X + 26 + i * 52}
                  cy={296}
                  r={5}
                  fill="none"
                  stroke={`rgba(${rgb},0.6)`}
                />
                <circle cx={SERVER_X + 26 + i * 52} cy={296} r={2} fill={`rgba(${rgb},0.8)`} />
              </g>
            ))}
          </motion.g>
        </g>
      )}
    </StageCanvas>
  )
}

/** One tier of the request stack, lighting top-down. */
function StackBox({
  box,
  index,
  progress,
  rgb,
}: {
  box: { y: number; title: string; sub: string }
  index: number
  progress: StageProps['progress']
  rgb: string
}) {
  const enter = useBeat(progress, 0.2 + index * 0.1, 0.42 + index * 0.1)
  const y = useTransform(enter, [0, 1], [22, 0])
  const opacity = useTransform(enter, [0, 1], [0, 1])

  return (
    <motion.g style={{ y, opacity }}>
      <rect
        x={SERVER_X}
        y={box.y}
        width={SERVER_W}
        height={46}
        rx={8}
        fill={`rgba(${rgb},0.06)`}
        stroke={`rgba(${rgb},0.35)`}
      />
      <Label x={SERVER_X + 12} y={box.y + 20} size={10} fill="var(--text-primary)" weight={600}>
        {box.title}
      </Label>
      <Label x={SERVER_X + 12} y={box.y + 35} size={8.5}>
        {box.sub}
      </Label>
      <rect x={SERVER_X + SERVER_W - 34} y={box.y + 16} width={22} height={14} rx={3} fill={`rgba(${rgb},0.22)`} />
    </motion.g>
  )
}