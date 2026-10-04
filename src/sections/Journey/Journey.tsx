import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, motionValue, useMotionValueEvent, useScroll } from 'framer-motion'
import { journeyChapters } from '@/data'
import { accentColor } from '@/utils/accents'
import { useMediaQuery } from '@/hooks'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import { clamp } from '@/utils'
import { SectionBackground, SectionLabel, ThreadTrack, THREAD_WIDTH } from '@/components/ui'
import JourneyCompass from './JourneyCompass'
import JourneyStage from './JourneyStage'
import JourneyChapterBlock from './JourneyChapter'

/**
 * The Journey — the spine of the portfolio.
 *
 * The shape is a stage and a column. On a wide screen one stage is pinned beside
 * the text and it changes as you read: eight chapters, eight pictures, one at a
 * time. Below `lg` there is no pinned column at all; every chapter carries its
 * own stage inline, directly above the text it belongs to, because a pinned
 * viewport is the wrong tool for a thumb.
 *
 * Scroll is the storytelling mechanism, and it is measured rather than
 * observed. One `useScroll` spans the chapter column, and a single measurement
 * pass records where each chapter starts and how tall it is. From those two
 * facts the section derives:
 *
 *   localProgress(i) = (progress × columnHeight − chapterTop(i)) / chapterHeight(i)
 *
 * which is exact because both scroll offsets use the viewport centre: the
 * "where am I reading" line cancels out of the arithmetic. That one number per
 * chapter drives the stage, the compass and the station rail, so they can never
 * disagree about which chapter you are in. It also costs one scroll listener and
 * no layout reads during scrolling.
 *
 * Reduced motion is handled at two levels. The stage pins its progress value at
 * 1, so every picture renders finished; the section drops its entrance
 * animations. Nothing about the content changes.
 */

const count = journeyChapters.length

/** Accents sampled from the chapters, for the thread gradient. */
const THREAD_STOPS = journeyChapters.map((c) => accentColor[c.accent])

interface Band {
  top: number
  height: number
}

export default function Journey() {
  const listRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useRef<(HTMLElement | null)[]>([])

  const [bands, setBands] = useState<Band[]>([])
  const [columnHeight, setColumnHeight] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  // One motion value per chapter. Writing to these does not re-render; only the
  // active index does, and only when it actually changes.
  const progressValues = useMemo(
    () => journeyChapters.map(() => motionValue(0)),
    [],
  )

  const isWide = useMediaQuery('(min-width: 1024px)')
  const isSmall = useMediaQuery('(max-width: 640px)')

  // Both ends meet the viewport centre, which is what makes the derived
  // per-chapter progress below exact.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start center', 'end center'],
  })

  /** One pass, all reads together, whenever the column's layout changes. */
  const measure = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const listTop = list.getBoundingClientRect().top
    const next = chapterRefs.current.map((el) => {
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
    // Chapter heights move when a stage's controls wrap, so watch them too.
    chapterRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [measure])

  // Derive every chapter's progress from the single scroll value.
  const apply = useCallback(
    (value: number) => {
      if (!bands.length || !columnHeight) return
      const travelled = value * columnHeight
      let active = 0
      bands.forEach((band, i) => {
        const local = clamp((travelled - band.top) / band.height, 0, 1)
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

  const activeChapter = journeyChapters[activeIndex]

  return (
    <section
      id="journey"
      aria-label="Engineering journey"
      className="relative"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* The backdrop clips itself. The section deliberately does *not* set
          `overflow-hidden`: that would make it a scroll container and silently
          break every `position: sticky` inside it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <SectionBackground variant="journey" />
      </div>

      <div className="max-container section-padding relative z-10">
        <SectionLabel
          index="01"
          label="The journey"
          title="Eight chapters of"
          titleAccent="engineering"
        />

        <p className="mt-4 max-w-[54ch] text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Read it in order, or jump to the chapter you care about. Every milestone
          links to the source that documents it.
        </p>

        <JourneyCompass activeIndex={activeIndex} />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          {/* ── The stage, pinned beside the text on a wide screen ──── */}
          <div className="hidden lg:block">
            <div className="sticky top-[124px]">
              <JourneyStage
                chapter={activeChapter}
                progress={progressValues[activeIndex]}
                travelled={activeIndex}
                compact={false}
              />
              <p
                className="mt-3 text-[0.72rem] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                The stage follows the chapter you are reading. It illustrates the
                milestones; it never replaces them.
              </p>
            </div>
          </div>

          {/* ── The chapters ──────────────────────────────────────── */}
          <div ref={listRef} className="relative">
            {/* The thread. Fixed-width SVG stretched only vertically; the
                stations are DOM, positioned from this container's own left edge,
                so they cannot drift off the rail whatever the chapter height. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 hidden lg:block"
              style={{ width: THREAD_WIDTH }}
            >
              <ThreadTrack
                progress={scrollYProgress}
                gradientId="journey"
                stops={THREAD_STOPS}
                className="h-full"
              />
            </div>

            <ol className="space-y-16 lg:space-y-28">
              {journeyChapters.map((chapter, i) => (
                <li
                  key={chapter.id}
                  className="relative"
                  ref={(el) => {
                    chapterRefs.current[i] = el
                  }}
                >
                  {/* Station: anchored to the list's own left edge, which is
                      exactly where the thread is drawn. It lives outside the
                      indented column so the text never runs underneath it. */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 hidden -translate-x-1/2 lg:block"
                    style={{ left: THREAD_WIDTH / 2 }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[var(--bg-primary)] font-mono-code text-[0.6rem] transition-all duration-500"
                      style={{
                        borderColor: accentColor[chapter.accent],
                        color: accentColor[chapter.accent],
                        boxShadow: i === activeIndex ? `0 0 16px ${accentColor[chapter.accent]}66` : 'none',
                        transform: i === activeIndex ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >
                      {chapter.index}
                    </span>
                  </span>

                  {/* The chapter itself is indented clear of the rail. */}
                  <div className="lg:ml-[72px]">
                    <JourneyChapterBlock
                      chapter={chapter}
                      active={i === activeIndex}
                      travelled={i}
                      showStage={!isWide}
                      compactStage={isSmall}
                    />
                  </div>
                </li>
              ))}
            </ol>

            {/* ── Conclusion ────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
              className="mt-16 border-t pt-6"
              style={{ borderColor: 'var(--border)' }}
            >
              <p
                className="max-w-[58ch] font-display text-[clamp(1.05rem,2vw,1.35rem)] font-light leading-[1.5]"
                style={{ color: 'var(--text-primary)' }}
              >
                {count} chapters, from a Java badge on HackerRank to two packages
                published for other developers.
              </p>
              <p className="mt-3 font-mono-code text-[0.72rem]" style={{ color: 'var(--text-muted)' }}>
                Every chapter above is backed by a public source. Follow any link to check it.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}