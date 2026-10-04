import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  SectionLabel,
  SectionBackground,
  SkillConstellation,
  TechnologyRail,
  type SkillDomain,
} from '@/components/ui'
import { skillCategories } from '@/data'
import { DURATION, EASE_OUT_EXPO, REVEAL_VIEWPORT } from '@/utils/motion'

/**
 * Short map labels.
 *
 * The node sits in a fixed-size circle on a ring, so the full domain title would
 * overflow at the edges. Kept beside the layout rather than in the data file,
 * because it is purely a presentation concern.
 */
const SHORT_LABEL: Record<string, string> = {
  backend: 'Backend',
  databases: 'Data',
  frontend: 'Frontend',
  languages: 'Languages',
  architecture: 'Design',
  'open-source': 'Open src',
  infrastructure: 'Infra',
  security: 'Security',
  learning: 'AI / Data',
}

export default function Skills() {
  /**
   * Domains are derived straight from `src/data/skills.ts`.
   *
   * Node size comes from `evidenceCount` — the number of distinct places in this
   * portfolio that back the domain — so nothing here invents a proficiency
   * figure the way the old bars did.
   */
  const domains = useMemo<SkillDomain[]>(
    () =>
      skillCategories.map((cat) => ({
        id: cat.id,
        title: cat.title,
        short: SHORT_LABEL[cat.id] ?? cat.title,
        icon: cat.icon,
        summary: cat.summary,
        items: cat.items.map((item) => ({ name: item.name, evidence: item.evidence })),
        connects: cat.connects,
        // Distinct evidence points: a technology used in two places counts once
        // per place, but the same repeated record is not double-counted.
        evidenceCount: new Set(cat.items.flatMap((item) => item.evidence.map((e) => e.label))).size,
      })),
    [],
  )

  const totals = useMemo(() => {
    const technologies = domains.reduce((sum, d) => sum + d.items.length, 0)
    const evidence = new Set(
      domains.flatMap((d) => d.items.flatMap((item) => item.evidence.map((e) => e.label))),
    ).size
    return { technologies, evidence, domains: domains.length }
  }, [domains])

  return (
    <section
      id="skills"
      aria-label="Skills section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SectionBackground variant="circuit" />
      <div className="max-container section-padding relative z-10">
        <SectionLabel index="03" label="Expertise" title="The engineering" titleAccent="toolkit" />

        {/* ── Capability map: domains, connections, evidence ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
        >
          <SkillConstellation domains={domains} />
        </motion.div>

        {/* ── Full toolkit, grouped and scannable ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
          className="mt-16"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <p
              className="font-mono-code text-[0.72rem] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Every technology, and where it is demonstrated
            </p>
            <p className="font-mono-code text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
              {totals.domains} domains · {totals.technologies} technologies · {totals.evidence} evidence
              points
            </p>
          </div>

          {/* One card per technology on a single horizontal rail, instead of
              nine stacked blocks of chips. Same facts, a fraction of the
              vertical space, and far less DOM. */}
          <TechnologyRail domains={domains} />
        </motion.div>
      </div>
    </section>
  )
}
