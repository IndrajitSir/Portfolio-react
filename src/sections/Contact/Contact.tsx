import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiGithub } from 'react-icons/fi'
import { staggerContainer, fadeInLeft, fadeInRight } from '@/utils/animations'
import { SectionLabel, GlowCard } from '@/components/ui'
import { personalInfo } from '@/data'
import ContactForm from './ContactForm'

const socialLinks = [
  {
    icon: <FiMail size={16} />,
    label: 'Email',
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
  },
  {
    icon: <FiPhone size={16} />,
    label: 'Phone',
    value: personalInfo.phone,
    href: `tel:${personalInfo.phone.replace(/\s/g, '')}`,
  },
  {
    icon: <FiGithub size={16} />,
    label: 'GitHub',
    value: 'github.com/IndrajitSir',
    href: personalInfo.github,
    external: true,
  },
]

export default function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact section"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-container section-padding">
        <SectionLabel
          index="07"
          label="Connect"
          title="Let's build something"
          titleAccent="together"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
        >
          {/* Left */}
          <motion.div variants={fadeInLeft} className="space-y-6">
            <p className="text-[1.05rem] leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
              I'm actively seeking backend development roles, open-source collaborations,
              and interesting engineering problems to solve. If you have an idea or
              opportunity — I'd love to hear from you.
            </p>

            <div className="space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="group block"
                  aria-label={`Contact via ${link.label}`}
                >
                  <GlowCard>
                    <div className="flex items-center gap-4 p-4 group-hover:text-[var(--accent-teal)] transition-colors duration-200">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'var(--glow-teal)',
                          border: '1px solid var(--border-glow)',
                          color: 'var(--accent-teal)',
                        }}
                      >
                        {link.icon}
                      </div>
                      <div>
                        <p
                          className="font-mono-code text-[0.68rem] uppercase tracking-widest"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {link.label}
                        </p>
                        <p
                          className="text-sm font-medium mt-0.5 group-hover:text-[var(--accent-teal)] transition-colors duration-200"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {link.value}
                        </p>
                      </div>
                      <span className="ml-auto text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] transition-colors duration-200">
                        →
                      </span>
                    </div>
                  </GlowCard>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div variants={fadeInRight}>
            <GlowCard>
              <div className="p-7">
                <ContactForm />
              </div>
            </GlowCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
