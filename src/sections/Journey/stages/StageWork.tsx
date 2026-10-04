import { useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import {
  ControlChip,
  ControlDetail,
  ControlRow,
  CountLabel,
  Label,
  StageCanvas,
} from './stageKit'
import { useBeat } from './useBeat'
import { WORK_SERVICES } from './stageData'
import { journeyChapters } from '@/data'
import type { StageProps } from './types'

/**
 * Chapter VII — Work on production backend.
 *
 * The three things the role is documented as building — authorization, the
 * ClamAV file scanner and the indexing pass — as three services fed by the
 * finance application they serve. Selecting a service prints the chapter's own
 * milestone detail underneath, so the diagram and the prose never disagree.
 *
 * The 150-cell grid below is the indexing pass, and it is the only counting
 * element in the section: the cells fill with scroll and the number is derived
 * from that same progress, so it cannot run past what has been scrolled.
 */

const CLIENT = { x: 20, y: 118, w: 78, h: 44 }
const SERVICES = [
  { ...WORK_SERVICES[0], y: 46 },
  { ...WORK_SERVICES[1], y: 112 },
  { ...WORK_SERVICES[2], y: 178 },
]
const SERVICE_X = 152
const SERVICE_W = 188

/** 25 × 6 — exactly the 150 models the milestone records. */
const GRID_COLS = 25
const GRID_ROWS = 6
const GRID_X = 32
const GRID_Y = 242
const CELL = 7
const CELL_GAP = 2

const details = journeyChapters.find((c) => c.id === 'ship')!.milestones.map((m) => m.detail)

export default function StageWork({ progress, accent, rgb, travelled }: StageProps) {
  const [selected, setSelected] = useState<string>('auth')

  const client = useBeat(progress, 0.05, 0.28)
  const stack = useBeat(progress, 0.16, 0.56)
  const wires = useBeat(progress, 0.34, 0.66)

  const clientX = useTransform(client, [0, 1], [-34, 0])

  return (
    <div>
      <StageCanvas rgb={rgb} travelled={travelled}>
        {/* The application the services belong to */}
        <motion.g style={{ x: clientX, opacity: client }}>
          <rect
            x={CLIENT.x}
            y={CLIENT.y}
            width={CLIENT.w}
            height={CLIENT.h}
            rx={8}
            fill={`rgba(${rgb},0.07)`}
            stroke={`rgba(${rgb},0.4)`}
          />
          <rect x={CLIENT.x + 10} y={CLIENT.y + 12} width={58} height={6} rx={3} fill={`rgba(${rgb},0.35)`} />
          <rect x={CLIENT.x + 10} y={CLIENT.y + 24} width={38} height={6} rx={3} fill={`rgba(${rgb},0.2)`} />
          <Label x={CLIENT.x + CLIENT.w / 2} y={CLIENT.y - 10} anchor="middle" size={8.5}>
            finance app
          </Label>
        </motion.g>

        {/* Three services */}
        {SERVICES.map((service, i) => (
          <motion.g key={service.id} style={{ opacity: stack }}>
            <motion.rect
              x={SERVICE_X}
              y={service.y}
              width={SERVICE_W}
              height={54}
              rx={9}
              fill={selected === service.id ? `rgba(${rgb},0.1)` : 'var(--bg-secondary)'}
              stroke={selected === service.id ? `rgba(${rgb},0.75)` : 'var(--border)'}
              strokeWidth={selected === service.id ? 1.4 : 1}
            />
            <motion.rect
              x={SERVICE_X + 12}
              y={service.y + 14}
              width={30}
              height={26}
              rx={4}
              fill={`rgba(${rgb},0.2)`}
              style={{ opacity: stack }}
            />
            <Label x={SERVICE_X + 52} y={service.y + 26} size={10} weight={600} fill="var(--text-primary)">
              {service.card}
            </Label>
            <Label x={SERVICE_X + 52} y={service.y + 40} size={8.5}>
              service {['i', 'ii', 'iii'][i]}
            </Label>
          </motion.g>
        ))}

        {/* Wires from the application to each service */}
        {SERVICES.map((service) => (
          <motion.path
            key={`wire-${service.id}`}
            d={`M ${CLIENT.x + CLIENT.w} ${CLIENT.y + CLIENT.h / 2} H ${SERVICE_X - 12} V ${service.y + 27} H ${SERVICE_X}`}
            fill="none"
            stroke={`rgba(${rgb},0.35)`}
            strokeWidth={1}
            style={{ pathLength: wires }}
          />
        ))}

        {/* ── The indexing pass ─────────────────────────────────────── */}
        <Label x={GRID_X} y={234} size={8.5}>
          indexing strategy
        </Label>
        <CountLabel
          progress={progress}
          range={[0.6, 0.94]}
          from={0}
          to={150}
          suffix="+ models indexed"
          x={346}
          y={234}
          size={9}
          fill="var(--text-secondary)"
          anchor="end"
        />
        <g>
          {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => (
            <GridCell
              key={i}
              index={i}
              progress={progress}
              rgb={rgb}
              lit={selected === 'index'}
            />
          ))}
        </g>
      </StageCanvas>

      <ControlRow>
        {SERVICES.map((service) => (
          <ControlChip
            key={service.id}
            label={service.short}
            active={selected === service.id}
            onClick={() => setSelected(service.id)}
            accent={accent}
          />
        ))}
      </ControlRow>
      <ControlDetail>{details[SERVICES.findIndex((s) => s.id === selected)]}</ControlDetail>
    </div>
  )
}

/**
 * One cell of the indexing grid.
 *
 * The grid only animates while the indexing pass is the selected service. In
 * the default state it is a plain, static lattice: building 150 derived motion
 * values (two each, in the original) that the shared scroll value had to update
 * on every frame — for a view most readers never choose — was pure overhead.
 */
function GridCell({
  index,
  progress,
  rgb,
  lit,
}: {
  index: number
  progress: StageProps['progress']
  rgb: string
  lit: boolean
}) {
  const col = index % GRID_COLS
  const row = Math.floor(index / GRID_COLS)
  const x = GRID_X + col * (CELL + CELL_GAP)
  const y = GRID_Y + row * (CELL + CELL_GAP)

  if (!lit) {
    return <rect x={x} y={y} width={CELL} height={CELL} rx={1.5} fill={`rgb(${rgb})`} opacity={0.16} />
  }
  return <LitCell x={x} y={y} index={index} progress={progress} rgb={rgb} />
}

/**
 * A cell that lights on a diagonal sweep, so the fill reads as a pass over the
 * models rather than a wipe across a screen. One motion value per cell, and only
 * while the pass is being shown.
 */
function LitCell({
  x,
  y,
  index,
  progress,
  rgb,
}: {
  x: number
  y: number
  index: number
  progress: StageProps['progress']
  rgb: string
}) {
  const col = index % GRID_COLS
  const row = Math.floor(index / GRID_COLS)
  const threshold = (row / GRID_ROWS) * 0.6 + (col / GRID_COLS) * 0.4
  const cell = useBeat(progress, 0.56 + threshold * 0.36, 0.58 + threshold * 0.36)

  return (
    <motion.rect
      x={x}
      y={y}
      width={CELL}
      height={CELL}
      rx={1.5}
      fill={`rgb(${rgb})`}
      style={{ opacity: cell }}
    />
  )
}