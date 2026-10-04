import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { DURATION, EASE_OUT_EXPO, EASE_STANDARD } from '@/utils/motion'
import type { SkillEvidence } from '@/types'
import { EVIDENCE_STYLE } from './evidenceStyles'

/**
 * The capability map — a graph, not a scoreboard.
 *
 * This used to draw a node per domain sized by an average "proficiency" score and
 * a bar per skill. Those numbers were self-assigned and measured nothing, so both
 * are gone. What replaces them is something a visitor can actually check:
 *
 *  - a node is sized by how many distinct pieces of evidence back its domain,
 *  - selecting a domain lists each technology with the project, role or
 *    credential that demonstrates it,
 *  - every one of those is a link, so a claim can be verified in a click.
 *
 * The domain list and the connections come from `src/data/skills.ts`, so the map
 * cannot drift away from the rest of the portfolio.
 */

export interface SkillDomain {
  id: string
  title: string
  /** Compact label for the map node, where the full title would overflow. */
  short: string
  icon: string
  /** One line on what the domain is actually used for. */
  summary: string
  /** Technologies in this domain, each carrying its evidence. */
  items: { name: string; evidence: SkillEvidence[] }[]
  /** Ids of domains this one flows into. */
  connects: string[]
  /** Distinct evidence points across every technology in the domain. */
  evidenceCount: number
}

/**
 * A ring around the backend hub.
 *
 * Backend sits at the centre because it is the domain the documented career
 * actually builds on; everything else radiates from it.
 */
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  backend: { x: 50, y: 50 },
  languages: { x: 50, y: 11 },
  databases: { x: 76, y: 23 },
  security: { x: 86, y: 50 },
  infrastructure: { x: 76, y: 77 },
  'open-source': { x: 50, y: 89 },
  learning: { x: 24, y: 77 },
  frontend: { x: 14, y: 50 },
  architecture: { x: 24, y: 23 },
}

const CENTER = NODE_POSITIONS.backend

/**
 * Node diameter range, scaled by evidence count.
 *
 * Expressed against `SIZE_REF`, which is the map's maximum width, so a node is
 * sized as a percentage of whatever the map actually measures. Sizing in pixels
 * looked right on desktop but overflowed and collided once the map shrank to a
 * phone: nine 76px circles simply do not fit in a 300px box.
 */
const SIZE_REF = 560
const MIN_SIZE = 46
const MAX_SIZE = 76

