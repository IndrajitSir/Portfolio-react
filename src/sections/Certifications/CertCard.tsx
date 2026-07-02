import { motion } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import { fadeInUp } from '@/utils/animations'
import { GlowCard } from '@/components/ui'
import type { Certification } from '@/types'

interface CertCardProps {
  cert: Certification
  index: number
}

export default function CertCard({ cert, index }: CertCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      transition={{ delay: index * 0.1 }}
    >
      <GlowCard className="h-full">
        <div className="p-6 flex gap-5 h-full">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{
              background: 'var(--glow-teal)',
              border: '1px solid var(--border-glow)',
            }}
            aria-hidden="true"
          >
            {cert.icon}
          </div>

          <div className="flex flex-col">
            <h3
              className="font-semibold text-sm leading-snug mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {cert.title}
            </h3>
            <p
              className="text-[0.78rem] mb-2 font-medium"
              style={{ color: 'var(--accent-indigo)' }}
            >
              {cert.issuer}
            </p>
            <p
              className="text-[0.82rem] leading-[1.65]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {cert.description}
            </p>
            {cert.url && (
              <a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-3 inline-flex items-center gap-1.5 font-mono-code text-[0.72rem]
                  text-[var(--accent-indigo)] hover:text-[var(--accent-teal)]
                  transition-colors duration-200
                "
              >
                View Certificate
                <FiExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </GlowCard>
    </motion.div>
  )
}
