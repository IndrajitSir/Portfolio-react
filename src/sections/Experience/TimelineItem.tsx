import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiChevronUp, FiArrowUpRight } from 'react-icons/fi'
import { fadeInUp } from '@/utils/animations'
import { GlowCard, Tag, WorkflowStory } from '@/components/ui'
import { accentColor, accentRgb } from '@/utils/accents'
import type { AccentKey, Experience } from '@/types'

interface TimelineItemProps {
  experience: Experience
  index: number
  isLast: boolean
}

// Each role gets an accent that matches the flavour of its work.
const ROLE_ACCENT: Record<string, AccentKey> = {
  distronix: 'teal',
  'jai-balaji': 'orange',
  'ardent-computech': 'indigo',
  systemtron: 'violet',
}

/**
 * Engagement type, stated plainly.
 *
 * Internships are kept visually distinct from employment so a short placement is
 * never read as a permanent role. The label is always visible, not a tooltip.
 */
const TYPE_LABEL: Record<Experience['type'], string> = {
  fulltime: 'Full-time',
  parttime: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
}

export default function TimelineItem({ experience, index, isLast }: TimelineItemProps) {
  const [flowIndex, setFlowIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const story = experience.story
  const flow = story?.flows[flowIndex]
  const accent = ROLE_ACCENT[experience.id] ?? 'teal'
  const accentHex = accentColor[accent]
  const detailsId = `exp-details-${experience.id}`

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      transition={{ delay: index * 0.15 }}
      className="relative pl-10"
    >
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-8 bottom-0 w-px"
          style={{
            background: 'linear-gradient(to bottom, var(--accent-teal), var(--accent-indigo), transparent)',
          }}
          aria-hidden="true"
        >
          <div
            className="absolute left-[-1.5px] top-0 w-1 h-24 timeline-flow rounded-full"
            style={{
              background: 'linear-gradient(to bottom, transparent, var(--accent-teal), transparent)',
              boxShadow: '0 0 8px var(--glow-teal)',
            }}
          />
        </div>
      )}

      {/* Dot */}
      <div
        className={`
          absolute left-0 top-[22px] w-[15px] h-[15px] rounded-full
          border-2 border-[var(--accent-teal)]
          ${experience.current
            ? 'bg-[var(--accent-teal)] shadow-[0_0_12px_var(--glow-teal)]'
            : 'bg-[var(--bg-primary)]'}
        `}
        aria-hidden="true"
      />

      <GlowCard className="mb-10" glowColor={`rgba(${accentRgb[accent]},0.14)`}>
        <div className="p-6 md:p-7">
          {/* ── Header ──────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div className="flex items-center flex-wrap gap-3">
              <h3 className="font-semibold text-[1.05rem]" style={{ color: 'var(--text-primary)' }}>
                {experience.role}
              </h3>
              {experience.current && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.65rem] uppercase tracking-wider font-mono-code"
                  style={{
                    background: 'rgba(94,234,212,0.1)',
                    border: '1px solid rgba(94,234,212,0.25)',
                    color: 'var(--accent-teal)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse" />
                  Current
                </span>
              )}
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.62rem] uppercase tracking-wider font-mono-code"
                style={{
                  background: experience.type === 'internship' ? 'transparent' : 'var(--surface)',
                  border: `1px solid ${experience.type === 'internship' ? accentHex : 'var(--border)'}`,
                  color: experience.type === 'internship' ? accentHex : 'var(--text-muted)',
                }}
              >
                {TYPE_LABEL[experience.type]}
              </span>
            </div>

            <span
              className="font-mono-code text-[0.72rem] px-3 py-1 rounded-full flex-shrink-0"
              style={{
                background: 'var(--glow-teal)',
                border: '1px solid var(--border-glow)',
                color: 'var(--accent-teal)',
              }}
            >
              {experience.period}
            </span>
          </div>

          {/* Company */}
          {experience.companyUrl ? (
            <a
              href={experience.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium mb-4 block hover:text-[var(--accent-teal)] transition-colors duration-200"
              style={{ color: 'var(--accent-indigo)' }}
            >
              {experience.company} ↗
            </a>
          ) : (
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--accent-indigo)' }}>
              {experience.company}
            </p>
          )}

          {story && (
            <p className="mb-5 text-sm leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
              {story.summary}
            </p>
          )}

          {/* ── Storytelling: flow tabs + animated narrative ── */}
          {story && flow && (
            <div className="mb-5">
              {story.flows.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Work narratives">
                  {story.flows.map((f, i) => {
                    const selected = i === flowIndex
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setFlowIndex(i)}
                        className="rounded-full px-3 py-1.5 font-mono-code text-[0.65rem] uppercase tracking-wide transition-all duration-200"
                        style={{
                          background: selected ? accentHex : 'var(--surface)',
                          color: selected ? 'var(--bg-primary)' : 'var(--text-secondary)',
                          border: `1px solid ${selected ? accentHex : 'var(--border)'}`,
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              )}
              <WorkflowStory flow={flow} accent={accent} />
            </div>
          )}

          {/* ── Responsibilities (retained, expandable) ─────── */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="flex items-center gap-2 font-mono-code text-[0.72rem] transition-colors duration-200"
            style={{ color: expanded ? accentHex : 'var(--text-muted)' }}
          >
            {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            Responsibilities &amp; achievements ({experience.description.length})
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="details"
                id={detailsId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <ul className="space-y-2.5 pt-4">
                  {experience.description.map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-3 items-start text-sm leading-[1.7]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span className="mt-[5px] text-[0.6rem] flex-shrink-0" style={{ color: accentHex }} aria-hidden="true">
                        ▸
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Tech tags ───────────────────────────────────── */}
          {experience.technologies && experience.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[var(--border)]">
              {experience.technologies.map((tech) => (
                <Tag key={tech} label={tech} variant="indigo" />
              ))}
            </div>
          )}

          {/* ── Evidence link, where the role has a public record ── */}
          {experience.sourceUrl && (
            <a
              href={experience.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 font-mono-code text-[0.68rem] transition-colors duration-200 hover:text-[var(--accent-teal)]"
              style={{ color: 'var(--text-muted)' }}
            >
              View the public post about this role
              <FiArrowUpRight size={11} aria-hidden="true" />
            </a>
          )}
        </div>
      </GlowCard>
    </motion.div>
  )
}
