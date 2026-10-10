import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createAvatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useActiveSection, useCompanionState, useMediaQuery, useStrobiPlayback } from '@/hooks'
import { accentColor } from '@/utils/accents'
import { subscribeCompanionCues } from '@/utils/companionCues'
import { CHAPTER_TIPS, ROLE_TIPS, SECTION_TIPS } from '@/data'
import type { ChapterKind, StrobiAnimation } from '@/types'
import type { CareerFocus, JourneyFocus } from '@/utils/companionFocus'
import definition from '@/assets/strobi.avatar.json'

/**
 * Strobi — the portfolio's runtime companion.
 *
 * One avatar, built once from the definition so the JSON is validated a single
 * time, docked to the corner of the viewport rather than printed inside the hero:
 * the expression it wears while you read is only visible if it travels with you.
 *
 * It answers to the visitor, most specific first:
 *
 *   · the wake-up, once, when the page opens — `waking`, then the resting face;
 *   · a reaction the visitor just earned — a control under the pointer (or under
 *     a tap, on a phone), the contact form's outcome, or a poke;
 *   · being asleep, because nothing has happened for a while;
 *   · where the page is — a node inspected in the hero topology, a resting pointer,
 *     the active journey chapter or career role, and failing all of those, the
 *     section itself.
 *
 * Everything it says and does is driven through `useStrobiPlayback`, a controller
 * with the shape of the avatar package's own. See that hook for why the imperative
 * API is not reachable here.
 *
 * Nothing moves the layout. The pill is fixed and its own width; the bubble is
 * absolutely positioned above it and never takes part in flow; the status line has
 * a set width, so a longer chapter name truncates instead of widening the pill.
 *
 * Under `prefers-reduced-motion` every reaction is off — the timeline is stopped
 * and Strobi holds one still, neutral face. The tips still appear, because they are
 * text rather than motion, and a covered control still suppresses the bubble.
 */

const StrobiAvatar = createAvatar(definition)

/** One expression per chapter kind, so travelling the journey changes the face. */
const CHAPTER_MOOD: Record<ChapterKind, StrobiAnimation> = {
  origin: 'curious',
  learning: 'listening',
  build: 'working',
  design: 'thinking',
  work: 'proud',
  recognition: 'celebrate',
  'open-source': 'excited',
}

/** One expression per role, so the career reads as a progression too. */
const ROLE_MOOD: Record<string, StrobiAnimation> = {
  systemtron: 'curious',
  'ardent-computech': 'working',
  'jai-balaji': 'thinking',
  distronix: 'proud',
}

const roleMood = (role: CareerFocus): StrobiAnimation =>
  ROLE_MOOD[role.id] ?? (role.current ? 'proud' : 'working')

/**
 * The resting face for the parts of the page with no thread of their own. The hero
 * rests rather than greeting: the visitor has just watched it wake up, and
 * `waking` hands over to exactly this.
 */
const SECTION_MOOD: Record<string, StrobiAnimation> = {
  '': 'idle',
  about: 'listening',
  journey: 'searching',
  skills: 'working',
  experience: 'proud',
  projects: 'curious',
  education: 'listening',
  credentials: 'proud',
  contact: 'happy',
}

/**
 * What counts as "a control" for the two rules that care: hovering one is worth a
 * reaction, and the bubble must never sit on one. Links are included with buttons
 * because links *are* the buttons of this site — the nav and the project cards are
 * anchors, and a visitor pointing at one is pointing at a control either way.
 */
const CONTROL_SELECTOR = 'a[href], button, [role="button"], summary'

/** Diameter of the avatar well in pixels. */
const SIZE = 44

/**
 * How long the wake-up holds before the resting face takes over. `waking` is a
 * loop in `strobi.avatar.json`, so a timer is what hands over; `onAnimationEnd`
 * would take it sooner if the sequence were ever changed to a one-shot.
 */
const WAKE_MS = 2000

/** How long one reaction sits on the face before the page gets it back. */
const REACTION_MS = 2200

/**
 * Quiet time — no mouse, no scroll, no typing — before Strobi starts to nod off,
 * and the further quiet before it is properly asleep. Any activity at all rewinds
 * both, which is the whole point: it should feel like being noticed.
 */
const DROWSY_AFTER_MS = 30_000
const ASLEEP_AFTER_MS = 12_000

/** How long a tip stays in the bubble before it gets out of the way. */
const TIP_MS = 7000

type IdleStage = 'awake' | 'drowsy' | 'sleeping'

interface StatusInput {
  waking: boolean
  reaction: StrobiAnimation | null
  idleStage: IdleStage
  inspecting: boolean
  engaged: boolean
  chapter: JourneyFocus | null
  role: CareerFocus | null
  section: string
}

