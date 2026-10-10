import { useState } from 'react'
import { createAvatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'
import { motion, useReducedMotion } from 'framer-motion'
import { useActiveSection } from '@/hooks/useActiveSection'
import definition from '@/assets/strobi.avatar.json'

/**
 * Strobi — the portfolio's runtime companion.
 *
 * A single avatar component, built once from the definition so the JSON is
 * validated a single time. It sits directly above the cluster topology because
 * that is what it belongs to: the operator of the system drawn beneath it.
 *
 * It reads the reader's position rather than just animating in a loop:
 *
 *   · a node being inspected → `thinking`, because the reader is asking a
 *     question of the system and the operator is tracing the answer;
 *   · the pointer resting on the card → `working`;
 *   · otherwise a mood drawn from the section the reader is standing in, so the
 *     avatar changes expression as the page moves beneath it.
 *
 * Under `prefers-reduced-motion` it holds a calm, static expression instead of
 * an autoplaying timeline.
 */
const StrobiAvatar = createAvatar(definition)

type StrobiAnimation =
  | 'idle'
  | 'working'
  | 'thinking'
  | 'excited'
  | 'listening'
  | 'searching'
  | 'proud'
  | 'curious'
  | 'happy'

/**
 * One expression per section, following the shape of the page: the journey is
 * searched, the career is worn with pride, contact is a greeting. Sections not
 * listed (or none at all — the top of the page) fall back to idle.
 */
const SECTION_MOOD: Record<string, StrobiAnimation> = {
  '': 'excited',
  about: 'listening',
  journey: 'searching',
  skills: 'working',
  experience: 'proud',
  projects: 'curious',
  education: 'listening',
  credentials: 'proud',
  contact: 'happy',
}

interface StrobiAssistantProps {
  /** Diameter of the avatar well in pixels. */
  size?: number
  className?: string
  /** The cluster node the reader is currently inspecting, if any. */
  inspected?: string | null
}

export default function StrobiAssistant({
  size = 48,
  className = '',
  inspected = null,
}: StrobiAssistantProps) {
  const reduceMotion = useReducedMotion()
  const [engaged, setEngaged] = useState(false)
  const section = useActiveSection()

  // Inspection beats hovering, because it is the more specific of the two: a
  // node selected in the topology is a question being asked of the system.
  const mood: StrobiAnimation = inspected
    ? 'thinking'
    : engaged
      ? 'working'
      : SECTION_MOOD[section] ?? 'idle'

  const status = inspected
    ? 'Tracing the cluster…'
    : engaged
      ? 'Following your pointer…'
      : section
        ? `Runtime companion · ${section}`
        : 'Runtime companion · idle'

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${className}`}
      style={{
        background: 'var(--panel)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <span
        className="relative flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, background: 'var(--glow-teal)' }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid var(--border-glow)' }}
          aria-hidden="true"
        />
        {reduceMotion ? (
          <StrobiAvatar
            defaultExpression="neutral"
            size={size - 12}
            ariaLabel="Strobi — the portfolio's runtime companion"
          />
        ) : (
          <StrobiAvatar
            animation={mood}
            size={size - 12}
            ariaLabel="Strobi — the portfolio's runtime companion"
          />
        )}
      </span>

      <div className="min-w-0 leading-tight">
        <p
          className="font-mono-code text-[0.62rem] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-primary)' }}
        >
          Strobi
        </p>
        <p
          className="truncate text-[0.68rem]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {status}
        </p>
      </div>

      <span
        className="ml-auto hidden shrink-0 items-center gap-1.5 sm:flex"
        style={{ color: 'var(--accent-teal)' }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--accent-teal)' }}
          aria-hidden="true"
        />
        <span className="font-mono-code text-[0.55rem] uppercase tracking-widest">
          {inspected || engaged ? 'active' : 'online'}
        </span>
      </span>
    </motion.div>
  )
}
