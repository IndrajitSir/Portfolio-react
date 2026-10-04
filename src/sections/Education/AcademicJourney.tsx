import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { FiAward, FiBookOpen } from 'react-icons/fi'
import { accentColor } from '@/utils/accents'
import { institutionNotes } from '@/data/education'
import type { Education } from '@/types'

/**
 * The academic journey as a path that fills in with scroll.
 *
 * Education used to be three interchangeable cards, which said nothing about
 * progression. Here the milestones are ordered along a single route whose
 * completed portion is drawn by scroll position, so the visitor sees the journey
 * accumulate — and each stop shows its real score in place.
 */

interface AcademicJourneyProps {
  items: Education[]
}

/** Chronological: earliest first, so the path reads as forward progress. */
const ordered = (items: Education[]) => [...items].reverse()

export default function AcademicJourney({ items }: AcademicJourneyProps) {
  const reduceMotion = useReducedMotion()
  const routeRef = useRef<HTMLDivElement>(null)

  // Scroll progress across the whole journey drives the drawn portion.
  const { scrollYProgress } = useScroll({
    target: routeRef,
    offset: ['start 75%', 'end 55%'],
  })
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const height = useTransform(drawn, [0, 1], ['0%', '100%'])

  const milestones = ordered(items)

  return (
    <div ref={routeRef} className="relative pl-10 sm:pl-14">
      {/* ── The route: a static track with a progress fill ─────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-[13px] top-2 w-px sm:left-[21px]"
        style={{ background: 'var(--border)' }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 origin-top"
          style={{
            height: reduceMotion ? '100%' : height,
            background: 'linear-gradient(to bottom, var(--accent-teal), var(--accent-indigo))',
            boxShadow: '0 0 8px var(--glow-teal)',
          }}
        />
      </div>

      <ol className="space-y-6">
        {milestones.map((edu, i) => {
          const accent = accentColor.teal
          const isLatest = i === milestones.length - 1

          return (
            <motion.li
              key={edu.id}
              initial={reduceMotion ? undefined : { opacity: 0, x: -22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Milestone marker */}
              <span
                aria-hidden="true"
                className="absolute -left-10 top-6 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 sm:-left-14"
                style={{
                  borderColor: accent,
                  background: isLatest ? accent : 'var(--bg-primary)',
                  color: isLatest ? 'var(--bg-primary)' : accent,
                  boxShadow: isLatest ? '0 0 14px var(--glow-teal)' : 'none',
                }}
              >
                {isLatest ? <FiAward size={13} /> : <FiBookOpen size={13} />}
              </span>

              <div
                className="
                  group relative overflow-hidden rounded-2xl border border-[var(--border)]
                  bg-[var(--surface)] p-5 backdrop-blur-md transition-colors duration-300
                  hover:border-[var(--border-glow)] sm:p-6
                "
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[200px] flex-1">
                    <p
                      className="font-mono-code text-[0.6rem] uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {String(i + 1).padStart(2, '0')} · {edu.period}
                    </p>
                    <h3 className="mt-1 font-semibold text-[0.95rem] leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {edu.degree}
                    </h3>
                    <p className="mt-1 text-[0.82rem]" style={{ color: 'var(--text-secondary)' }}>
                      {edu.institution}
                    </p>
                    {edu.university && (
                      <p className="text-[0.75rem]" style={{ color: 'var(--text-muted)' }}>
                        {edu.university}
                      </p>
                    )}
                    {institutionNotes[edu.id] && (
                      <p
                        className="mt-2 max-w-[46ch] text-[0.72rem] leading-[1.6]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {institutionNotes[edu.id]}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-2xl" aria-hidden="true">{edu.icon}</span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono-code text-[0.72rem] font-semibold"
                      style={{
                        background: 'var(--glow-teal)',
                        border: '1px solid var(--border-glow)',
                        color: accent,
                      }}
                    >
                      {edu.scoreType === 'cgpa' ? '⭐' : '📊'} {edu.score}
                    </span>
                  </div>
                </div>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
