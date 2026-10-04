import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { projects } from '@/data'
import { SectionBackground, SideMissionsCTA, CaseStudyDialog } from '@/components/ui'
import { accentKey } from './accent'
import type { Project } from '@/types'
import ProjectCard from './ProjectCard'

const AUTOPLAY_MS = 6000

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 90 : -90,
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.985,
  }),
}

const slideTransition = {
  duration: 0.45,
  ease: [0.4, 0, 0.2, 1] as const,
}

export default function Projects() {
  const count = projects.length
  const [[activeIndex, direction], setIndex] = useState<[number, number]>([0, 0])
  const [paused, setPaused] = useState(false)

  /**
   * The case study being read. It lives here rather than inside the card so the
   * panel outlives the slide it was opened from, and so opening one does not
   * resize anything: the card keeps the height it already had.
   */
  const [caseStudy, setCaseStudy] = useState<{ project: Project; index: number } | null>(null)
  // The control that opened the panel, so focus can go back where it came from.
  const [caseStudyTrigger, setCaseStudyTrigger] = useState<HTMLButtonElement | null>(null)

  const openCaseStudy = useCallback((project: Project, trigger: HTMLButtonElement) => {
    setCaseStudyTrigger(trigger)
    setCaseStudy({ project, index: projects.indexOf(project) })
  }, [])

  const closeCaseStudy = useCallback(() => setCaseStudy(null), [])

  const paginate = useCallback(
    (dir: number) => {
      setIndex(([i]) => [(i + dir + count) % count, dir])
    },
    [count],
  )

  const goTo = useCallback((target: number) => {
    setIndex(([i]) => {
      const dir = target > i ? 1 : target < i ? -1 : 0
      return [target, dir]
    })
  }, [])

  // Autoplay (pauses on hover / focus, and for as long as a case study is open —
  // the carousel must not change the slide out from under someone reading).
  useEffect(() => {
    if (paused || caseStudy) return
    const id = window.setInterval(() => paginate(1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, caseStudy, paginate])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      paginate(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      paginate(1)
    }
  }

  return (
    <section
      id="projects"
      aria-label="Projects and open source section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SectionBackground variant="packages" />
      <div className="max-container section-padding relative z-10">
        {/* ── Header + controls ─────────────────────────────── */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-6 h-px" style={{ background: 'var(--accent-teal)' }} />
              <span
                className="font-mono-code text-xs tracking-widest uppercase"
                style={{ color: 'var(--accent-teal)' }}
              >
                05 — Work
              </span>
            </div>
            <h2
              className="font-display font-light leading-tight text-[clamp(2rem,4vw,3.2rem)] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Projects &{' '}
              <em className="not-italic" style={{ color: 'var(--accent-teal)' }}>
                Open Source
              </em>
            </h2>
          </div>

          {/* Counter + arrows */}
          <div className="flex items-center gap-5">
            <span className="font-mono-code text-sm" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-teal)' }}>
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              {' / '}
              {String(count).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous project"
                className="
                  w-11 h-11 rounded-full flex items-center justify-center
                  border border-[var(--border)] bg-[var(--surface)]
                  text-[var(--text-secondary)]
                  hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                  transition-all duration-200
                "
              >
                <FiArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next project"
                className="
                  w-11 h-11 rounded-full flex items-center justify-center
                  border border-[var(--border)] bg-[var(--surface)]
                  text-[var(--text-secondary)]
                  hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                  transition-all duration-200
                "
              >
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Carousel ──────────────────────────────────────── */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Projects and open source"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="outline-none"
        >
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={projects[activeIndex].id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) paginate(1)
                  else if (info.offset.x > 70) paginate(-1)
                }}
              >
                <ProjectCard
                  project={projects[activeIndex]}
                  index={activeIndex}
                  onOpenCaseStudy={openCaseStudy}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center items-center gap-2.5 mt-8">
            {projects.map((project, i) => (
              <button
                key={project.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to project ${i + 1}: ${project.title}`}
                aria-current={i === activeIndex}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${i === activeIndex
                    ? 'w-8 bg-[var(--accent-teal)]'
                    : 'w-3 bg-[var(--border)] hover:bg-[var(--text-muted)]'}
                `}
              />
            ))}
          </div>
        </div>

        {/* ── Case study ──────────────────────────────────────
            Outside the carousel on purpose: the panel is portalled to the
            body, so it sits above the section and is never scaled or clipped
            by the slide's transform. */}
        <CaseStudyDialog
          project={caseStudy?.project ?? null}
          accent={caseStudy ? accentKey(caseStudy.project, caseStudy.index) : 'teal'}
          onClose={closeCaseStudy}
          returnFocusTo={caseStudyTrigger}
        />

        {/* ── Side Missions doorway ─────────────────────────── */}
        {/* Side projects deliberately no longer render inline: the collection
            now lives behind a dedicated route reached from this control. */}
        <SideMissionsCTA />
      </div>
    </section>
  )
}