/** The one line under "Strobi" — the reason for whatever face is on screen. */
const statusFor = ({
  waking,
  reaction,
  idleStage,
  inspecting,
  engaged,
  chapter,
  role,
  section,
}: StatusInput): string => {
  if (waking) return 'Waking up…'
  if (reaction === 'celebrate') return 'Your message is on its way.'
  if (reaction === 'confused') return 'That form needs all three fields.'
  if (reaction === 'laughing') return 'That tickles.'
  if (reaction === 'excited') return 'Noticed that one.'
  if (idleStage === 'sleeping') return 'Asleep — move and I will wake.'
  if (idleStage === 'drowsy') return 'Getting sleepy…'

  if (inspecting) return 'Tracing the cluster…'
  if (engaged) return 'Following your pointer…'
  if (chapter) return `Journey · ${chapter.label}`
  if (role) return `Career · ${role.label}`
  return section ? `Runtime companion · ${section}` : 'Runtime companion · idle'
}

/**
 * True when the bubble's own footprint has a control underneath it.
 *
 * The bubble is `pointer-events-none`, so it can never *block* a click — but on a
 * phone it must not *cover* one either, because a covered button is a button the
 * visitor cannot see. Rather than guessing where the controls are, ask the
 * document what is actually at the bubble's corners: `elementsFromPoint` skips
 * layers that opt out of hit testing, so anything it returns really is underneath,
 * and the companion's own pill is ignored because covering itself is not a problem.
 */
const coversAControl = (bubble: HTMLElement, pill: HTMLElement | null): boolean => {
  const box = bubble.getBoundingClientRect()
  const xs = [box.left + 4, box.left + box.width / 2, box.right - 4]
  const ys = [box.top + 4, box.bottom - 4]
  return xs.some((x) =>
    ys.some((y) =>
      document
        .elementsFromPoint(x, y)
        .some((node) => !pill?.contains(node) && (node as Element).matches?.(CONTROL_SELECTOR)),
    ),
  )
}

