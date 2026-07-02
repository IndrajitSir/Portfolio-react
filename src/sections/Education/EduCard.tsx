import { motion } from 'framer-motion'
import { fadeInUp } from '@/utils/animations'
import type { Education } from '@/types'

interface EduCardProps {
  edu: Education
  index: number
}

export default function EduCard({ edu, index }: EduCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      transition={{ delay: index * 0.1 }}
      className="
        relative p-6 rounded-2xl
        border border-[var(--border)] bg-[var(--surface)]
        group overflow-hidden
        hover:border-[var(--border-glow)] hover:-translate-y-1
        transition-all duration-300
      "
    >
      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400"
        style={{ background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))' }}
        aria-hidden="true"
      />

      <span className="text-3xl mb-4 block" aria-hidden="true">{edu.icon}</span>
      <h3 className="font-semibold text-sm leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
        {edu.degree}
      </h3>
      <p className="text-[0.8rem] mb-0.5" style={{ color: 'var(--text-secondary)' }}>
        {edu.institution}
      </p>
      {edu.university && (
        <p className="text-[0.75rem] mb-3" style={{ color: 'var(--text-muted)' }}>
          {edu.university}
        </p>
      )}
      <p
        className="font-mono-code text-[0.68rem] tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        {edu.period}
      </p>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.78rem] font-mono-code font-semibold"
        style={{
          background: 'var(--glow-teal)',
          border: '1px solid var(--border-glow)',
          color: 'var(--accent-teal)',
        }}
      >
        {edu.scoreType === 'cgpa' ? '⭐' : '📊'} {edu.score}
      </div>
    </motion.div>
  )
}
