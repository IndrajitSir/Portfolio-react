import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiGithub, FiX } from 'react-icons/fi'
import Tag from './Tag'
import { accentColor } from '@/utils/accents'
import { getLenis } from '@/utils/lenisRef'
import type { AccentKey, Project } from '@/types'

/**
 * The case study, as a dossier panel over the page.
 *
 * It used to be a disclosure inside the card: the deep-dive expanded the card
 * itself with `height: 0 -> auto`, which pushed every section below it down the
 * page, moved the carousel's own anchor, and silently threw the reader's place
 * away the moment the carousel advanced. The information was worth keeping; the
 * card was the wrong place to put it.
 *
 * A panel over the page keeps the card exactly the size it was, so opening a
 * case study moves nothing. It also reads correctly: a study is a separate
 * document with its own title, not more of the same card.
 *
 * Three things make it behave like a real dialog rather than a floating div:
 *
 * - It is portalled to `document.body`. The carousel animates its slides with a
 *   transform, which makes the slide a containing block for `position: fixed`,
 *   and the section clips its own overflow - so an in-place overlay would be
 *   both scaled with the slide and cut off.
 * - The page behind is frozen two ways, because Lenis is in play: `stop()` it,
 *   and hide overflow on the root. Stopping alone is not enough - a stopped
 *   Lenis still calls `preventDefault` on wheel, so the panel's own scroll
 *   would be dead. `data-lenis-prevent` on the panel is what lets it scroll
 *   again; the root lock covers visitors who have Lenis switched off entirely.
 * - Focus goes to the panel on open, cycles inside it on Tab, and returns to
 *   the control that opened it on close. Escape and the backdrop close it.
 */

interface CaseStudyDialogProps {
  /** The project being read, or null when the panel is closed. */
  project: Project | null
  /** Accent key the card used, so the panel reads as the same document. */
  accent: AccentKey
  onClose: () => void
  /** The control that opened the panel; focus returns to it on close. */
  returnFocusTo: HTMLButtonElement | null
}

/** Everything a keyboard can land on inside the panel. */
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function CaseStudyDialog({
  project,
  accent,
  onClose,
  returnFocusTo,
}: CaseStudyDialogProps) {
  const reduceMotion = useReducedMotion()

  return createPortal(
    <AnimatePresence>
      {project && (
        <CaseStudyPanel
          key={project.id}
          project={project}
          accent={accent}
          onClose={onClose}
          returnFocusTo={returnFocusTo}
          reduceMotion={!!reduceMotion}
        />
      )}
    </AnimatePresence>,
    document.body,
  )
}