export default function StrobiCompanion() {
  const reduceMotion = useReducedMotion()
  const section = useActiveSection()
  const { journey, experience, inspecting } = useCompanionState()
  // A touch screen has no hover state, so the same reaction is earned by tapping a
  // control instead — read from CSS rather than from a user-agent guess.
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  const playback = useStrobiPlayback(reduceMotion ? 'idle' : 'waking')
  const { controller } = playback

  const [waking, setWaking] = useState(!reduceMotion)
  const [reaction, setReaction] = useState<StrobiAnimation | null>(null)
  const [idleStage, setIdleStage] = useState<IdleStage>('awake')
  const [engaged, setEngaged] = useState(false)
  const [tip, setTip] = useState<string | null>(null)
  const [tipBlocked, setTipBlocked] = useState(false)

  const pillRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const reactionTimer = useRef<number | undefined>(undefined)
  /** When the visitor last did anything — the clock every idle stage is read from. */
  const lastActiveAt = useRef(Date.now())

  /**
   * Put a reaction on the face for a beat. Re-triggering the same one extends the
   * beat rather than restarting the animation — which is what makes running the
   * pointer along a row of controls read as one continuous "yes, I see you"
   * instead of a stutter.
   */
  const react = useCallback((animation: StrobiAnimation, holdMs = REACTION_MS) => {
    setReaction(animation)
    window.clearTimeout(reactionTimer.current)
    reactionTimer.current = window.setTimeout(() => setReaction(null), holdMs)
  }, [])

  useEffect(() => () => window.clearTimeout(reactionTimer.current), [])

  // A thread only speaks for the section that owns it, so a stale value from a
  // section the reader has left can never drive the face.
  const chapter = section === 'journey' ? journey : null
  const role = section === 'experience' ? experience : null

  const ambient: StrobiAnimation = inspecting
    ? 'thinking'
    : engaged
      ? 'working'
      : chapter
        ? CHAPTER_MOOD[chapter.kind]
        : role
          ? roleMood(role)
          : (SECTION_MOOD[section] ?? 'idle')

  const target: StrobiAnimation = waking
    ? 'waking'
    : (reaction ??
      (idleStage === 'sleeping' ? 'sleeping' : idleStage === 'drowsy' ? 'drowsy' : ambient))

  /**
   * The wake-up, once. The timer is the handover because `waking` loops; the
   * callback is wired as well so a one-shot sequence would hand over the moment it
   * finished instead of waiting the timer out.
   */
  useEffect(() => {
    if (!waking) return
    const timer = window.setTimeout(() => setWaking(false), WAKE_MS)
    return () => window.clearTimeout(timer)
  }, [waking])

  const handleAnimationEnd = useCallback((animation: string) => {
    if (animation === 'waking') setWaking(false)
  }, [])

  // The face itself. Skipping the play when the animation is already on screen is
  // what keeps a re-render from restarting a loop mid-blink.
  useEffect(() => {
    if (reduceMotion) {
      controller.stop()
      return
    }
    if (controller.getState().activeAnimation !== target) controller.play(target)
  }, [target, reduceMotion, controller])

  // Sleep. One interval reading a timestamp rather than a timer per event: the
  // visitor's pointer moves dozens of times a second, and rewinding a timer that
  // often would be work for nothing. A stage that has not changed re-renders
  // nothing, so the tick is free while the visitor is active.
  useEffect(() => {
    if (reduceMotion) return

    lastActiveAt.current = Date.now()
    setIdleStage('awake')

    const markActive = () => {
      lastActiveAt.current = Date.now()
    }
    const tick = () => {
      const quiet = Date.now() - lastActiveAt.current
      const next: IdleStage =
        quiet >= DROWSY_AFTER_MS + ASLEEP_AFTER_MS
          ? 'sleeping'
          : quiet >= DROWSY_AFTER_MS
            ? 'drowsy'
            : 'awake'
      // A stage that has not changed re-renders nothing, so a tick while the
      // visitor is active costs one comparison.
      setIdleStage((prev) => (prev === next ? prev : next))
    }

    const events: (keyof WindowEventMap)[] = [
      'pointermove',
      'pointerdown',
      'wheel',
      'keydown',
      'scroll',
      'touchstart',
    ]
    events.forEach((event) => window.addEventListener(event, markActive, { passive: true }))
    document.addEventListener('visibilitychange', markActive)

    tick()
    const timer = window.setInterval(tick, 1000)

    return () => {
      events.forEach((event) => window.removeEventListener(event, markActive))
      document.removeEventListener('visibilitychange', markActive)
      window.clearInterval(timer)
    }
  }, [reduceMotion])

  // What the contact form just did. Fired from wherever the form happens to be;
  // the companion does not have to know it exists.
  useEffect(() => {
    if (reduceMotion) return
    return subscribeCompanionCues((cue) => react(cue))
  }, [react, reduceMotion])

  /**
   * Any control, anywhere, without asking a single one of them to know the
   * companion exists: delegated listeners on the window. The pill is excluded from
   * both, because pointing at Strobi already means `working` and poking it means
   * `laughing` — it is not one of the page's controls.
   *
   * Pointer first, so a pointer running along a row of controls reads as one
   * continuous "yes, I see you" rather than a stutter. On a screen with a real
   * hover affordance that is `pointerover`; on a touch or coarse-pointer screen the
   * same reaction is earned by tapping the control (`pointerdown`). Keyboard focus
   * on a control is its own analogue of a pointer landing on it, so that is wired
   * separately through `focusin` — but only for controls that can be focused without
   * being focused on the pointer, otherwise every pointer interaction over one would
   * also fire focus and double-trigger.
   */
  useEffect(() => {
    if (reduceMotion) return
    const onPointerAttention = (event: PointerEvent) => {
      const hit = (event.target as Element | null)?.closest?.(CONTROL_SELECTOR)
      if (!hit || pillRef.current?.contains(hit)) return
      react('excited')
    }
    const onFocusAttention = (event: FocusEvent) => {
      const target = event.target as Element | null
      if (!target || pillRef.current?.contains(target)) return
      if (!target.closest?.(CONTROL_SELECTOR)) return
      // The nav is buttons and links; keyboard focus on one is the analogue of hovering
      // it with the pointer. Pointer interaction on a control also fires focus in modern
      // browsers, so react only to a keyboard-initiated focus — not to a pointer landing
      // and focusing at the same time, which would double-trigger.
      if (target.matches?.(CONTROL_SELECTOR)) {
        const related = event.relatedTarget as Element | null
        if (related && related.closest?.(CONTROL_SELECTOR)) {
          // Both source and target are controls — likely a pointer-driven focus move.
          return
        }
        react('excited')
      }
    }
    window.addEventListener('pointerover', onPointerAttention, { passive: true })
    window.addEventListener('pointerdown', onPointerAttention, { passive: true })
    // Keyboard focus on a control is the analogue of hovering it with the pointer,
    // but only on a screen that actually exposes hover — installing `focusin` on a
    // phone adds a listener with nothing keyboard-relevant to react to.
    if (canHover) window.addEventListener('focusin', onFocusAttention)
    return () => {
      window.removeEventListener('pointerover', onPointerAttention)
      window.removeEventListener('pointerdown', onPointerAttention)
      if (canHover) window.removeEventListener('focusin', onFocusAttention)
    }
  }, [canHover, react, reduceMotion])

  /**
   * One tip per place the visitor lands. The bubble waits for the wake-up, so the
   * first line is not spent behind the preloader, and it disappears on its own —
   * an assistant that never stops talking is a notification, not a companion.
   */
  const nextTip = chapter
    ? CHAPTER_TIPS[chapter.id] ?? SECTION_TIPS[section]
    : role
      ? ROLE_TIPS[role.id] ?? SECTION_TIPS[section]
      : SECTION_TIPS[section]

  useEffect(() => {
    if (waking || !nextTip) return
    setTip(nextTip)
    const timer = window.setTimeout(() => setTip(null), TIP_MS)
    return () => window.clearTimeout(timer)
  }, [nextTip, waking])

  /**
   * Before paint, check the bubble is not sitting on a control, and keep checking
   * while it is up: scrolling slides the page under a fixed bubble, so where it can
   * go safely is a question with a moving answer.
   *
   * The bubble stays *mounted* while blocked — merely made invisible — because a
   * hidden-and-unmounted bubble has no rectangle to measure, and an unmeasurable
   * bubble could never discover that the page has scrolled clear. One-way door
   * otherwise: the first control it met would suppress every tip after it.
   */
  useLayoutEffect(() => {
    if (!tip) return
    const bubble = bubbleRef.current
    if (!bubble) return
    const check = () => setTipBlocked(coversAControl(bubble, pillRef.current))
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [tip])

  // The companion borrows the active thread's colour, so it reads as part of that
  // thread rather than a separate widget floating over it.
  const focusAccent = chapter?.accent ?? role?.accent ?? null
  const accent = focusAccent ? accentColor[focusAccent] : 'var(--accent-teal)'

  const status = statusFor({
    waking,
    reaction,
    idleStage,
    inspecting,
    engaged,
    chapter,
    role,
    section,
  })

  // One element either way: the runtime reconciles the same avatar whether it is
  // handed an animation or an expression, and keeps its position in the timeline.
  const targetProps =
    playback.target.kind === 'animation'
      ? { animation: playback.target.animation }
      : { expression: playback.target.expression }

  return (
    <aside
      className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6"
      aria-label="Strobi — the portfolio's runtime companion"
    >
      <motion.div
        ref={pillRef}
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          delay: reduceMotion ? 0 : 1.05,
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseEnter={() => setEngaged(true)}
        onMouseLeave={() => setEngaged(false)}
        className="relative flex items-center gap-3 rounded-full border p-2 backdrop-blur-md sm:py-2 sm:pl-2.5 sm:pr-4"
        style={{
          background: 'color-mix(in srgb, var(--panel) 90%, transparent)',
          borderColor: focusAccent ? accent : 'var(--border)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {/* The tip. Absolutely positioned and out of flow, so it can neither
            move the pill nor resize the page, and `pointer-events-none` so it
            cannot intercept a click it happens to be over. */}
        <AnimatePresence>
          {tip && (
            <motion.div
              key="tip"
              ref={bubbleRef}
              role="status"
              initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-none absolute bottom-full right-0 mb-3 w-[min(78vw,17rem)] origin-bottom-right rounded-2xl border px-3.5 py-2.5${
                // `invisible` rather than unmounting: the rectangle stays
                // measurable, so the guard can stand down the moment the page
                // scrolls the control out from under the bubble.
                tipBlocked ? ' invisible' : ''
              }`}
              style={{
                background: 'color-mix(in srgb, var(--panel) 94%, transparent)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <p className="text-[0.72rem] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {tip}
              </p>
              <span
                aria-hidden="true"
                className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 border-b border-r"
                style={{
                  background: 'color-mix(in srgb, var(--panel) 94%, transparent)',
                  borderColor: 'var(--border)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => react('laughing')}
          aria-label="Poke Strobi"
          className="relative flex shrink-0 items-center justify-center rounded-full"
          style={{ width: SIZE, height: SIZE, background: 'var(--glow-teal)' }}
        >
          <span
            className="absolute inset-0 rounded-full transition-colors duration-500"
            style={{ border: `1px solid ${focusAccent ? accent : 'var(--border-glow)'}` }}
            aria-hidden="true"
          />
          <StrobiAvatar
            {...targetProps}
            size={SIZE - 12}
            ariaLabel="Strobi — the portfolio's runtime companion"
            onExpressionChange={playback.onExpressionChange}
            onAnimationEnd={handleAnimationEnd}
          />
        </button>

        {/* The label is a wide-screen luxury: below `sm` the companion is just the
            avatar, so it never covers the text it is meant to sit beside. The
            status line has a *fixed* width — a longer chapter name truncates
            rather than widening the pill under the reader's eye. */}
        <div className="hidden min-w-0 leading-tight sm:block">
          <p
            className="font-mono-code text-[0.6rem] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-primary)' }}
          >
            Strobi
          </p>
          <p
            className="w-[15rem] truncate text-[0.68rem]"
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
            {inspecting || engaged || reaction
              ? 'active'
              : idleStage === 'sleeping'
                ? 'asleep'
                : 'online'}
          </span>
        </span>
      </motion.div>
    </aside>
  )
}
