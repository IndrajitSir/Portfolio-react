import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SectionLabel, SectionBackground, SkillConstellation, type SkillDomain } from '@/components/ui'
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

          <div className="grid grid-cols-1 gap-x-8 gap-y-7 md:grid-cols-2">
            {domains.map((domain) => (
              <div key={domain.id}>
                <h3
                  className="mb-3 flex items-center gap-2 font-mono-code text-[0.68rem] uppercase tracking-widest"
                  style={{ color: 'var(--accent-teal)' }}
                >
                  <span aria-hidden="true">{domain.icon}</span>
                  {domain.title}
                </h3>
                <p
                  className="mb-3 text-[0.78rem] leading-[1.6]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {domain.summary}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {domain.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.evidence[0]?.href ?? '#projects'}
                        {...(item.evidence[0]?.href && !item.evidence[0].href.startsWith('#')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="
                          inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
                          font-mono-code text-[0.7rem] transition-colors duration-200
                          hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                        "
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text-secondary)',
                        }}
                        title={item.evidence.map((e) => e.label).join(' · ')}
                      >
                        {item.name}
                        <span style={{ color: 'var(--text-muted)' }} aria-hidden="true">
                          {item.evidence.length}
                        </span>
                        <span className="sr-only">
                          , demonstrated in {item.evidence.length} place
                          {item.evidence.length === 1 ? '' : 's'}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Explicit about what is not claimed ──────────────── */}
          <p
            className="mt-10 border-t pt-5 text-[0.78rem] leading-[1.7]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>A note on the numbers:</strong>{' '}
            this portfolio used to show a percentage against every skill. Those were
            self-assigned rather than measured, so they were removed. Each technology
            above instead lists the work that demonstrates it — a shipped project, a role,
            or a credential you can open and check.
          </p>
        </motion.div>
      </div>
    </section>
  )
}