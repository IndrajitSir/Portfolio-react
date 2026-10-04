import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { Label, StageCanvas, VB_H } from './stageKit'
import { useBeat } from './useBeat'
import { COMPETE_ENTRIES } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter III — Take the challenge.
 *
 * A spotlight on an empty floor, two beacons for the two 2024 quiz entries, and
 * a crowd filling in along the front as the chapter is read. This is the only
 * chapter whose picture is about a room rather than a machine, which is the
 * point: the documented shift here is from building alone to performing in front
 * of an audience.
 *
 * The arc between the beacons is the face-off; it draws last, so the two entries
 * read as separate achievements first and a contest second.
 */

const FLOOR_Y = 250
const BEACON_H = 56
const BEACONS = [
  { x: 104, ...COMPETE_ENTRIES[0] },
  { x: 256, ...COMPETE_ENTRIES[1] },
]
// The face-off arc is drawn above the beacon labels rather than through them.
const ARC = `M ${BEACONS[0].x} 146 Q 180 62 ${BEACONS[1].x} 146`

/** The front row, as [x, height] pairs. Static geometry, lit progressively. */
const CROWD = Array.from({ length: 19 }, (_, i) => {
  const t = i / 18
  return { x: 44 + t * 272, h: 7 + ((i * 7) % 5) }
})

export default function StageCompete({ progress, rgb, travelled }: StageProps) {
  const reduceMotion = useReducedMotion()
  const beacons = useBeat(progress, 0.08, 0.34)
  const arc = useBeat(progress, 0.38, 0.72)
  const crowd = useBeat(progress, 0.18, 0.86)

  // The crowd is revealed with a clip that widens left to right, so the room
  // fills as a single gesture rather than 19 separate animations.
  const crowdWidth = useTransform(crowd, [0, 1], [0, 336])

  return (
    <StageCanvas rgb={rgb} travelled={travelled}>
      <defs>
        <linearGradient id="compete-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgba(${rgb},0.3)`} />
          <stop offset="100%" stopColor={`rgba(${rgb},0.02)`} />
        </linearGradient>
        <clipPath id="compete-crowd">
          <motion.rect x={12} y={250} width={crowdWidth} height={VB_H - 250} />
        </clipPath>
      </defs>

      {/* Spotlight — a slow breath, the only ambient motion in the section. */}
      {!reduceMotion ? (
        <motion.g
          animate={{ rotate: [-3.5, 3.5, -3.5] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '180px 0px' }}
        >
          <Cone rgb={rgb} />
        </motion.g>
      ) : (
        <Cone rgb={rgb} />
      )}

      {/* Stage floor */}
      <line x1={64} y1={FLOOR_Y} x2={296} y2={FLOOR_Y} stroke="var(--border)" strokeWidth={1} />
      <motion.line
        x1={92}
        y1={FLOOR_Y}
        x2={268}
        y2={FLOOR_Y}
        stroke={`rgba(${rgb},0.5)`}
        strokeWidth={1.2}
        style={{ pathLength: beacons }}
      />

      {/* Beacons */}
      {BEACONS.map((beacon, i) => (
        <Beacon key={beacon.title} beacon={beacon} progress={progress} rgb={rgb} offset={i} />
      ))}

      {/* Face-off arc, plus the two drops that land it on the beacon caps. */}
      <motion.path
        d={ARC}
        fill="none"
        stroke={`rgba(${rgb},0.75)`}
        strokeWidth={1.4}
        strokeDasharray="3 4"
        strokeLinecap="round"
        style={{ pathLength: arc }}
      />
      {BEACONS.map((beacon) => (
        <motion.line
          key={`drop-${beacon.title}`}
          x1={beacon.x}
          y1={146}
          x2={beacon.x}
          y2={FLOOR_Y - BEACON_H - 8}
          stroke={`rgba(${rgb},0.5)`}
          strokeWidth={1.2}
          style={{ pathLength: arc }}
        />
      ))}
      <motion.circle cx={180} cy={104} r={3} fill={`rgb(${rgb})`} style={{ opacity: arc }} />

      {/* The crowd */}
      <g clipPath="url(#compete-crowd)">
        {CROWD.map((seat, i) => (
          <line
            key={i}
            x1={seat.x}
            y1={262}
            x2={seat.x}
            y2={262 + seat.h}
            stroke={`rgba(${rgb},0.45)`}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.35 + (i % 3) * 0.2}
          />
        ))}
      </g>

      <Label x={344} y={300} anchor="end" size={9} fill={`rgba(${rgb},0.95)`}>
        2 national-level quiz entries · 2024
      </Label>
    </StageCanvas>
  )
}

/**
 * The spotlight itself: a filled cone plus two hairlines down its edges, so it
 * still reads as light on a large screen where the gradient alone is too faint.
 */
function Cone({ rgb }: { rgb: string }) {
  return (
    <>
      <polygon points="180,-8 86,252 274,252" fill="url(#compete-cone)" />
      <line x1={180} y1={-8} x2={86} y2={252} stroke={`rgba(${rgb},0.22)`} strokeWidth={1} />
      <line x1={180} y1={-8} x2={274} y2={252} stroke={`rgba(${rgb},0.22)`} strokeWidth={1} />
    </>
  )
}

/** One entry standing on the floor, labelled on two lines. */
function Beacon({
  beacon,
  progress,
  rgb,
  offset,
}: {
  beacon: { x: number; title: string; sub: string }
  progress: StageProps['progress']
  rgb: string
  offset: number
}) {
  const rise = useBeat(progress, 0.08 + offset * 0.08, 0.34 + offset * 0.08)
  const top = useTransform(rise, [0, 1], [FLOOR_Y, FLOOR_Y - BEACON_H])
  const opacity = useTransform(rise, [0, 1], [0.2, 1])
  const topY = useTransform(top, (v) => v - 8)

  return (
    <motion.g style={{ opacity }}>
      <motion.rect
        x={beacon.x - 1.5}
        width={3}
        rx={1.5}
        y={top}
        height={BEACON_H}
        fill={`rgba(${rgb},0.75)`}
      />
      <motion.circle cx={beacon.x} cy={topY} r={4.5} fill="var(--bg-primary)" stroke={`rgb(${rgb})`} strokeWidth={1.5} />
      <Label x={beacon.x} y={176} anchor="middle" size={10} fill="var(--text-primary)" weight={600}>
        {beacon.title}
      </Label>
      <Label x={beacon.x} y={166} anchor="middle" size={8.5}>
        {beacon.sub}
      </Label>
    </motion.g>
  )
}