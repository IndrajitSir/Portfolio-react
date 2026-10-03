import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { AccentKey, ExperienceFlow } from '@/types'
import { accentColor } from '@/utils/accents'

interface WorkflowStoryProps {
  flow: ExperienceFlow
  accent?: AccentKey
  /** Milliseconds between automatic stage advances. */
  step?: number
}

/**
 * Turns a work flow into a self-explanatory, animated narrative: a progress rail
 * steps through the real process stages, the completed path lights up, and a
 * detail panel explains the current step. Clicking a stage pins it; hovering or
 * focusing the rail pauses the auto-advance so the visitor stays in control.
 */
export default function WorkflowStory({ flow, accent = 'teal', step = 2400 }: WorkflowStoryProps) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [paused, setPaused] = useState(false)

  const count = flow.stages.length
  // Clamp: a stage index from a previous (longer) flow must never overrun.
  const current = Math.min(active, Math.max(0, count - 1))
  const stage = flow.stages[current]
  const accentHex = accentColor[accent]

  useEffect(() => {
    if (reduceMotion || paused || pinned || count <= 1) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count)
    }, step)
    return () => window.clearInterval(id)
  }, [reduceMotion, paused, pinned, count, step])

  // Reset when the selected flow changes.
  useEffect(() => {
    setActive(0)
    setPinned(false)
  }, [flow.id])

  if (!stage) return null

  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: accentHex }}>
          {flow.title}
        </p>
        <span className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
          {String(current + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}
        </span>
      </div>

      {/* ── Horizontal rail (md and up) ─────────────────────── */}
      <ol className="relative hidden md:flex items-start justify-between" aria-label={`${flow.title} steps`}>
        {flow.stages.map((s, i) => {
          const lit = i <= current
          const isActive = i === current
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center text-center">
              {i < count - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[9px] h-[2px] w-full"
                  style={{ background: i < current ? accentHex : 'var(--border)' }}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setActive(i)
                  setPinned(true)
                }}
                aria-label={`Step ${i + 1}: ${s.label}`}
                aria-pressed={pinned && isActive}
                className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200"
                style={{
                  borderColor: lit ? accentHex : 'var(--border)',
                  background: isActive ? accentHex : 'var(--bg-primary)',
                  boxShadow: isActive ? `0 0 12px ${accentHex}` : 'none',
                }}
              >
                {i < current && (
                  <span aria-hidden="true" style={{ color: 'var(--bg-primary)', fontSize: 9, lineHeight: 1 }}>
                    ✓
                  </span>
                )}
              </button>
              <span
                className="mt-2 px-1 font-mono-code text-[0.58rem] uppercase leading-tight tracking-wide"
                style={{ color: lit ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>

      {/* ── Vertical rail (mobile) ──────────────────────────── */}
      <ol className="md:hidden" aria-label={`${flow.title} steps`}>
        {flow.stages.map((s, i) => {
          const lit = i <= current
          return (
            <li key={s.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    setActive(i)
                    setPinned(true)
                  }}
                  aria-label={`Step ${i + 1}: ${s.label}`}
                  aria-pressed={pinned && i === current}
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: lit ? accentHex : 'var(--border)',
                    background: i === current ? accentHex : 'var(--bg-primary)',
                  }}
                />
                {i < count - 1 && (
                  <span
                    aria-hidden="true"
                    className="w-px flex-1"
                    style={{ background: i < current ? accentHex : 'var(--border)', minHeight: 18 }}
                  />
                )}
              </div>
              <span
                className="pb-3 font-mono-code text-[0.66rem] uppercase tracking-wide"
                style={{ color: lit ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>

      {/* ── Active step explanation ─────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className="relative mt-4 overflow-hidden rounded-lg border border-[var(--border)] p-3"
        style={{ background: 'var(--bg-primary)' }}
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[2px]" style={{ background: accentHex }} />
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.24 }}
          >
            <p className="mb-1 font-mono-code text-[0.6rem] uppercase tracking-widest" style={{ color: accentHex }}>
              {stage.label}
            </p>
            <p className="text-[0.82rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {stage.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
