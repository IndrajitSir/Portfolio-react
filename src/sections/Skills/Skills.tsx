import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SectionLabel, SectionBackground, SkillConstellation, type SkillDomain } from '@/components/ui'
import { skillCategories, techStack } from '@/data'
import { DURATION, EASE_OUT_EXPO, REVEAL_VIEWPORT } from '@/utils/motion'

/**
 * How the domains relate. This is the missing information the old card grid
 * never conveyed: which capability feeds which. Kept as data next to the map so
 * the graph stays honest and easy to adjust.
 */
const CONNECTIONS: Record<string, string[]> = {
  languages: ['backend', 'concepts'],
  backend: ['databases', 'tools'],
  databases: ['backend', 'concepts'],
  tools: ['backend'],
  concepts: ['backend', 'databases'],
  enterprise: ['concepts'],
}

export default function Skills() {
  // Derive each domain's strength from the real skill levels rather than
  // inventing a number, so node size is grounded in the actual data.
  const domains = useMemo<SkillDomain[]>(
    () =>
      skillCategories.map((cat) => {
        const items = [...cat.skills].sort((a, b) => b.level - a.level)
        const strength =
          items.length > 0
            ? Math.round(items.reduce((sum, s) => sum + s.level, 0) / items.length)
            : null
        return {
          id: cat.id,
          title: cat.title,
          icon: cat.icon,
          strength,
          items,
          tags: cat.tags ?? [],
          connects: CONNECTIONS[cat.id] ?? [],
        }
      }),
    [],
  )

  return (
    <section
      id="skills"
      aria-label="Skills section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SectionBackground variant="circuit" />
      <div className="max-container section-padding relative z-10">
        <SectionLabel
          index="02"
          label="Expertise"
          title="Technical"
          titleAccent="skills"
        />

        {/* ── Capability constellation: domains and how they connect ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
        >
          <SkillConstellation domains={domains} />
        </motion.div>

        {/* ── Tech stack chips ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
          className="mt-16"
        >
          <p
            className="font-mono-code text-[0.72rem] uppercase tracking-widest mb-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Full tech arsenal
          </p>
          <div className="flex flex-wrap gap-3">
            {techStack.map((item) => (
              <motion.span
                key={item.name}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full cursor-default
                  border border-[var(--border)] bg-[var(--surface)]
                  font-mono-code text-[0.8rem]
                  hover:border-[var(--border-glow)] hover:bg-[var(--glow-teal)]
                  hover:text-[var(--accent-teal)]
                  transition-colors duration-200
                "
                style={{ color: 'var(--text-secondary)' }}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
