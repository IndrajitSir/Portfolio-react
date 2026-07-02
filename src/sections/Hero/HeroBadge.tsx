import { motion } from 'framer-motion'

export default function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="
        inline-flex items-center gap-2 mb-7
        px-4 py-1.5 rounded-full
        border border-[var(--border-glow)] bg-[var(--glow-teal)]
        font-mono-code text-[0.72rem] tracking-wider uppercase
        text-[var(--accent-teal)]
      "
      aria-label="Available for new opportunities"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)] animate-pulse"
        aria-hidden="true"
      />
      Available for opportunities
    </motion.div>
  )
}
