import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { FiMail, FiMapPin } from 'react-icons/fi'
import { personalInfo, languages, journeyChapters } from '@/data'
import { staggerContainer, fadeInUp, withDelay } from '@/utils/animations'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import { SectionLabel, GlowCard, SectionBackground, MindsetTrace } from '@/components/ui'
import AboutDepth from './AboutDepth'
import RevealWords from './RevealWords'
import TerminalLauncher from '@/components/terminal/TerminalLauncher'
import CodePanelLauncher from '@/components/ui/CodePanelLauncher'

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
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  // The section's own travel through the viewport. Used for the entry and exit:
  // the block drifts a little as the section passes and softens at both ends, so
  // it arrives and leaves instead of being switched on. It never fully fades —
  // a deep link that lands mid-page must still find readable text.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const blockY = useTransform(scrollYProgress, [0, 1], [24, -24])
  const blockOpacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0.4, 1, 1, 0.4])

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-label="About section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <SectionBackground variant="code" />
      {/* Depth planes behind everything: the section gets a room, not a panel. */}
      <AboutDepth targetRef={sectionRef} />
      <div className="max-container section-padding relative z-10">
        <SectionLabel index="02" label="Background" title="The person behind the" titleAccent="code" />

        <motion.div
          style={{ y: reduceMotion ? 0 : blockY, opacity: reduceMotion ? 1 : blockOpacity }}
        >
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
                  {/* A slow orbit around the portrait. It is the one piece of
                      ambient motion in the section, and it stops dead under
                      `prefers-reduced-motion` via the shared CSS block. */}
                  <span
                    aria-hidden="true"
                    className="about-orbit absolute -inset-[9px] rounded-[18px] border border-dashed"
                    style={{ borderColor: 'var(--accent-teal)', opacity: 0.32 }}
                  />
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
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <TerminalLauncher />
                  <CodePanelLauncher />
                </div>
              </motion.div>

              {/* ── The biography, revealed word by word ─────────────── */}
              {/* Same two paragraphs, same emphasis. The words ride up out of
                  a mask on a stagger so the paragraph typesets itself into
                  place instead of fading in as a block. */}
              <motion.div variants={fadeInUp} className="mt-5 space-y-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                <p>
                  <RevealWords>
                    Currently engineering at <strong className="text-[var(--text-primary)]">Distronix</strong>, building backend foundations for a finance-focused NestJS application — an authorization system, a secure file-handling service, and an indexing pass across 150+ database models.
                  </RevealWords>
                </p>
                <p>
                  <RevealWords>
                    Before that, <strong className="text-[var(--text-primary)]">SAP Officer Trainee at Jai Balaji Industries</strong> (SAP S/4HANA, SD module), working the order-to-cash cycle. Before that, internships at <strong className="text-[var(--text-primary)]">SystemTron</strong> and <strong className="text-[var(--text-primary)]">Ardent Computech</strong> building front-end and full-stack systems.
                  </RevealWords>
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
                <ul className="relative flex flex-wrap items-center gap-x-2 gap-y-2">
                  {ARC.map((stop, i) => (
                    <motion.li
                      key={stop.label}
                      variants={withDelay(fadeInUp, 0.35 + i * 0.09)}
                      className="flex items-center gap-2"
                    >
                      {i > 0 && (
                        <motion.span
                          aria-hidden="true"
                          variants={withDelay(fadeInUp, 0.3 + i * 0.09)}
                          style={{ color: 'var(--text-muted)' }}
                        >
                          →
                        </motion.span>
                      )}
                      <motion.a
                        href={stop.href}
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        transition={{ duration: DURATION.micro, ease: EASE_OUT_EXPO }}
                        className="rounded-full border px-2.5 py-1 font-mono-code text-[0.66rem] transition-colors duration-200 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {stop.label}
                      </motion.a>
                    </motion.li>
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
                {contactLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    variants={withDelay(fadeInUp, 0.45 + i * 0.07)}
                    href={link.href}
                    target={link.label === 'GitHub' || link.label === 'LinkedIn' ? '_blank' : undefined}
                    rel={link.label === 'GitHub' || link.label === 'LinkedIn' ? 'noopener noreferrer' : undefined}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    transition={{ duration: DURATION.micro, ease: EASE_OUT_EXPO }}
                    className={`${link.wide ? 'sm:col-span-2' : ''} flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono-code text-xs transition-colors hover:border-[var(--accent-teal)]`}
                    style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--glow-teal)', color: 'var(--accent-teal)' }}>
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                    <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>→</span>
                  </motion.a>
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
        </motion.div>
      </div>
    </section>
  )
}