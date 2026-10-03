import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'

/**
 * Skill relationships, shown as a connected map.
 *
 * Skills used to be six independent cards of bars. That says "here is a list";
 * it does not say how the domains relate or where the strength actually is.
 * This constellation keeps every real skill value but adds the missing layer:
 * domains are nodes whose size reflects their average proficiency, the links
 * show which domains feed into each other, and selecting a node reveals the
 * concrete skills behind it.
 *
 * Readability is preserved — the node label and value are always visible, so the
 * section still works without any interaction.
 */

export interface SkillDomain {
  id: string
  title: string
  icon: string
  /** Average proficiency of the measurable skills, or null for tag-only domains. */
  strength: number | null
  /** Concrete skills, strongest first. */
  items: { name: string; level: number }[]
  /** Tag-only domains (tools, concepts, enterprise) list capability names. */
  tags: string[]
  /** Ids of domains this one flows into. */
  connects: string[]
}

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  languages: { x: 50, y: 16 },
  backend: { x: 80, y: 40 },
  databases: { x: 68, y: 78 },
  tools: { x: 32, y: 78 },
  concepts: { x: 20, y: 40 },
  enterprise: { x: 50, y: 52 },
}

const CENTER = { x: 50, y: 47 }

export default function SkillConstellation({ domains }: { domains: SkillDomain[] }) {
  const reduceMotion = useReducedMotion()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)

  const selectedId = pinnedId ?? activeId
  const active = domains.find((d) => d.id === selectedId) ?? null

  // Focus + context: when a domain is selected, its neighbours stay lit and the
  // rest recede — the same graph-reading behaviour as the hero topology, so the
  // motion language stays consistent across sections.
  const related = useMemo(() => {
    if (!active) return null
    return new Set<string>([active.id, ...active.connects])
  }, [active])

  const togglePin = (id: string) => setPinnedId((prev) => (prev === id ? null : id))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {/* ── Map ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-md sm:p-6"
        onMouseLeave={() => setActiveId(null)}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: 'var(--accent-teal)' }}>
            Capability map
          </p>
          <span className="font-mono-code text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>
            {pinnedId ? 'Pinned — click again to release' : 'Hover or tap a domain'}
          </span>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[520px]">
          {/* Connective tissue — drawn first so nodes sit on top */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
            {domains.flatMap((domain) =>
              domain.connects.map((targetId) => {
                const from = NODE_POSITIONS[domain.id]
                const to = NODE_POSITIONS[targetId]
                if (!from || !to) return null
                const lit = !!related && related.has(domain.id) && related.has(targetId)
                return (
                  <motion.line
                    key={`${domain.id}-${targetId}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={lit ? 'var(--accent-teal)' : 'var(--border)'}
                    strokeWidth={lit ? 0.6 : 0.3}
                    strokeDasharray="1.5 1.5"
                    initial={false}
                    animate={{ opacity: !related ? 0.8 : lit ? 1 : 0.22 }}
                    transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
                  />
                )
              }),
            )}

            {/* Faint hub links so tag-only domains still read as connected */}
            {domains.map((domain) => {
              const pos = NODE_POSITIONS[domain.id]
              if (!pos) return null
              const lit = related?.has(domain.id) ?? false
              return (
                <motion.line
                  key={`hub-${domain.id}`}
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={lit ? 'var(--accent-indigo)' : 'var(--border)'}
                  strokeWidth={0.25}
                  initial={false}
                  animate={{ opacity: !related ? 0.5 : lit ? 0.8 : 0.12 }}
                  transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
                />
              )
            })}
          </svg>

          {/* Domain nodes */}
          {domains.map((domain) => {
            const pos = NODE_POSITIONS[domain.id]
            if (!pos) return null
            const isActive = selectedId === domain.id
            const dimmed = !!related && !related.has(domain.id)
            // Node size encodes real proficiency; tag-only domains sit at a
            // neutral size since they have no measured level.
            const size = domain.strength === null ? 54 : 48 + (domain.strength / 100) * 26

            return (
              <motion.button
                key={domain.id}
                type="button"
                onClick={() => togglePin(domain.id)}
                onMouseEnter={() => setActiveId(domain.id)}
                onFocus={() => setActiveId(domain.id)}
                onBlur={() => setActiveId((v) => (v === domain.id ? null : v))}
                aria-pressed={pinnedId === domain.id}
                aria-label={
                  `${domain.title}` +
                  (domain.strength !== null ? `, average proficiency ${domain.strength}%` : ', capability tags')
                }
                initial={false}
                animate={{ opacity: dimmed ? 0.35 : 1, scale: isActive ? 1.06 : 1 }}
                transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-offset-4"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <span
                  className="flex items-center justify-center rounded-full border transition-colors duration-200"
                  style={{
                    width: size,
                    height: size,
                    borderColor: isActive ? 'var(--accent-teal)' : 'var(--border)',
                    background: isActive ? 'var(--glow-teal)' : 'var(--bg-secondary)',
                    boxShadow: isActive ? '0 0 18px var(--glow-teal)' : 'none',
                  }}
                >
                  <span className="text-lg" aria-hidden="true">{domain.icon}</span>
                </span>
                <span
                  className="whitespace-nowrap font-mono-code text-[0.56rem] uppercase tracking-tight"
                  style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }}
                >
                  {domain.title}
                  {domain.strength !== null && (
                    <span style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                      {' '}{domain.strength}%
                    </span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>

        <p className="mt-2 text-center font-mono-code text-[0.58rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Node size reflects measured proficiency
        </p>
      </div>

      {/* ── Detail panel: reveals the concrete skills behind a domain ── */}
      <div
        role="status"
        aria-live="polite"
        className="relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-md sm:p-6"
      >
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: DURATION.quick, ease: EASE_STANDARD }}
              className="flex flex-1 flex-col"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{active.icon}</span>
                <div>
                  <h3 className="font-mono-code text-[0.72rem] uppercase tracking-widest" style={{ color: 'var(--accent-teal)' }}>
                    {active.title}
                  </h3>
                  {active.strength !== null && (
                    <p className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
                      average {active.strength}%
                    </p>
                  )}
                </div>
              </div>

              {active.items.length > 0 ? (
                <ul className="space-y-3">
                  {active.items.map((item) => (
                    <li key={item.name}>
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                        <span className="font-mono-code text-[0.68rem]" style={{ color: 'var(--accent-teal)' }}>
                          {item.level}%
                        </span>
                      </div>
                      <div
                        className="h-[3px] overflow-hidden rounded-full"
                        style={{ background: 'var(--border)' }}
                        role="progressbar"
                        aria-valuenow={item.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.name} proficiency: ${item.level}%`}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))' }}
                          initial={reduceMotion ? { width: `${item.level}%` } : { width: 0 }}
                          animate={{ width: `${item.level}%` }}
                          transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE_OUT_EXPO }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 font-mono-code text-[0.68rem]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {active.connects.length > 0 && (
                <div className="mt-auto border-t border-[var(--border)] pt-4">
                  <p className="mb-2 font-mono-code text-[0.56rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Feeds into
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {active.connects.map((id) => {
                      const target = domains.find((d) => d.id === id)
                      if (!target) return null
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPinnedId(id)}
                          className="rounded border border-[var(--border)] px-2 py-0.5 font-mono-code text-[0.6rem] uppercase transition-colors hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {target.title}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: DURATION.quick }}
              className="flex flex-1 flex-col justify-center"
            >
              <p className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Domain detail
              </p>
              <p className="mt-2 text-sm leading-[1.75]" style={{ color: 'var(--text-secondary)' }}>
                The map connects the domains I work across — languages feed the backend, the backend
                leans on databases and tooling, and enterprise process knowledge shapes how the
                systems get designed.
              </p>
              <p className="mt-3 text-[0.8rem] leading-[1.7]" style={{ color: 'var(--text-muted)' }}>
                Select any domain to see the specific skills and levels behind it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
