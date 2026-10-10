import { useState } from 'react'
import { createAvatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'
import { motion, useReducedMotion } from 'framer-motion'
import definition from '@/assets/strobi.avatar.json'

/**
 * Strobi — the portfolio's runtime companion.
 *
 * A single avatar component, built once from the definition so the JSON is
 * validated a single time. It sits directly above the cluster topology because
 * that is what it belongs to: the operator of the system drawn beneath it.
 *
 * Ambient by default: it idles while the reader is passing, and switches to
 * `working` while the pointer (or keyboard focus) rests on it, so the whole card
 * — not just an icon — reads as alive. Under `prefers-reduced-motion` it holds a
 * calm, static expression instead of an autoplaying timeline.
 */
const StrobiAvatar = createAvatar(definition)

interface StrobiAssistantProps {
  /** Diameter of the avatar well in pixels. */
  size?: number
  className?: string
}

export default function StrobiAssistant({ size = 48, className = '' }: StrobiAssistantProps) {
  const reduceMotion = useReducedMotion()
  const [engaged, setEngaged] = useState(false)

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
            animation={engaged ? 'working' : 'idle'}
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
          {engaged ? 'Tracing the cluster…' : 'Runtime companion · idle'}
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
          {engaged ? 'active' : 'online'}
        </span>
      </span>
    </motion.div>
  )
}
