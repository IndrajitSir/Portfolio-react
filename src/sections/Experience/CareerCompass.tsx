import { useRef, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { accentColor } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO, SPRING_LAYOUT } from '@/utils/motion'
import { scrollToSection } from '@/utils'
import { TOTAL_SYSTEMS, accentFor, careerRoles, roleAnchor, roleIndex } from './experienceMeta'

/**
 * The career compass — where you are in the working life, for as long as you are
 * inside the section.
 *
 * The same instrument as the journey's chapter rail, pointed at roles instead:
 * which role you are reading, a station per milestone with the line between them
 * filling behind your position, and a tally of the systems you have already
 * traced. The tally is computed from the role data, so it is a real count of
 * what is behind you rather than a progress bar that guesses how far you read.
 *
 * Interaction is deliberately plain. Stations are buttons: click or Enter jumps,
 * arrows move between them, and there is exactly one tab stop, so a keyboard
 * user is not made to walk four times to leave the section.
 */

/** Distance below the viewport top a role should land at, clearing nav + compass. */
const ROLE_OFFSET = -132

const systemsIn = (index: number): number =>
  careerRoles
    .slice(0, index)
    .reduce((sum, role) => sum + (role.story?.flows.length ?? 0), 0)

export default function CareerCompass({ activeIndex }: { activeIndex: number }) {
  const listRef = useRef<HTMLOListElement>(null)
  const role = careerRoles[activeIndex]

  /** Roving tabindex: one stop for the whole rail, arrows move within it. */
  const focusStation = (index: number) => {
    const clamped = (index + careerRoles.length) % careerRoles.length
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
        focusStation(careerRoles.length - 1)
        break
      default:
        break
    }
  }

  // Deliberately no `backdrop-blur`, for the same reason as the journey compass:
  // this bar is sticky directly over the animated backdrop, and re-blurring that
  // layer every frame is one of the most expensive things a browser can be asked
  // to do. At 93% opaque the fill already reads as a surface.
  return (
    <nav
      aria-label="Career roles"
      className="sticky top-[72px] z-20 mt-6 -mx-1 rounded-xl border px-3 py-2 sm:px-4"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--bg-secondary) 93%, transparent)',
      }}
    >
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Where you are */}
        <div className="flex min-w-0 shrink items-baseline gap-2">
          <span
            className="font-mono-code text-[0.62rem]"
            style={{ color: accentColor[accentFor(role.id)] }}
          >
            {roleIndex(activeIndex)}
          </span>
          <span
            className="truncate font-display text-[0.9rem] leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {role.role}
          </span>
        </div>

        {/* The stations */}
        <ol
          ref={listRef}
          onKeyDown={onKeyDown}
          className="relative ml-auto hidden flex-1 items-center justify-between gap-1 sm:flex"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
            style={{ background: 'var(--border)' }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-px -translate-y-1/2"
            animate={{
              width: `${(activeIndex / (careerRoles.length - 1)) * 100}%`,
            }}
            transition={{ ...SPRING_LAYOUT, ease: EASE_OUT_EXPO }}
            style={{
              background: `linear-gradient(to right, ${accentColor[accentFor(careerRoles[0].id)]}, ${accentColor[accentFor(role.id)]})`,
            }}
          />

          {careerRoles.map((entry, i) => {
            const active = i === activeIndex
            const passed = i < activeIndex
            const accent = accentColor[accentFor(entry.id)]

            return (
              <li key={entry.id} className="relative z-10 flex-1">
                <motion.button
                  data-station
                  type="button"
                  tabIndex={active ? 0 : -1}
                  aria-current={active ? 'true' : undefined}
                  aria-label={`${roleIndex(i)}: ${entry.role} at ${entry.company}`}
                  onClick={() => scrollToSection(roleAnchor(entry.id), ROLE_OFFSET)}
                  className="mx-auto flex w-full flex-col items-center gap-1.5 outline-offset-4"
                  whileHover={{ y: -2 }}
                  transition={{ duration: DURATION.micro }}
                >
                  <motion.span
                    className="flex h-2.5 w-2.5 items-center justify-center rounded-full border"
                    animate={{
                      backgroundColor: active || passed ? accent : 'var(--bg-secondary)',
                      borderColor: passed || active ? accent : 'var(--border)',
                      scale: active ? 1.45 : 1,
                    }}
                    transition={{ ...SPRING_LAYOUT, ease: EASE_OUT_EXPO }}
                  />
                  <span
                    className="font-mono-code text-[0.55rem] leading-none"
                    style={{ color: active ? accent : 'var(--text-muted)' }}
                  >
                    {roleIndex(i)}
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
          <span className="hidden md:inline">systems traced · </span>
          {systemsIn(activeIndex)}/{TOTAL_SYSTEMS}
        </span>
      </div>

      {/* On a phone four stations would squeeze the role title out, so the bar
          carries a plain fill instead and the stations stay in the milestone. */}
      <span
        aria-hidden="true"
        className="mt-2 block h-px w-full overflow-hidden rounded-full sm:hidden"
        style={{ background: 'var(--border)' }}
      >
        <motion.span
          className="block h-full"
          animate={{ width: `${((activeIndex + 0.5) / careerRoles.length) * 100}%` }}
          transition={SPRING_LAYOUT}
          style={{ background: accentColor[accentFor(role.id)] }}
        />
      </span>
    </nav>
  )
}