import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { journeyChapters } from '@/data'
import { accentColor } from '@/utils/accents'
import { SectionBackground, SectionLabel, ThreadTrack, THREAD_WIDTH } from '@/components/ui'
import { scrollToSection } from '@/utils'
import JourneyChapterCard from './JourneyChapterCard'
import { chapterAnchor } from './journeyMeta'

/**
 * The Journey — the spine of the portfolio.
 *
 * Eight chapters, each one a documented milestone, strung along a single thread
 * that draws itself as you scroll. This is the section that turns a career into
 * a narrative without inventing anything: every claim in it carries a source.
 *
 * Interaction budget, deliberately small:
 *  - scroll draws the thread (the one animated thing),
 *  - the rail at the top jumps between chapters,
 *  - hovering or focusing a chapter lights its station.
 *
 * There is no autoplay, no scroll hijacking and nothing that must be clicked to
 * read the content, so a recruiter skimming with the page still gets the whole
 * story in order.
 */

const count = journeyChapters.length

/** Accent colours for the thread, sampled from the chapters themselves. */
const THREAD_STOPS = journeyChapters.map((c) => accentColor[c.accent])

export default function Journey() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // The thread fills as the visitor moves through the chapters. Offset chosen so
  // it starts filling when the first card reaches the upper third of the
  // viewport, which is where reading actually begins.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 72%', 'end 65%'],
  })

  // Derive the active chapter from progress rather than observing each card:
  // one scroll listener, no layout thrash, and the station always agrees with
  // how much thread has been drawn.
  const applyIndex = useCallback(
    (value: number) => {
      const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)))
      setActiveIndex((prev) => (prev === next ? prev : next))
    },
    [],
  )

  useMotionValueEvent(scrollYProgress, 'change', applyIndex)

  return (
    <section
      id="journey"
      aria-label="Engineering journey"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SectionBackground variant="journey" />

      <div className="max-container section-padding relative z-10">
        <SectionLabel
          index="01"
          label="The journey"
          title="Eight chapters of"
          titleAccent="engineering"
        />

        {/* ── Chapter rail: direct access, no animation required ───── */}
        <ChapterRail />

        {/* ── Thread + chapters ────────────────────────────────────── */}
        <div ref={containerRef} className="relative mt-10">
          {/* The rail lives in a fixed-width gutter so it never fights the
              grid, and only the y axis is stretched (see ThreadTrack). */}
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

          {/* The list carries no padding: stations are positioned from the container's
              left edge, which is exactly where the rail is drawn. */}
          <ol className="space-y-5">
            {journeyChapters.map((chapter, i) => {
              const accent = accentColor[chapter.accent]
              const active = i === activeIndex

              return (
                <li key={chapter.id} className="relative">
                  {/* Station: aligned to the card it belongs to, not to a
                      uniform grid, so it stays put whatever the card height. */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 hidden -translate-x-1/2 lg:block"
                    style={{ left: THREAD_WIDTH / 2 }}
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 bg-[var(--bg-primary)] font-mono-code text-[0.6rem] transition-all duration-500"
                      style={{
                        borderColor: accent,
                        color: accent,
                        boxShadow: active ? `0 0 14px ${accent}55` : 'none',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {chapter.index}
                    </span>
                  </span>

                  {/* The card is offset from the rail; the station above stays anchored to the
                      container's own left edge, which is where the rail is drawn. */}
                  <div className="lg:ml-[72px]">
                    <JourneyChapterCard chapter={chapter} active={active} />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* ── Closing line ─────────────────────────────────────────── */}
        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0 }}
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          className="mt-10 border-t pt-6 font-mono-code text-[0.72rem]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Every chapter above is backed by a public source. Follow any link to check it.
        </motion.p>
      </div>
    </section>
  )
}

/**
 * Horizontal chapter rail.
 *
 * A plain, always-visible list of chapters. It is the recruiter's shortcut:
 * jump straight to the part that matters without scrolling the whole thread.
 * Horizontally scrollable on small screens so it never wraps into a wall.
 */
function ChapterRail() {
  return (
    <nav aria-label="Journey chapters" className="mb-2">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {journeyChapters.map((chapter) => {
          const accent = accentColor[chapter.accent]
          return (
            <li key={chapter.id} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection(chapterAnchor(chapter.id))}
                className="
                  group flex items-center gap-2 rounded-full border px-3 py-1.5
                  font-mono-code text-[0.68rem] transition-all duration-200
                  hover:-translate-y-0.5
                "
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: accent }} aria-hidden="true">
                  {chapter.index}
                </span>
                {chapter.title}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}