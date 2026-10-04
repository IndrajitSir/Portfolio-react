import { motion } from 'framer-motion'
import { FiMail, FiMapPin } from 'react-icons/fi'
import { personalInfo, languages, journeyChapters } from '@/data'
import { staggerContainer, fadeInUp } from '@/utils/animations'
import { SectionLabel, GlowCard, SectionBackground, MindsetTrace } from '@/components/ui'

// The three facts that used to sit in the static shell block, kept as a compact
// readout beside the mindset trace so no content is lost.
const READOUT = [
  { key: 'currently', value: 'building @ Distronix, IN' },
  { key: 'focus', value: 'Distributed APIs & RBAC Security' },
  { key: 'status', value: 'Open to high-impact software roles' },
]

/**
 * The documented route so far, straight from the journey data.
 *
 * Kept as a one-line arc here so the About section answers "where did this come
 * from?" without making the reader scroll into Chapter I. The Journey section
 * that follows expands each of these into the full story.
 */
const ARC = [
  { label: 'Java & HackerRank', href: '#chapter-learn' },
  { label: 'Web development internship', href: '#chapter-build' },
  { label: 'MERN full stack', href: '#chapter-systems' },
  { label: 'Low-level design', href: '#chapter-design' },
  { label: 'Production backend', href: '#chapter-ship' },
  { label: 'Open source on npm', href: '#chapter-publish' },
]

const contactLinks = [
  { icon: <FiMail size={15} />, label: personalInfo.email, href: `mailto:${personalInfo.email}`, wide: true },
  { icon: <span className="font-bold text-xs">&lt;&gt;</span>, label: 'GitHub', href: personalInfo.github },
  { icon: <span className="font-bold text-xs">⌘</span>, label: 'LinkedIn', href: personalInfo.linkedin ?? '#' },
]

export default function About() {
  return (
    <section
      id="about"
      aria-label="About section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <SectionBackground variant="code" />
      <div className="max-container section-padding relative z-10">
        <SectionLabel index="02" label="Background" title="The person behind the" titleAccent="code" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <GlowCard>
            <div className="p-5 sm:p-7 lg:p-8">
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src="/indrajit-portrait.png"
                    alt="Portrait of Indrajit Mandal"
                    loading="lazy"
                    decoding="async"
                    className="h-[68px] w-[68px] rounded-xl object-cover border-2 border-[var(--accent-teal)] shadow-[0_0_18px_var(--glow-teal)]"
                  />
                  <span
                    className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: 'var(--accent-teal)', color: 'var(--bg-primary)' }}
                    aria-label="Available for opportunities"
                  >
                    ✓
                  </span>
                </div>
                <div className="min-w-[190px] flex-1">
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {personalInfo.name}
                  </h3>
                  <p className="font-mono-code text-sm" style={{ color: 'var(--accent-teal)' }}>
                    {personalInfo.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <FiMapPin size={12} style={{ color: 'var(--accent-teal)' }} />
                    {personalInfo.location}
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-5 space-y-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                <p>
                  Currently engineering at <strong className="text-[var(--text-primary)]">Distronix</strong>, building backend foundations for a finance-focused NestJS application — an authorization system, a secure file-handling service, and an indexing pass across 150+ database models.
                </p>
                <p>
                  Before that, <strong className="text-[var(--text-primary)]">SAP Officer Trainee at Jai Balaji Industries</strong> (SAP S/4HANA, SD module), working the order-to-cash cycle. Before that, internships at <strong className="text-[var(--text-primary)]">SystemTron</strong> and <strong className="text-[var(--text-primary)]">Ardent Computech</strong> building front-end and full-stack systems.
                </p>
              </motion.div>

              {/* ── The arc: where each stage of the work came from ── */}
              {/* Each stop links to its chapter, so this doubles as a shortcut
                  into the narrative rather than being a decorative timeline. */}
              <motion.div variants={fadeInUp} className="mt-5">
                <p
                  className="mb-2 font-mono-code text-[0.6rem] uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  How it went, in {journeyChapters.length} documented chapters
                </p>
                <ul className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  {ARC.map((stop, i) => (
                    <li key={stop.label} className="flex items-center gap-2">
                      {i > 0 && (
                        <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                          →
                        </span>
                      )}
                      <a
                        href={stop.href}
                        className="rounded-full border px-2.5 py-1 font-mono-code text-[0.66rem] transition-colors duration-200 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {stop.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* ── Engineering mindset, demonstrated as a walkable path ── */}
              <motion.div variants={fadeInUp} className="mt-5">
                <MindsetTrace />
              </motion.div>

              {/* ── Compact status readout (preserves the old shell facts) ── */}
              <motion.div
                variants={fadeInUp}
                className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3"
                style={{ background: 'var(--bg-primary)' }}
              >
                <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                  {READOUT.map((row) => (
                    <div key={row.key} className="flex items-baseline gap-2">
                      <dt className="font-mono-code text-[0.58rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {row.key}:
                      </dt>
                      <dd className="font-mono-code text-[0.68rem]" style={{ color: 'var(--accent-teal)' }}>
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.label === 'GitHub' || link.label === 'LinkedIn' ? '_blank' : undefined}
                    rel={link.label === 'GitHub' || link.label === 'LinkedIn' ? 'noopener noreferrer' : undefined}
                    className={`${link.wide ? 'sm:col-span-2' : ''} flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono-code text-xs transition-colors hover:border-[var(--accent-teal)]`}
                    style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--glow-teal)', color: 'var(--accent-teal)' }}>
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                    <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>→</span>
                  </a>
                ))}
              </motion.div>
            </div>
          </GlowCard>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span key={lang.name} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {lang.flag} {lang.name}
                </span>
              ))}
            </div>
            <p className="font-mono-code text-xs" style={{ color: 'var(--text-muted)' }}>
              BCA · Kazi Nazrul University · CGPA 8.14
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}