import { memo, useCallback, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import type { SkillEvidence } from '@/types'
import { DURATION, EASE_OUT_EXPO, REVEAL_VIEWPORT } from '@/utils/motion'
import { EVIDENCE_STYLE } from './evidenceStyles'
import type { SkillDomain } from './SkillConstellation'

/**
 * Every technology, and where it is demonstrated — as a rail of cards.
 *
 * The section used to be nine stacked blocks of chips that ran the page far
 * longer than the information justified. The same facts now live on one
 * horizontally-scrollable rail: each card names a technology, its domain, and
 * the project, role or credential that demonstrates it, every one of them a link
 * you can follow.
 *
 * Two rules shaped the implementation:
 *
 *  - it must not become a new source of lag. Nothing here autoplays, loops or
 *    animates on a timer. The only motion is a one-time entrance and a hover
 *    lift, both of which the reduced-motion path drops.
 *  - horizontal scrolling must not fight the page. The scroller carries
 *    `data-lenis-prevent` so the smooth-scroll library leaves wheel and touch
 *    gestures inside it alone, and it never traps vertical page scrolling: a
 *    vertical swipe anywhere on the rail scrolls the page as usual.
 *
 * Scroll position is tracked without re-rendering the cards — the progress fill
 * is written straight to the DOM from a passive listener, and the two edge
 * buttons only re-render when their enabled state actually flips.
 */

interface TechnologyRailProps {
  domains: SkillDomain[]
}

interface TechCard {
  name: string
  domainId: string
  domainTitle: string
  icon: string
  evidence: SkillEvidence[]
}

/** Flatten the domains into one card per technology, preserving the data order. */
function buildCards(domains: SkillDomain[]): TechCard[] {
  return domains.flatMap((domain) =>
    domain.items.map((item) => ({
      name: item.name,
      domainId: domain.id,
      domainTitle: domain.title,
      icon: domain.icon,
      evidence: item.evidence,
    })),
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE_OUT_EXPO } },
}