function CaseStudyPanel({
  project,
  accent,
  onClose,
  returnFocusTo,
  reduceMotion,
}: {
  project: Project
  accent: AccentKey
  onClose: () => void
  returnFocusTo: HTMLButtonElement | null
  reduceMotion: boolean
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const accentHex = accentColor[accent]

  // ── Focus: in on open, back to the control that opened it on close ──────
  useEffect(() => {
    panelRef.current?.focus()
    const trigger = returnFocusTo
    return () => trigger?.focus()
  }, [returnFocusTo])

  // ── The page behind is frozen while the panel is open ──────────────────
  useEffect(() => {
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousOverflowY = root.style.overflowY
    // Lenis owns the scroll position, and stopped it swallows wheel and touch
    // while leaving the scroll offset exactly where it was.
    const lenis = getLenis()
    lenis?.stop()
    if (lenis) {
      // Keep a scrollbar on the root while the panel is open. Lenis' stopped
      // state clips the root, which takes the bar away and widens the content
      // by its width - enough to wrap a line and change a card's height, which
      // is the very thing this panel exists to avoid. Forcing `scroll-y`
      // overrides that clip; Lenis is what stops the page moving, not the bar.
      root.style.overflowY = 'scroll'
    } else {
      // No Lenis (a reduced-motion visitor): nothing else freezes the page, so
      // clip it here. Still not `hidden`, which would make the root a scroll
      // container and drop the reader back at the top.
      root.style.overflow = 'clip'
    }
    return () => {
      root.style.overflow = previousOverflow
      root.style.overflowY = previousOverflowY
      lenis?.start()
    }
  }, [])

  // ── Escape closes, Tab stays inside ────────────────────────────────────
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      )
      if (focusable.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  const fade = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }
  const rise = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }

  return (
    <div
      /* The dismiss handler sits here, not on the backdrop: this element owns
         the whole viewport, the backdrop only the area inside its padding, so a
         click in that outer band would otherwise land on nothing. */
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-hidden p-4 sm:p-6"
    >
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        key="panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        /* `data-lenis-prevent` covers the whole panel, not just the scrolling
           body: a stopped Lenis swallows every wheel gesture it is not told to
           ignore, so marking only the body would leave the header and the
           footer inert. Over those, the browser finds no scrollable ancestor -
           the root is locked - so nothing moves. */
        data-lenis-prevent
        /* A click inside the panel is not a click outside it. */
        onClick={(event) => event.stopPropagation()}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.99 }}
        transition={rise}
        className="
          relative flex w-full max-w-[46rem] flex-col outline-none
          max-h-[min(88vh,46rem)] rounded-2xl overflow-hidden
        "
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 70px -20px rgba(0,0,0,0.65)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 sm:px-7"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="min-w-0">
            <p
              className="font-mono-code text-[0.65rem] uppercase tracking-widest"
              style={{ color: accentHex }}
            >
              {/* Not every project is numbered, and a dangling em dash reads as
                  a bug rather than as a missing label. */}
              Case study{project.number ? ` — Project ${project.number}` : ''}
            </p>
            <h2
              id={titleId}
              className="mt-1.5 font-display text-[1.6rem] font-light leading-tight tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close the case study for ${project.title}`}
            className="
              flex h-9 w-9 shrink-0 items-center justify-center rounded-full
              border border-[var(--border)] bg-[var(--surface)]
              text-[var(--text-secondary)] outline-offset-2
              transition-colors duration-200
              hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
            "
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7">
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
              {project.period}
            </span>
            <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
              ·
            </span>
            <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
              {project.category}
            </span>
            {project.highlight && (
              <span className="font-mono-code text-[0.62rem]" style={{ color: accentHex }}>
                · {project.highlight}
              </span>
            )}
          </div>

          {project.longDescription && (
            <p
              className="mb-6 text-[0.92rem] leading-[1.8]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {project.longDescription}
            </p>
          )}

          {project.challenges.length > 0 && (
            <StudyList
              heading="Challenges"
              marker="⚡"
              markerColor="var(--accent-orange)"
              items={project.challenges}
            />
          )}

          {project.solutions.length > 0 && (
            <StudyList
              heading="Solutions"
              marker="✓"
              markerColor="var(--accent-teal)"
              items={project.solutions}
            />
          )}

          <StudyList
            heading={project.features.length > 3 ? 'All features' : 'Key features'}
            marker="◆"
            markerColor={accentHex}
            items={project.features}
          />

          {project.technologies.length > 0 && (
            <div className="mt-6">
              <p
                className="mb-2 font-mono-code text-[0.68rem] uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Tag key={tech} label={tech} variant="indigo" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-3 px-6 py-4 sm:px-7"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Live preview of ${project.title}`}
              className="
                flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)]
                bg-[var(--glow-teal)] px-4 py-2 text-[0.78rem] font-semibold
                text-[var(--accent-teal)]
                transition-all duration-200 hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)]
              "
            >
              <FiArrowUpRight size={13} />
              Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub repository for ${project.title}`}
              className="
                flex items-center gap-1.5 rounded-lg border border-[var(--border)]
                bg-[var(--surface)] px-4 py-2 text-[0.78rem] font-semibold
                text-[var(--text-secondary)]
                transition-all duration-200 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
              "
            >
              <FiGithub size={13} />
              Code
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="
              ml-auto font-mono-code text-[0.68rem] uppercase tracking-widest outline-offset-2
              text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--accent-teal)]
            "
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/** One labelled list inside the study: challenges, solutions, features. */
function StudyList({
  heading,
  marker,
  markerColor,
  items,
}: {
  heading: string
  marker: string
  markerColor: string
  items: string[]
}) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <p
        className="mb-2.5 font-mono-code text-[0.68rem] uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {heading}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-[0.85rem] leading-[1.7]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="shrink-0" style={{ color: markerColor }} aria-hidden="true">
              {marker}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}