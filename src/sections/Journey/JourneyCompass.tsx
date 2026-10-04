import { useRef, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { accentColor } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO, SPRING_LAYOUT } from '@/utils/motion'
import { scrollToSection } from '@/utils'
import { journeyChapters } from '@/data'
import { chapterAnchor } from './journeyMeta'

/**
 * The compass — where you are in the journey, available the whole way down.
 *
 * Three things, left to right: which chapter you are in, the eight stations with
 * the line between them filling behind your position, and a count of how many
 * documented milestones sit behind you. That count is the element that
 * accumulates — it is computed from the chapter data, so it is a real tally
 * rather than a progress bar that lies about how far you have read.
 *
 * Interaction is deliberately plain. The stations are buttons: click or Enter
 * jumps, arrow keys move between them, and there is exactly one tab stop so
 * keyboard users are not made to walk eight times to leave the section.
 */

/** Distance below the viewport top a chapter should land at, clearing navbar + compass. */
const CHAPTER_OFFSET = -132

const TOTAL_MILESTONES = journeyChapters.reduce((sum, c) => sum + c.milestones.length, 0)

export default function JourneyCompass({ activeIndex }: { activeIndex: number }) {
  const listRef = useRef<HTMLOListElement>(null)

  const passed = journeyChapters
    .slice(0, activeIndex)
    .reduce((sum, c) => sum + c.milestones.length, 0)

  /** Roving tabindex: one stop for the whole rail, arrows move within it. */
  const focusStation = (index: number) => {
    const clamped = (index + journeyChapters.length) % journeyChapters.length
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-station]')
    buttons?.[clamped]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusStation(activeIndex + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusStation(activeIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        focusStation(0)
        break
      case 'End':
        event.preventDefault()
        focusStation(journeyChapters.length - 1)
        break
      default:
        break
    }
  }

  // Deliberately no `backdrop-blur`: this bar is sticky for the whole section,
  // directly over the animated backdrop, and re-blurring that layer every frame
  // is one of the most expensive things the browser can be asked to do. At 93%
  // opaque the fill already reads as a solid surface.
  return (
    <nav
      aria-label="Journey chapters"
      className="sticky top-[72px] z-20 mt-6 -mx-1 rounded-xl border px-3 py-2 sm:px-4"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--bg-primary) 93%, transparent)',
      }}
    >
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Where you are */}
        <div className="flex min-w-0 shrink items-baseline gap-2">
          <span className="font-mono-code text-[0.62rem]" style={{ color: accentColor[journeyChapters[activeIndex].accent] }}>
            {journeyChapters[activeIndex].index}
          </span>
          <span className="truncate font-display text-[0.9rem] leading-tight" style={{ color: 'var(--text-primary)' }}>
            {journeyChapters[activeIndex].title}
          </span>
        </div>

        {/* The eight stations */}
        <ol
          ref={listRef}
          onKeyDown={onKeyDown}
          className="relative ml-auto hidden flex-1 items-center justify-between gap-1 sm:flex"
        >
          {/* The travelled line. */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
            style={{ background: 'var(--border)' }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-px -translate-y-1/2"
            animate={{ width: `${(activeIndex / (journeyChapters.length - 1)) * 100}%` }}
            transition={{ ...SPRING_LAYOUT, ease: EASE_OUT_EXPO }}
            style={{
              background: `linear-gradient(to right, ${accentColor[journeyChapters[0].accent]}, ${accentColor[journeyChapters[activeIndex].accent]})`,
            }}
          />

          {journeyChapters.map((chapter, i) => {
            const active = i === activeIndex
            const visited = i < activeIndex
            const accent = accentColor[chapter.accent]

            return (
              <li key={chapter.id} className="relative z-10 flex-1">
                <motion.button
                  data-station
                  type="button"
                  tabIndex={active ? 0 : -1}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`Chapter ${chapter.index}: ${chapter.title}`}
                  onClick={() => scrollToSection(chapterAnchor(chapter.id), CHAPTER_OFFSET)}
                  className="mx-auto flex w-full flex-col items-center gap-1.5 outline-offset-4"
                  whileHover={{ y: -2 }}
                  transition={{ duration: DURATION.micro }}
                >
                  <motion.span
                    className="flex h-2.5 w-2.5 items-center justify-center rounded-full border"
                    animate={{
                      backgroundColor: active ? accent : visited ? accent : 'var(--bg-primary)',
                      borderColor: visited || active ? accent : 'var(--border)',
                      scale: active ? 1.45 : 1,
                    }}
                    transition={{ ...SPRING_LAYOUT, ease: EASE_OUT_EXPO }}
                  />
                  <span
                    className="font-mono-code text-[0.55rem] leading-none"
                    style={{ color: active ? accent : 'var(--text-muted)' }}
                  >
                    {chapter.index}
                  </span>
                </motion.button>
              </li>
            )
          })}
        </ol>

        {/* What has accumulated behind you */}
        <span
          className="shrink-0 whitespace-nowrap font-mono-code text-[0.58rem]"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="hidden md:inline">documented milestones · </span>
          {passed}/{TOTAL_MILESTONES}
        </span>
      </div>

      {/* On a phone the eight stations would squeeze the title out, so the bar
          carries a plain fill instead and the stations stay in the chapter text. */}
      <span
        aria-hidden="true"
        className="mt-2 block h-px w-full overflow-hidden rounded-full sm:hidden"
        style={{ background: 'var(--border)' }}
      >
        <motion.span
          className="block h-full"
          animate={{ width: `${((activeIndex + 0.5) / journeyChapters.length) * 100}%` }}
          transition={SPRING_LAYOUT}
          style={{ background: accentColor[journeyChapters[activeIndex].accent] }}
        />
      </span>
    </nav>
  )
}