export default function TechnologyRail({ domains }: TechnologyRailProps) {
  const reduceMotion = useReducedMotion()
  const railRef = useRef<HTMLUListElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const [filter, setFilter] = useState<string>('all')
  const [edges, setEdges] = useState<{ start: boolean; end: boolean }>({ start: true, end: false })

  const cards = useMemo(() => buildCards(domains), [domains])
  const visible = useMemo(
    () => (filter === 'all' ? cards : cards.filter((c) => c.domainId === filter)),
    [cards, filter],
  )

  const filters = useMemo(
    () => [{ id: 'all', label: 'All', icon: '✦' }, ...domains.map((d) => ({ id: d.id, label: d.short, icon: d.icon }))],
    [domains],
  )

  // The domain's own one-line description, so the summaries the old layout
  // printed under each block are still on the page rather than lost.
  const activeDomain = filter === 'all' ? null : domains.find((d) => d.id === filter) ?? null

  /** Read the rail's scroll state once; write the fill to the DOM, not state. */
  const sync = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const max = rail.scrollWidth - rail.clientWidth
    const progress = max > 0 ? rail.scrollLeft / max : 0
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${progress || 0.02})`
    }
    const start = rail.scrollLeft <= 4
    const end = max <= 4 || rail.scrollLeft >= max - 4
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])

  /** Move by roughly one card. Snapping does the rest. */
  const nudge = useCallback((dir: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector<HTMLElement>('[data-card]')
    const amount = card ? card.offsetWidth + 16 : rail.clientWidth * 0.8
    rail.scrollBy({ left: amount * dir, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudge(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudge(-1)
    }
  }, [nudge])

  const onFilter = (id: string) => {
    setFilter(id)
    // Returning to the start of the rail keeps the first matching card in view.
    requestAnimationFrame(() => {
      railRef.current?.scrollTo({ left: 0, behavior: 'auto' })
      sync()
    })
  }

  return (
    <div>
      {/* ── Toolbar: category filters + rail controls ─────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter technologies by domain"
          className="flex flex-wrap gap-1.5"
        >
          {filters.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilter(f.id)}
                className="rounded-full border px-2.5 py-1 font-mono-code text-[0.62rem] uppercase tracking-wide transition-colors duration-200"
                style={{
                  borderColor: active ? 'var(--accent-teal)' : 'var(--border)',
                  background: active ? 'var(--glow-teal)' : 'var(--surface)',
                  color: active ? 'var(--accent-teal)' : 'var(--text-secondary)',
                }}
              >
                <span aria-hidden="true">{f.icon}</span> {f.label}
              </button>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono-code text-[0.62rem] sm:inline" style={{ color: 'var(--text-muted)' }}>
            {visible.length} shown · scroll the rail
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={edges.start}
              aria-label="Previous technologies"
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <FiChevronLeft size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={edges.end}
              aria-label="More technologies"
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <FiChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p className="mb-4 max-w-[70ch] text-[0.78rem] leading-[1.6]" style={{ color: 'var(--text-muted)' }}>
        {activeDomain?.summary ??
          'Each technology sits under the domain it serves, with the project, role or credential that demonstrates it. Pick a domain to filter, or scroll the rail.'}
      </p>

      {/* ── The rail ──────────────────────────────────────────────── */}
      <div className="relative">
        {/* Edge fades are the "there is more" affordance on touch, where the
            buttons are easy to miss. Pure CSS, no per-frame cost. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to left, var(--bg-primary), transparent)',
            opacity: edges.end ? 0 : 1,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, var(--bg-primary), transparent)',
            opacity: edges.start ? 0 : 1,
          }}
        />

        <ul
          ref={railRef}
          // Let wheel/touch inside the rail scroll it horizontally instead of
          // being captured by Lenis for the page.
          data-lenis-prevent
          tabIndex={0}
          onScroll={sync}
          onKeyDown={onKeyDown}
          aria-label="Technology cards"
          className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3"
          style={{ scrollbarGutter: 'stable' }}
        >
          {visible.map((card, i) => (
            <TechnologyCard key={`${card.domainId}-${card.name}`} card={card} index={i} reduceMotion={!!reduceMotion} />
          ))}
        </ul>

        {/* Progress fill — written to the DOM by `sync`, never through state. */}
        <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
          <span
            ref={fillRef}
            className="block h-full origin-left rounded-full"
            style={{ background: 'var(--accent-teal)', transform: 'scaleX(0.02)' }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * One technology card.
 *
 * Memoised: the rail re-renders when a filter is chosen, and the cards that
 * survive a filter change have identical props, so they skip entirely.
 */
const TechnologyCard = memo(function TechnologyCard({
  card,
  index,
  reduceMotion,
}: {
  card: TechCard
  index: number
  reduceMotion: boolean
}) {
  return (
    <motion.li
      data-card
      variants={reduceMotion ? undefined : cardVariants}
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ ...REVEAL_VIEWPORT, margin: '0px 0px -40px 0px' }}
      transition={reduceMotion ? undefined : { delay: Math.min(index, 6) * 0.03 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className="
        flex w-[min(78vw,300px)] shrink-0 snap-start flex-col rounded-2xl border p-4
      "
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span aria-hidden="true" className="text-sm">
          {card.icon}
        </span>
        <span
          className="font-mono-code text-[0.56rem] uppercase tracking-widest"
          style={{ color: 'var(--accent-teal)' }}
        >
          {card.domainTitle}
        </span>
      </div>

      <h3 className="text-base font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
        {card.name}
      </h3>

      <p className="mt-1 font-mono-code text-[0.58rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        demonstrated in {card.evidence.length} place{card.evidence.length === 1 ? '' : 's'}
      </p>

      <ul className="mt-3 flex flex-1 flex-col gap-2">
        {card.evidence.map((evidence, i) => (
          <li key={`${evidence.label}-${i}`}>
            <EvidenceLink evidence={evidence} />
          </li>
        ))}
      </ul>
    </motion.li>
  )
})

/** One piece of evidence, as a full-width, always-visible row. */
function EvidenceLink({ evidence }: { evidence: SkillEvidence }) {
  const style = EVIDENCE_STYLE[evidence.kind]
  const external = evidence.href ? !evidence.href.startsWith('#') : false
  const hasHref = !!evidence.href

  const inner: ReactNode = (
    <>
      <span style={{ color: style.color }} aria-hidden="true">
        {style.glyph}
      </span>
      <span className="flex-1 text-[0.76rem] leading-snug" style={{ color: 'var(--text-secondary)' }}>
        {evidence.label}
      </span>
      {hasHref && (
        <FiArrowUpRight size={12} aria-hidden="true" className="mt-0.5 shrink-0 opacity-60" />
      )}
    </>
  )

  const className =
    'flex items-start gap-2 rounded-lg border px-2.5 py-1.5 transition-colors duration-200'

  if (!hasHref) {
    return (
      <span className={className} style={{ borderColor: 'var(--border)' }}>
        {inner}
      </span>
    )
  }

  return (
    <a
      href={evidence.href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${className} hover:border-[var(--accent-teal)]`}
      style={{ borderColor: 'var(--border)' }}
    >
      {inner}
      <span className="sr-only">
        {evidence.kind} — {external ? '(opens in a new tab)' : ''}
      </span>
    </a>
  )
}