export default function SkillConstellation({ domains }: { domains: SkillDomain[] }) {
  const reduceMotion = useReducedMotion()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pinnedId, setPinnedId] = useState<string | null>(null)

  const selectedId = pinnedId ?? activeId
  const active = domains.find((d) => d.id === selectedId) ?? null

  // Selecting a node keeps its neighbours lit and recedes the rest — the same
  // graph-reading behaviour as the hero topology, so the motion language is one
  // across the portfolio rather than one per section.
  const related = useMemo(() => {
    if (!active) return null
    return new Set<string>([active.id, ...active.connects])
  }, [active])

  const maxEvidence = useMemo(
    () => Math.max(1, ...domains.map((d) => d.evidenceCount)),
    [domains],
  )

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

        <div className="relative mx-auto aspect-[4/3] min-h-[440px] w-full max-w-[560px]">
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

            {/* Faint hub spokes, so every domain reads as connected */}
            {domains.map((domain) => {
              if (domain.id === 'backend') return null
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
                  animate={{ opacity: !related ? 0.45 : lit ? 0.8 : 0.1 }}
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
            // Size encodes how much evidence backs the domain — a count, not a score.
            const size = MIN_SIZE + (domain.evidenceCount / maxEvidence) * (MAX_SIZE - MIN_SIZE)
            // Percentage of the map's own width, so it shrinks with the layout.
            const sizePct = (size / SIZE_REF) * 100

            return (
              <motion.button
                key={domain.id}
                type="button"
                onClick={() => togglePin(domain.id)}
                onMouseEnter={() => setActiveId(domain.id)}
                onFocus={() => setActiveId(domain.id)}
                onBlur={() => setActiveId((v) => (v === domain.id ? null : v))}
                aria-pressed={pinnedId === domain.id}
                aria-label={`${domain.title}: ${domain.items.length} technologies, ${domain.evidenceCount} pieces of supporting evidence`}
                initial={false}
                animate={{ opacity: dimmed ? 0.35 : 1, scale: isActive ? 1.06 : 1 }}
                transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-offset-4"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  // The button carries the width, not the circle: a percentage
                  // width on the circle would resolve against a zero-width
                  // absolutely-positioned button and collapse to nothing.
                  width: `${sizePct}%`,
                }}
              >
                <span
                  className="flex aspect-square w-full items-center justify-center rounded-full border transition-colors duration-200"
                  style={{
                    borderColor: isActive ? 'var(--accent-teal)' : 'var(--border)',
                    background: isActive ? 'var(--glow-teal)' : 'var(--bg-secondary)',
                    boxShadow: isActive ? '0 0 18px var(--glow-teal)' : 'none',
                  }}
                >
                  <span className="text-base sm:text-lg" aria-hidden="true">{domain.icon}</span>
                </span>
                <span
                  className="whitespace-nowrap text-center font-mono-code text-[0.56rem] uppercase tracking-tight"
                  style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)' }}
                >
                  {domain.short}
                  <span style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                    {' '}
                    {domain.evidenceCount}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <p
          className="mt-2 text-center font-mono-code text-[0.58rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Node size = supporting evidence, not a self-assigned score
        </p>
      </div>

      {/* ── Detail panel ──────────────────────────────────────────── */}
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
              <div className="mb-1 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{active.icon}</span>
                <div>
                  <h3
                    className="font-mono-code text-[0.72rem] uppercase tracking-widest"
                    style={{ color: 'var(--accent-teal)' }}
                  >
                    {active.title}
                  </h3>
                  <p className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
                    {active.evidenceCount} pieces of evidence
                  </p>
                </div>
              </div>
              <p className="mb-4 text-[0.78rem] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
                {active.summary}
              </p>

              {/* Technologies with the thing that demonstrates each one. */}
              <ul className="space-y-3">
                {active.items.map((item) => (
                  <li key={item.name}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {item.evidence.map((evidence, i) => (
                        <li key={`${item.name}-${evidence.label}-${i}`}>
                          <EvidenceChip evidence={evidence} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>

              {active.connects.length > 0 && (
                <div className="mt-auto border-t border-[var(--border)] pt-4">
                  <p
                    className="mb-2 font-mono-code text-[0.56rem] uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
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
                          {target.short}
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
                How to read this
              </p>
              <p className="mt-2 text-sm leading-[1.75]" style={{ color: 'var(--text-secondary)' }}>
                Nothing here carries a self-assigned proficiency score. Each domain is sized by
                how much verifiable work sits behind it, and every technology lists the project,
                role or credential that demonstrates it.
              </p>
              <p className="mt-3 text-[0.8rem] leading-[1.7]" style={{ color: 'var(--text-muted)' }}>
                Select a domain to see the technologies and follow the evidence.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * One piece of evidence.
 *
 * Links to a portfolio anchor (`#projects`) navigate in-page; links to npm or
 * GitHub open externally. Both are labelled so the behaviour is never a
 * surprise.
 */
export function EvidenceChip({ evidence }: { evidence: SkillEvidence }) {
  const style = EVIDENCE_STYLE[evidence.kind]
  const external = evidence.href ? !evidence.href.startsWith('#') : false

  return (
    <a
      href={evidence.href ?? '#projects'}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="
        group inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5
        font-mono-code text-[0.6rem] transition-colors duration-200 hover:border-[var(--accent-teal)]
      "
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      title={`${evidence.kind}: ${evidence.label}`}
    >
      <span style={{ color: style.color }} aria-hidden="true">
        {style.glyph}
      </span>
      <span className="truncate">{evidence.label}</span>
      {evidence.href && (
        <FiArrowUpRight
          size={9}
          aria-hidden="true"
          className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
        />
      )}
      <span className="sr-only">
        {external ? ' (opens in a new tab)' : ''}
      </span>
    </a>
  )
}