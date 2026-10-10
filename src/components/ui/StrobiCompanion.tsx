import { useState } from 'react'
import { createAvatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'
import { motion, useReducedMotion } from 'framer-motion'
import { useActiveSection, useCompanionState } from '@/hooks'
import { accentColor } from '@/utils/accents'
import type { ChapterKind } from '@/types'
import type { CareerFocus } from '@/utils/companionFocus'
import definition from '@/assets/strobi.avatar.json'

/**
 * Strobi — the portfolio's runtime companion.
 *
 * One avatar, built once from the definition so the JSON is validated a single
 * time. It is docked to the corner of the viewport rather than printed inside
 * the hero, so the expression it wears while you read is actually visible: the
 * moods are tied to where the page is, not to a card you scroll past once.
 *
 * Three sources, most specific first:
 *
 *   · a node inspected in the hero topology → `thinking`, because the reader is
 *     asking a question of the system and the operator is tracing the answer;
 *   · the pointer resting on the companion → `working`;
 *   · the active journey chapter or career role → its own expression, published
 *     by those sections through `companionFocus`, so the face changes as each
 *     chapter and each role becomes active;
 *   · otherwise a mood drawn from the section the reader is standing in.
 *
 * Under `prefers-reduced-motion` it holds a calm, static expression instead of
 * an autoplaying timeline.
 */
const StrobiAvatar = createAvatar(definition)

type StrobiAnimation =
  | 'idle'
  | 'working'
  | 'thinking'
  | 'excited'
  | 'listening'
  | 'searching'
  | 'proud'
  | 'curious'
  | 'happy'
  | 'celebrate'

/**
 * One expression per chapter kind, so travelling the journey changes the face:
 * learning listens, building works, designing thinks, shipping excites.
 */
const CHAPTER_MOOD: Record<ChapterKind, StrobiAnimation> = {
  origin: 'curious',
  learning: 'listening',
  build: 'working',
  design: 'thinking',
  work: 'proud',
  recognition: 'celebrate',
  'open-source': 'excited',
}

/**
 * One expression per role, newest last, so the career reads as a progression too.
 * The id is presentation metadata in the same spirit as `ROLE_ACCENT`; the
 * fallback derives from the data for any role not listed.
 */
const ROLE_MOOD: Record<string, StrobiAnimation> = {
  systemtron: 'curious',
  'ardent-computech': 'working',
  'jai-balaji': 'thinking',
  distronix: 'proud',
}

const roleMood = (role: CareerFocus): StrobiAnimation =>
  ROLE_MOOD[role.id] ?? (role.current ? 'proud' : 'working')

/**
 * The fallback for the parts of the page with no thread of their own, following
 * the shape of the page: the journey is searched, the career worn with pride,
 * contact is a greeting. The hero (`''`) opens excited.
 */
const SECTION_MOOD: Record<string, StrobiAnimation> = {
  '': 'excited',
  about: 'listening',
  journey: 'searching',
  skills: 'working',
  experience: 'proud',
  projects: 'curious',
  education: 'listening',
  credentials: 'proud',
  contact: 'happy',
}

/** Diameter of the avatar well in pixels. */
const SIZE = 44

export default function StrobiCompanion() {
  const reduceMotion = useReducedMotion()
  const section = useActiveSection()
  const { journey, experience, inspecting } = useCompanionState()
  const [engaged, setEngaged] = useState(false)

  // A thread only speaks for the section that owns it, so a stale value from a
  // section the reader has left can never drive the face.
  const chapter = section === 'journey' ? journey : null
  const role = section === 'experience' ? experience : null

  const mood: StrobiAnimation = inspecting
    ? 'thinking'
    : engaged
      ? 'working'
      : chapter
        ? CHAPTER_MOOD[chapter.kind]
        : role
          ? roleMood(role)
          : (SECTION_MOOD[section] ?? 'idle')

  // The companion borrows the active thread's colour, so it reads as part of
  // that thread rather than a separate widget floating over it.
  const focusAccent = chapter?.accent ?? role?.accent ?? null
  const accent = focusAccent ? accentColor[focusAccent] : 'var(--accent-teal)'

  const status = inspecting
    ? 'Tracing the cluster…'
    : engaged
      ? 'Following your pointer…'
      : chapter
        ? `Journey · ${chapter.label}`
        : role
          ? `Career · ${role.label}`
          : section
            ? `Runtime companion · ${section}`
            : 'Runtime companion · idle'

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: reduceMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      className="fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-full border p-2 backdrop-blur-md sm:bottom-6 sm:right-6 sm:py-2 sm:pl-2.5 sm:pr-4"
      style={{
        background: 'color-mix(in srgb, var(--panel) 90%, transparent)',
        borderColor: focusAccent ? accent : 'var(--border)',
        boxShadow: 'var(--shadow-soft)',
      }}
      aria-label="Strobi — the portfolio's runtime companion"
    >
      <span
        className="relative flex shrink-0 items-center justify-center rounded-full"
        style={{ width: SIZE, height: SIZE, background: 'var(--glow-teal)' }}
      >
        <span
          className="absolute inset-0 rounded-full transition-colors duration-500"
          style={{ border: `1px solid ${focusAccent ? accent : 'var(--border-glow)'}` }}
          aria-hidden="true"
        />
        {reduceMotion ? (
          <StrobiAvatar
            defaultExpression="neutral"
            size={SIZE - 12}
            ariaLabel="Strobi — the portfolio's runtime companion"
          />
        ) : (
          <StrobiAvatar
            animation={mood}
            size={SIZE - 12}
            ariaLabel="Strobi — the portfolio's runtime companion"
          />
        )}
      </span>

      {/* The label is a wide-screen luxury: below `sm` the companion is just the
          avatar, so it never covers the text it is meant to sit beside. */}
      <div className="hidden min-w-0 leading-tight sm:block">
        <p
          className="font-mono-code text-[0.6rem] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-primary)' }}
        >
          Strobi
        </p>
        <p
          className="max-w-[15rem] truncate text-[0.68rem]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {status}
        </p>
      </div>

      <span
        className="hidden shrink-0 items-center gap-1.5 transition-colors duration-500 sm:flex"
        style={{ color: accent }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
          style={{ background: accent }}
          aria-hidden="true"
        />
        <span className="font-mono-code text-[0.55rem] uppercase tracking-widest">
          {inspecting || engaged ? 'active' : 'online'}
        </span>
      </span>
    </motion.aside>
  )
}
