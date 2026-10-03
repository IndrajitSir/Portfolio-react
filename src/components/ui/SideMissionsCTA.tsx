import { motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { sideProjects } from '@/data'
import { useRoute, SIDE_MISSIONS_ROUTE } from '@/context/route'
import { DURATION, EASE_OUT_EXPO, REVEAL_VIEWPORT } from '@/utils/motion'
import { accentColor } from '@/utils/accents'

/**
 * Entry point into the dedicated Side Missions experience.
 *
 * This replaces the old always-visible side-project grid: the main Projects
 * section now ends with an intentional doorway instead of a second list. The
 * accent dots preview which missions await, so the control carries information
 * rather than just decorating the section.
 */
export default function SideMissionsCTA() {
  const reduceMotion = useReducedMotion()
  const { navigate } = useRoute()

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
      className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-md sm:p-7"
    >
      <div className="min-w-[240px] flex-1">
        <div className="mb-2 flex items-center gap-3">
          <span className="block h-px w-6" style={{ background: 'var(--accent-indigo)' }} />
          <span
            className="font-mono-code text-[0.68rem] uppercase tracking-widest"
            style={{ color: 'var(--accent-indigo)' }}
          >
            Beyond the main work
          </span>
        </div>
        <h3
          className="font-display text-[clamp(1.3rem,2.4vw,1.8rem)] font-light leading-tight tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Experimental builds &{' '}
          <em className="not-italic" style={{ color: 'var(--accent-indigo)' }}>
            smaller missions
          </em>
        </h3>
        <p className="mt-2 max-w-md text-sm leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
          Graph canvases, a virtual try-on pipeline and a playable game — kept in a dedicated
          space so the main projects stay the focus.
        </p>
      </div>

      <motion.a
        href={`#${SIDE_MISSIONS_ROUTE}`}
        onClick={(e) => {
          e.preventDefault()
          navigate(SIDE_MISSIONS_ROUTE)
        }}
        whileHover={reduceMotion ? undefined : { y: -3 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
        className="
          group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-xl
          border border-[var(--accent-indigo)] bg-[var(--glow-indigo)]
          px-6 py-3.5 font-mono-code text-[0.76rem] font-semibold uppercase tracking-wider
          text-[var(--accent-indigo)] transition-colors duration-300
          hover:bg-[var(--accent-indigo)] hover:text-[var(--bg-primary)]
          focus-visible:bg-[var(--accent-indigo)] focus-visible:text-[var(--bg-primary)]
        "
        aria-label={`Open Side Missions — ${sideProjects.length} experimental projects`}
      >
        {/* Accent dots previewing the missions inside */}
        <span className="relative z-10 flex items-center gap-1.5" aria-hidden="true">
          {sideProjects.map((p) => (
            <span
              key={p.id}
              className="h-1.5 w-1.5 rounded-full transition-colors duration-300 group-hover:bg-[var(--bg-primary)]"
              style={{ background: accentColor[p.accent] }}
            />
          ))}
        </span>
        <span className="relative z-10">Side Missions</span>
        <FiArrowUpRight
          size={16}
          aria-hidden="true"
          className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </motion.a>
    </motion.div>
  )
}
