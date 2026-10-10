import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, motionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import { accentColor } from '@/utils/accents'
import { clamp } from '@/utils'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import { MaskReveal, Parallax, SlideIn } from '@/components/animations'
import { SectionBackground, SectionLabel, ThreadTrack, THREAD_WIDTH } from '@/components/ui'
import { TOTAL_SYSTEMS, accentFor, careerRoles, roleIndex } from './experienceMeta'
import CareerCompass from './CareerCompass'
import CareerRole from './CareerRole'

/**
 * Work experience — read as one career, not four cards.
 *
 * The section used to be a vertical stack of large cards: each role in its own
 * bordered surface with a padded header, a badge row, a tabbed story, a
 * collapsible responsibility list and a tag strip. It measured 2,647px for four
 * roles, and the responsibilities — the part a recruiter actually reads — were
 * behind a click.
 *
 * It is now the same instrument as the journey, pointed at the working life: one
 * thread down the left, a station per role, and a sticky compass that says which
 * role you are in and how many of the workflows you have traced. Roles are set
 * oldest first, so travelling the section is travelling the career.
 *
 * Scroll is the storytelling mechanism and it is measured, not observed. One
 * `useScroll` spans the role column; a single measurement pass records where each
 * role starts and how tall it is, and from those two facts the section derives
 *
 *   localProgress(i) = (progress × columnHeight − roleTop(i)) / roleHeight(i)
 *
 * which is exact because both offsets use the viewport centre. That one number
 * per role drives the thread, the stations and the stage ribbon inside it, so
 * they can never disagree about which role you are in — and none of it re-renders
 * React, because each role's blocks are derived motion values and only the active
 * index is state.
 */

const count = careerRoles.length

/** Accents sampled from the roles, so the thread reads as a progression. */
const THREAD_STOPS = careerRoles.map((role) => accentColor[accentFor(role.id)])

interface Band {
  top: number
  height: number
}

export default function Experience() {
  const listRef = useRef<HTMLDivElement>(null)
  const roleRefs = useRef<(HTMLElement | null)[]>([])

  const [bands, setBands] = useState<Band[]>([])
  const [columnHeight, setColumnHeight] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  // One motion value per role. Writing to these does not re-render; only the
  // active index does, and only when it actually changes.
  const progressValues = useMemo(() => careerRoles.map(() => motionValue(0)), [])

  // Both ends meet the viewport centre, which is what makes the derived
  // per-role progress below exact.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start center', 'end center'],
  })

  /** One pass, all reads together, whenever the column's layout changes. */
  const measure = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const listTop = list.getBoundingClientRect().top
    const next = roleRefs.current.map((el) => {
      if (!el) return { top: 0, height: 1 }
      const rect = el.getBoundingClientRect()
      return { top: rect.top - listTop, height: Math.max(1, rect.height) }
    })
    setBands(next)
    setColumnHeight(list.getBoundingClientRect().height)
  }, [])

  useLayoutEffect(() => {
    measure()
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    roleRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [measure])

  const apply = useCallback(
    (value: number) => {
      if (!bands.length || !columnHeight) return
      const travelled = value * columnHeight
      let active = 0
      bands.forEach((band, i) => {
        const local = clamp((travelled - band.top) / band.height, 0, 1)
        // Ignore sub-pixel drift so a still scroll does no work at all.
        if (Math.abs(progressValues[i].get() - local) > 0.002) {
          progressValues[i].set(local)
        }
        if (travelled >= band.top) active = i
      })
      setActiveIndex((prev) => (prev === active ? prev : active))
    },
    [bands, columnHeight, progressValues],
  )

  useMotionValueEvent(scrollYProgress, 'change', apply)

  // Recompute once after the first measurement so the section opens in the right
  // state if the visitor arrived part-way down the page.
  useEffect(() => {
    apply(scrollYProgress.get())
  }, [apply, scrollYProgress])

  return (
    <section id="experience" aria-label="Work experience" className="relative">
      {/* The backdrop clips itself. The section deliberately does *not* set
          `overflow-hidden`: that would make it a scroll container and silently
          break the `position: sticky` compass inside it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <SectionBackground variant="rise" />
      </div>

      <div className="max-container section-padding relative z-10">
        <SectionLabel index="04" label="Career" title="Work" titleAccent="experience" className="!mb-9" />

        {/* Slides from the *opposite* side to the journey's lede: the two
            sections share a language but do not say the same sentence twice. */}
        <Parallax distance={14}>
          <SlideIn from="right" distance={30}>
            <p className="mt-4 max-w-[62ch] text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Four roles in order, from a four-week front-end internship to the
              backend foundations a finance-focused NestJS application runs on.
            </p>
          </SlideIn>
        </Parallax>

        <CareerCompass activeIndex={activeIndex} />

        <div ref={listRef} className="relative mt-10 lg:mt-12">
          {/* The thread. Fixed-width SVG stretched only vertically; the stations
              are DOM, positioned from this container's own left edge, so they
              cannot drift off the rail whatever the role height. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden lg:block"
            style={{ width: THREAD_WIDTH }}
          >
            <ThreadTrack
              progress={scrollYProgress}
              gradientId="experience"
              stops={THREAD_STOPS}
              className="h-full"
            />
          </div>

          <ol className="space-y-9 lg:space-y-11">
            {careerRoles.map((role, i) => {
              const accent = accentColor[accentFor(role.id)]
              return (
                <li
                  key={role.id}
                  className="relative"
                  ref={(el) => {
                    roleRefs.current[i] = el
                  }}
                >
                  {/* Station: anchored to the column's own left edge, which is
                      exactly where the thread is drawn, so it sits outside the
                      indented text. */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 hidden -translate-x-1/2 lg:block"
                    style={{ left: THREAD_WIDTH / 2 }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[var(--bg-secondary)] font-mono-code text-[0.6rem] transition-all duration-500"
                      style={{
                        borderColor: accent,
                        color: accent,
                        boxShadow: i === activeIndex ? `0 0 16px ${accent}66` : 'none',
                        transform: i === activeIndex ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >
                      {roleIndex(i)}
                    </span>
                  </span>

                  {/* The role itself, indented clear of the rail. */}
                  <div className="lg:ml-[72px]">
                    <CareerRole
                      experience={role}
                      index={i}
                      active={i === activeIndex}
                      progress={progressValues[i]}
                    />
                  </div>
                </li>
              )
            })}
          </ol>

          {/* ── Conclusion ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
            className="mt-12 border-t pt-5"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* The close drifts on its own layer, so the section settles beneath
                it rather than the whole block arriving at once. */}
            <Parallax distance={22}>
              <MaskReveal className="max-w-[60ch] font-display text-[clamp(1rem,1.7vw,1.2rem)] font-light leading-[1.45]">
                <span style={{ color: 'var(--text-primary)' }}>
                  {count} roles, from a four-week front-end internship to an
                  authorization engine running in production.
                </span>
              </MaskReveal>
              <p className="mt-2 font-mono-code text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
                {TOTAL_SYSTEMS} documented workflows traced above · every
                responsibility and period kept as documented
              </p>
            </Parallax>
          </motion.div>
        </div>
      </div>
    </section>
  )
}