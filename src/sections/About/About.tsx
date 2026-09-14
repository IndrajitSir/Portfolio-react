import { motion } from 'framer-motion'
import { FiGithub, FiMail, FiMapPin } from 'react-icons/fi'
import { personalInfo, languages } from '@/data'
import { staggerContainer, fadeInUp } from '@/utils/animations'
import { SectionLabel, GlowCard, SectionBackground } from '@/components/ui'

const contactLinks = [
  { icon: <FiMail size={15} />, label: personalInfo.email, href: `mailto:${personalInfo.email}`, wide: true },
  { icon: <span className="font-bold text-xs">&lt;&gt;</span>, label: 'GitHub', href: personalInfo.github },
  { icon: <span className="font-bold text-xs">⌘</span>, label: 'LinkedIn', href: 'https://linkedin.com/in/indrajit-mandal-34a9842a5' },
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
        <SectionLabel index="01" label="Background" title="The person behind the" titleAccent="code" />

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
                  Currently engineering at <strong className="text-[var(--text-primary)]">Distronix</strong>, specializing in robust backend optimization, REST API architectures, and high-throughput relational data workflows.
                </p>
                <p>
                  Prior to native deep-stack software development, trained as an <strong className="text-[var(--text-primary)]">SAP Officer Trainee at Jai Balaji Industries</strong> (SAP S/4HANA), gaining rare operational domain insight into order-to-cash enterprise lifecycles.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-5 rounded-xl p-4 sm:p-5" style={{ background: 'var(--bg-primary)' }}>
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono-code text-[0.6rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    runtime_specs.sh
                  </span>
                </div>
                <pre className="overflow-x-auto font-mono-code text-xs leading-[2]" style={{ color: 'var(--accent-teal)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>$ currently: </span>building @ Distronix, IN{'\n'}
                  <span style={{ color: 'var(--text-muted)' }}>$ focus: </span>Distributed APIs &amp; RBAC Security{'\n'}
                  <span style={{ color: 'var(--text-muted)' }}>$ status: </span>Open to high-impact software roles
                </pre>
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