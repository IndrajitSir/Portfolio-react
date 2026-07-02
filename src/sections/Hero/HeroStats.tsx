import { motion } from 'framer-motion'

const stats = [
  { number: '150+', label: 'DB Models Optimised' },
  { number: '8.14', label: 'CGPA Score' },
  { number: '2+',   label: 'Live Projects' },
]

export default function HeroStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="flex gap-8 flex-wrap mt-10"
    >
      {stats.map((s, i) => (
        <div key={i}>
          <p
            className="font-display text-3xl font-light leading-none"
            style={{ color: 'var(--accent-teal)' }}
          >
            {s.number}
          </p>
          <p
            className="font-mono-code text-[0.68rem] tracking-widest uppercase mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {s.label}
          </p>
        </div>
      ))}
    </motion.div>
  )
}
