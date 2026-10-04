import { memo, useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, type AnimationPlaybackControls } from 'framer-motion'
import { FiArrowUpRight, FiCheck } from 'react-icons/fi'
import { accentColor } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import type { JourneyChapter as JourneyChapterData } from '@/types'
import { ChapterKindMeta, chapterAnchor } from './journeyMeta'
import JourneyStage from './JourneyStage'

/**
 * One chapter of the journey.
 *
 * The same text the old card carried — title, kicker, summary, the shift, every
 * milestone with its source link, the doorway onward — set as an editorial
 * column instead of a card, because the section is no longer a list of cards and
 * a card in the middle of it would undo that.
 *
 * Nothing here is gated behind an interaction. The stage above or beside it
 * emphasises parts of the chapter; the chapter always states all of it. A
 * recruiter can read the section top to bottom with the animation off, with the
 * stage failed to load, or on a phone, and lose nothing.
 *
 * On a wide screen the stage is pinned in the left column and this block is
 * text only. Below that it drops inline, directly above the text it belongs to,
 * which is the layout a touch screen wants: the picture travels with its
 * chapter instead of being pinned somewhere else on the page.
 */

interface JourneyChapterBlockProps {
  chapter: JourneyChapterData
  /** True while this is the chapter the journey has reached. */
  active: boolean
  /** Chapters already passed, 0–8. */
  travelled: number
  /** Render the stage inline (narrow viewports). */
  showStage: boolean
  /** Small viewport: the drawing sheds detail instead of shrinking. */
  compactStage: boolean
}

function JourneyChapterBlock({
  chapter,
  active,
  travelled,
  showStage,
  compactStage,
}: JourneyChapterBlockProps) {
  const accent = accentColor[chapter.accent]
  const meta = ChapterKindMeta[chapter.kind]

  return (
    <motion.article
      id={chapterAnchor(chapter.id)}
      aria-labelledby={`${chapter.id}-title`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
      className="relative scroll-mt-44"
    >
      {/* ── Identity ──────────────────────────────────────────────── */}
      <div className="mb-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: accent }}>
            {meta.glyph} {meta.label}
          </span>
          <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
            · {chapter.year}
          </span>
          <span
            className="font-mono-code text-[0.62rem]"
            style={{ color: active ? accent : 'var(--text-muted)' }}
          >
            · {active ? 'reading now' : ''}
          </span>
        </div>
        <h3
          id={`${chapter.id}-title`}
          className="mt-1.5 font-display text-[clamp(1.45rem,3.2vw,2rem)] font-light leading-[1.15] tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {chapter.title}
        </h3>
        <p className="mt-1 font-mono-code text-[0.72rem]" style={{ color: 'var(--text-muted)' }}>
          {chapter.kicker}
        </p>
      </div>

      {showStage && (
        <div className="mb-5">
          <InlineStage chapter={chapter} travelled={travelled} compact={compactStage} />
        </div>
      )}

      {/* ── The story ─────────────────────────────────────────────── */}
      <p className="max-w-[62ch] text-[0.92rem] leading-[1.85]" style={{ color: 'var(--text-secondary)' }}>
        {chapter.summary}
      </p>

      {/* ── What actually shifted ─────────────────────────────────── */}
      <p
        className="mt-4 max-w-[62ch] border-l-2 pl-4 text-[0.92rem] font-medium leading-[1.75]"
        style={{ borderColor: accent, color: 'var(--text-primary)' }}
      >
        {chapter.shift}
      </p>

      {/* ── Milestones, always visible ────────────────────────────── */}
      <div className="mt-5">
        <p className="font-mono-code text-[0.62rem] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {chapter.milestones.length} documented milestone{chapter.milestones.length === 1 ? '' : 's'}
        </p>
        <ul className="mt-2.5 space-y-2">
          {chapter.milestones.map((milestone) => (
            <li key={milestone.id} className="flex gap-2.5 text-[0.85rem]">
              <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} aria-hidden="true" />
              {milestone.href ? (
                <a
                  href={milestone.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/milestone block rounded"
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {milestone.label}
                  </span>
                  <span className="block text-[0.8rem] leading-[1.65]" style={{ color: 'var(--text-secondary)' }}>
                    {milestone.detail}
                  </span>
                  <span
                    className="mt-0.5 inline-flex items-center gap-1 font-mono-code text-[0.6rem]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    source
                    <FiArrowUpRight
                      size={9}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover/milestone:translate-x-0.5"
                    />
                  </span>
                </a>
              ) : (
                <span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {milestone.label}
                  </span>
                  <span className="block text-[0.8rem] leading-[1.65]" style={{ color: 'var(--text-secondary)' }}>
                    {milestone.detail}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Doorway into the related section ──────────────────────── */}
      {chapter.explore && (
        <a
          href={chapter.explore.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 font-mono-code text-[0.72rem] transition-all duration-200 hover:-translate-y-0.5"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <FiCheck size={12} aria-hidden="true" style={{ color: accent }} />
          {chapter.explore.label}
          <FiArrowUpRight size={12} aria-hidden="true" />
        </a>
      )}
    </motion.article>
  )
}

/**
 * Memoised so the eight chapters do not all re-render every time the active
 * chapter changes. Chapter data is a stable module constant and only the two
 * chapters at the boundary of a transition receive new props, so the other six
 * skip rendering entirely while the reader scrolls — which is what keeps the
 * section's React work proportional to the move, not to the section's length.
 */
export default memo(JourneyChapterBlock)

/**
 * The stage when it belongs to this chapter rather than to the viewport.
 *
 * Below `lg` there is no pinned column, so the stage sits directly above the
 * text it illustrates. That means the reader meets it *before* the chapter has
 * scrolled — feeding it the chapter's scroll progress would show an almost empty
 * drawing and then scroll it away before anything had happened.
 *
 * So inline stages run their own beats: once, as they come into view. The same
 * 0→1 value feeds the same choreography, which means the picture still assembles
 * itself in order — it just does it on arrival rather than on travel.
 *
 * The drawing itself is only *mounted* while the chapter is near the viewport.
 * Eight chapter drawings all resident at once — each an SVG of well over a
 * hundred nodes, several of them with perpetual ambient loops — was a large part
 * of why the section dragged on a phone. A reserved box keeps the mount and
 * unmount from shifting the text beneath it, and the progress value is held in
 * this wrapper so a remount never replays the entrance. Reduced motion is
 * unchanged: `JourneyStage` pins the value at 1.
 */
function InlineStage({
  chapter,
  travelled,
  compact,
}: {
  chapter: JourneyChapterData
  travelled: number
  compact: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Not `once`: the drawing is released again once it is well clear of the
  // viewport, so at most a chapter or two is ever mounted.
  const near = useInView(ref, { margin: '600px 0px 600px 0px' })
  const value = useMotionValue(0)

  useEffect(() => {
    if (!near) return
    const controls: AnimationPlaybackControls = animate(value, 1, {
      duration: DURATION.cinematic * 1.5,
      ease: EASE_OUT_EXPO,
    })
    return () => controls.stop()
  }, [near, value])

  return (
    <div ref={ref} className="min-h-[340px]">
      {near && (
        <JourneyStage chapter={chapter} progress={value} travelled={travelled} compact={compact} />
      )}
    </div>
  )
}
