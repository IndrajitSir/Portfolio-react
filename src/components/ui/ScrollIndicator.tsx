import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { scrollToSection } from '@/utils'

interface ScrollIndicatorProps {
  /** Section to scroll to when activated. */
  targetId: string
  label?: string
}

/**
 * A scroll cue whose vertical line extends and retracts with page progress,
 * with a small light packet that runs down it. Clicking scrolls to the target.
 */
export default function ScrollIndicator({
  targetId,
  label = 'Scroll to explore',
}: ScrollIndicatorProps) {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Fade the cue out as the user leaves the hero.
  const opacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const draw = useSpring(useTransform(scrollYProgress, [0, 0.12], [0, 1]), {
    stiffness: 140,
    damping: 30,
  })

  return (
    <motion.button
      type="button"
      onClick={() => scrollToSection(targetId)}
      style={{ opacity }}
      className="
        group absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2
        flex-col items-center gap-2 md:flex
      "
      aria-label={`${label} — go to ${targetId} section`}
    >
      <span
        className="font-mono-code text-[0.62rem] uppercase tracking-[0.25em] transition-colors duration-200 group-hover:text-[var(--accent-teal)]"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>

      <span
        className="relative block h-12 w-px overflow-hidden"
        style={{ background: 'var(--border)' }}
        aria-hidden="true"
      >
        <motion.span
          className="absolute inset-x-0 top-0 block h-full origin-top"
          style={{
            scaleY: draw,
            background: 'linear-gradient(to bottom, var(--accent-teal), transparent)',
          }}
        />
        {!reduceMotion && (
          <motion.span
            className="absolute left-1/2 h-3 w-px -translate-x-1/2"
            style={{ background: 'var(--accent-teal)' }}
            animate={{ top: ['-12%', '100%'] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </span>
    </motion.button>
  )
}
