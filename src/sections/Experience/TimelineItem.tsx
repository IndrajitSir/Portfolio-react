import { motion } from 'framer-motion'
import { fadeInUp } from '@/utils/animations'
import { GlowCard, Tag } from '@/components/ui'
import type { Experience } from '@/types'

interface TimelineItemProps {
  experience: Experience
  index: number
  isLast: boolean
}

export default function TimelineItem({ experience, index, isLast }: TimelineItemProps) {
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
        />
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

      <GlowCard className="mb-10">
        <div className="p-7">
          {/* Top row */}
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
              className="text-sm font-medium mb-5 block hover:text-[var(--accent-teal)] transition-colors duration-200"
              style={{ color: 'var(--accent-indigo)' }}
            >
              {experience.company} ↗
            </a>
          ) : (
            <p className="text-sm font-medium mb-5" style={{ color: 'var(--accent-indigo)' }}>
              {experience.company}
            </p>
          )}

          {/* Bullets */}
          <ul className="space-y-2.5">
            {experience.description.map((point, i) => (
              <li
                key={i}
                className="flex gap-3 items-start text-sm leading-[1.7]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="mt-[5px] text-[0.6rem] flex-shrink-0"
                  style={{ color: 'var(--accent-teal)' }}
                  aria-hidden="true"
                >
                  ▸
                </span>
                {point}
              </li>
            ))}
          </ul>

          {/* Tech tags */}
          {experience.technologies && experience.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[var(--border)]">
              {experience.technologies.map((tech) => (
                <Tag key={tech} label={tech} variant="indigo" />
              ))}
            </div>
          )}
        </div>
      </GlowCard>
    </motion.div>
  )
}
