import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/utils/animations'

interface SectionLabelProps {
  index: string
  label: string
  title: string
  titleAccent?: string   // italic coloured word at the end
  className?: string
}

export default function SectionLabel({
  index,
  label,
  title,
  titleAccent,
  className = '',
}: SectionLabelProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={`mb-14 ${className}`}
    >
      {/* eyebrow */}
      <motion.div
        variants={fadeInUp}
        className="flex items-center gap-3 mb-3"
      >
        <span
          className="block w-6 h-px"
          style={{ background: 'var(--accent-teal)' }}
        />
        <span
          className="font-mono-code text-xs tracking-widest uppercase"
          style={{ color: 'var(--accent-teal)' }}
        >
          {index} — {label}
        </span>
      </motion.div>

      {/* heading */}
      <motion.h2
        variants={fadeInUp}
        className="font-display font-light leading-tight text-[clamp(2rem,4vw,3.2rem)] tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
        {titleAccent && (
          <>
            {' '}
            <em className="not-italic" style={{ color: 'var(--accent-teal)' }}>
              {titleAccent}
            </em>
          </>
        )}
      </motion.h2>
    </motion.div>
  )
}
