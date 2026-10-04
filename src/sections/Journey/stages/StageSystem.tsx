import { useState } from 'react'
import { motion, useTransform } from 'framer-motion'
import { ControlChip, ControlDetail, ControlRow, Label, StageCanvas } from './stageKit'
import { useBeat } from './useBeat'
import { SYSTEM_ROLES } from './stageData'
import type { StageProps } from './types'

/**
 * Chapter V — Build a real system.
 *
 * The Campus Placement Recruitment System, drawn the way the sources describe it:
 * a single lifecycle with three roles hanging off it. Selecting a role lights its
 * lane and recedes the other two, which is the same graph-reading behaviour the
 * capability map and the hero topology use — one motion language across the
 * portfolio rather than one per section.
 *
 * Continuity: the little interface box arriving from Chapter IV lands here as the
 * Student node. The same shape, one chapter later, is a user of the system rather
 * than the thing being drawn.
 */

const SPINE = { x: 158, y: 44, w: 44, h: 136 }
const ROLES = [
  { id: 'student', name: SYSTEM_ROLES[0], x: 20, y: 70, w: 96, h: 42 },
  { id: 'company', name: SYSTEM_ROLES[1], x: 244, y: 70, w: 96, h: 42 },
  { id: 'admin', name: SYSTEM_ROLES[2], x: 132, y: 208, w: 96, h: 42 },
]
/** Where each role's lane meets the spine. */
const MEETS = { student: 91, company: 91, admin: 180 }

/** What each role is, stated at the level the sources support. */
const ROLE_DETAIL: Record<string, string> = {
  student: 'One of the three roles the portal gives its users.',
  company: 'One of the three roles the portal gives its users.',
  admin: 'One of the three roles the portal gives its users.',
}

export default function StageSystem({ progress, accent, rgb, travelled }: StageProps) {
  const [selected, setSelected] = useState<string>('student')
  const spine = useBeat(progress, 0.06, 0.34)
  const lanes = useBeat(progress, 0.2, 0.62)
  const arrival = useBeat(progress, 0.44, 0.8)
  const arrivalX = useTransform(arrival, [0, 1], [-18, 0])

  return (
    <div>
      <StageCanvas rgb={rgb} travelled={travelled}>
        {/* Chapter IV's interface, arriving and becoming the student role. */}
        <motion.g style={{ opacity: arrival, x: arrivalX }}>
          <rect x={30} y={26} width={48} height={26} rx={5} fill="var(--bg-secondary)" stroke="var(--border)" />
          <rect x={36} y={34} width={36} height={4} rx={2} fill="var(--text-muted)" opacity={0.6} />
          <rect x={36} y={42} width={24} height={4} rx={2} fill="var(--text-muted)" opacity={0.35} />
          <Label x={86} y={43} size={8}>
            chapter IV
          </Label>
          <path
            d={`M 54 54 V ${ROLES[0].y - 6}`}
            stroke="var(--text-muted)"
            strokeWidth={1}
            strokeDasharray="2 3"
            fill="none"
          />
        </motion.g>

        {/* The lifecycle */}
        <motion.rect
          {...SPINE}
          rx={SPINE.w / 2}
          fill={`rgba(${rgb},0.07)`}
          stroke={`rgba(${rgb},0.45)`}
          style={{ opacity: spine }}
        />
        {[78, 112, 146].map((y) => (
          <motion.line
            key={y}
            x1={SPINE.x + 10}
            y1={y}
            x2={SPINE.x + SPINE.w - 10}
            y2={y}
            stroke={`rgba(${rgb},0.5)`}
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{ opacity: spine }}
          />
        ))}
        <Label x={SPINE.x + SPINE.w / 2} y={SPINE.y + SPINE.h + 18} anchor="middle" size={8.5}>
          placement lifecycle
        </Label>

        {/* Roles and their lanes */}
        {ROLES.map((role, i) => (
          <RoleLane
            key={role.id}
            role={role}
            index={i}
            progress={progress}
            lanes={lanes}
            rgb={rgb}
            selected={selected}
          />
        ))}

        <Label x={344} y={300} anchor="end" size={9} fill={`rgba(${rgb},0.95)`}>
          3 roles · one lifecycle
        </Label>
      </StageCanvas>

      <ControlRow>
        {ROLES.map((role) => (
          <ControlChip
            key={role.id}
            label={`${role.name} role`}
            active={selected === role.id}
            onClick={() => setSelected(role.id)}
            accent={accent}
          />
        ))}
      </ControlRow>
      <ControlDetail>{ROLE_DETAIL[selected]}</ControlDetail>
    </div>
  )
}

/** One role, its lane to the lifecycle, and the interface it hangs off. */
function RoleLane({
  role,
  index,
  progress,
  lanes,
  rgb,
  selected,
}: {
  role: { id: string; name: string; x: number; y: number; w: number; h: number }
  index: number
  progress: StageProps['progress']
  lanes: ReturnType<typeof useBeat>
  rgb: string
  selected: string
}) {
  const enter = useBeat(progress, 0.22 + index * 0.08, 0.46 + index * 0.08)
  const opacity = useTransform(enter, [0, 1], [0, 1])
  const active = selected === role.id
  const meet = MEETS[role.id as keyof typeof MEETS]

  // Lanes run from the role's edge to the point where it meets the spine.
  const path =
    role.id === 'admin'
      ? `M ${role.x + role.w / 2} ${role.y} V ${meet}`
      : `M ${role.x + role.w} ${role.y + role.h / 2} H ${meet}`

  return (
    <motion.g style={{ opacity }}>
      <motion.path
        d={path}
        fill="none"
        strokeWidth={active ? 1.8 : 1}
        stroke={active ? `rgba(${rgb},0.9)` : 'var(--border)'}
        style={{ pathLength: lanes, opacity: active ? 1 : 0.6 }}
      />
      <rect
        x={role.x}
        y={role.y}
        width={role.w}
        height={role.h}
        rx={8}
        fill={active ? `rgba(${rgb},0.12)` : 'var(--surface)'}
        stroke={active ? `rgba(${rgb},0.7)` : 'var(--border)'}
      />
      <Label
        x={role.x + role.w / 2}
        y={role.y + 26}
        anchor="middle"
        size={11}
        weight={600}
        fill={active ? 'var(--text-primary)' : 'var(--text-secondary)'}
      >
        {role.name}
      </Label>
    </motion.g>
  )
}