import { motion } from 'framer-motion'
import { FiGithub, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { personalInfo, languages } from '@/data'
import { staggerContainer, fadeInLeft, fadeInRight, fadeInUp } from '@/utils/animations'
import { SectionLabel, GlowCard, SectionBackground } from '@/components/ui'

const infoRows = [
  { icon: <FiMail size={16} />, key: 'Email', value: personalInfo.email, href: `mailto:${personalInfo.email}` },
  { icon: <FiPhone size={16} />, key: 'Phone', value: personalInfo.phone, href: `tel:${personalInfo.phone.replace(/\s/g, '')}` },
  { icon: <FiGithub size={16} />, key: 'GitHub', value: 'github.com/IndrajitSir', href: personalInfo.github },
  { icon: <span className="font-bold">in</span>, key: 'LinkedIn', value: 'linkedin.com/in/indrajitmandal', href: 'https://linkedin.com/in/indrajit-mandal-34a9842a5' },
  { icon: <FiMapPin size={16} />, key: 'Location', value: personalInfo.location, href: undefined },
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
        <SectionLabel
          index="01"
          label="Background"
          title="The person behind the"
          titleAccent="code"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
        >
          {/* Left: Bio */}
          <motion.div variants={fadeInLeft} className="space-y-5">
            <p className="text-[1.05rem] leading-[1.85]" style={{ color: 'var(--text-secondary)' }}>
              I'm a Junior Software Developer currently working at{' '}
              <strong className="text-[var(--text-primary)] font-semibold">Distronix</strong>,
              where I specialise in backend optimisation, API development, and resolving complex
              relational model issues. My foundation is built on real-world engineering
              challenges — not just theory.
            </p>
            <p className="text-[1.05rem] leading-[1.85]" style={{ color: 'var(--text-secondary)' }}>
              Before software development, I spent time as a SAP Officer Trainee at Jai Balaji
              Industries, supporting end-to-end order-to-cash operations in SAP S/4HANA. This
              cross-domain experience gives me a business-aware perspective on every technical
              decision I make.
            </p>
            <p className="text-[1.05rem] leading-[1.85]" style={{ color: 'var(--text-secondary)' }}>
              I'm driven by clean architecture, measurable performance improvements, and the
              satisfaction of systems that just{' '}
              <em className="text-[var(--accent-teal)] not-italic font-medium">work</em>.
            </p>

            {/* Terminal block */}
            <GlowCard className="mt-6">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <pre
                  className="font-mono-code text-sm leading-[1.9]"
                  style={{ color: 'var(--accent-teal)' }}
                >
                  {`$ currently → building @ Distronix.in
$ location  → West Bengal, India 🇮🇳
$ status    → open to new roles & collabs`}
                </pre>
              </div>
            </GlowCard>

            {/* Languages */}
            <div className="mt-4">
              <p
                className="font-mono-code text-[0.7rem] uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Languages Spoken
              </p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang.name}
                    className="px-3 py-1.5 rounded-full border border-[var(--border)] text-sm"
                    style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
                  >
                    {lang.flag} {lang.name} · <span style={{ color: 'var(--text-muted)' }}>{lang.level}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Info cards */}
          <motion.div variants={fadeInRight} className="space-y-3">
            {infoRows.map((row, i) => (
              <motion.div
                key={row.key}
                variants={fadeInUp}
                custom={i}
              >
                <GlowCard>
                  <div className="flex items-center gap-4 p-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'var(--glow-teal)',
                        border: '1px solid var(--border-glow)',
                        color: 'var(--accent-teal)',
                      }}
                    >
                      {row.icon}
                    </div>
                    <div>
                      <p
                        className="font-mono-code text-[0.68rem] uppercase tracking-widest mb-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {row.key}
                      </p>
                      {row.href ? (
                        <a
                          href={row.href}
                          target={row.key === 'GitHub' ? '_blank' : undefined}
                          rel={row.key === 'GitHub' ? 'noopener noreferrer' : undefined}
                          className="text-sm transition-colors duration-200 hover:text-[var(--accent-teal)]"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {row.value}
                        </p>
                      )}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}

            {/* Education teaser */}
            <GlowCard className="mt-2">
              <div className="p-5 flex items-center gap-4">
                <span className="text-2xl" aria-hidden="true">🎓</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Bachelor in Computer Application
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Kazi Nazrul University · CGPA 8.14
                  </p>
                </div>
                <span
                  className="ml-auto font-mono-code text-[0.75rem] px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--glow-teal)',
                    border: '1px solid var(--border-glow)',
                    color: 'var(--accent-teal)',
                  }}
                >
                  2022–2025
                </span>
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
