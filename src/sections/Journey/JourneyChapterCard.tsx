import { motion, useReducedMotion } from 'framer-motion'
import { FiArrowUpRight, FiCheck } from 'react-icons/fi'
import { accentColor } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import { ChapterKindMeta, chapterAnchor } from './journeyMeta'
import type { JourneyChapter } from '@/types'

interface JourneyChapterCardProps {
  chapter: JourneyChapter
  /** True while this chapter is the one the thread has reached. */
  active: boolean
}

/**
 * One chapter of the journey.
 *
 * The card is the "screen" of an explorable piece, not a trophy. A visitor can
 * read it top to bottom and get the whole story without touching anything —
 * the interactions below add depth, they never gate information.
 *
 * Storytelling principles borrowed from the Projects section (the benchmark):
 * a numbered identity, a single accent colour per chapter, progressive disclosure
 * for the detail, and an always-visible list of what it actually contains.
 */
export default function JourneyChapterCard({ chapter, active }: JourneyChapterCardProps) {
  const reduceMotion = useReducedMotion()
  const accent = accentColor[chapter.accent]
  const meta = ChapterKindMeta[chapter.kind]

  return (
    <motion.article
      id={chapterAnchor(chapter.id)}
      initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: DURATION.reveal, ease: EASE_OUT_EXPO }}
      className="relative scroll-mt-28"
      aria-labelledby={`${chapter.id}-title`}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border p-6 backdrop-blur-md
          transition-colors duration-500 sm:p-7
        `}
        style={{
          borderColor: active ? 'var(--border-glow)' : 'var(--border)',
          background: active ? 'var(--surface-hover)' : 'var(--surface)',
        }}
      >
        {/* Left rail in the chapter's accent — marks "you are here". */}
        <span
          aria-hidden="true"
          className="absolute inset-y-5 left-0 w-[3px] origin-top rounded-full transition-transform duration-500"
          style={{
            background: `linear-gradient(to bottom, ${accent}, transparent)`,
            transform: active ? 'scaleY(1)' : 'scaleY(0.35)',
          }}
        />

        {/* ── Header: identity ─────────────────────────────────── */}
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[180px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-mono-code text-[0.62rem] uppercase tracking-widest"
                style={{ color: accent }}
              >
                {meta.glyph} {meta.label}
              </span>
              <span className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
                · {chapter.year}
              </span>
            </div>
            <h3
              id={`${chapter.id}-title`}
              className="mt-1.5 font-display text-[clamp(1.3rem,2.6vw,1.75rem)] font-light leading-tight tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {chapter.title}
            </h3>
            <p className="mt-0.5 font-mono-code text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
              {chapter.kicker}
            </p>
          </div>

          {/* Chapter numeral — mirrors the project's number treatment. */}
          <span
            className="font-display text-[3.2rem] font-light leading-none opacity-[0.14] select-none"
            style={{ color: accent }}
            aria-hidden="true"
          >
            {chapter.index}
          </span>
        </header>

        {/* ── The story ────────────────────────────────────────── */}
        <p className="text-sm leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
          {chapter.summary}
        </p>

        {/* ── What actually shifted ───────────────────────────── */}
        {/* This is the one line a recruiter skims for, so it gets its own
            treatment rather than being buried in the paragraph above. */}
        <div
          className="mt-4 flex items-start gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}
        >
          <FiCheck size={14} className="mt-0.5 shrink-0" style={{ color: accent }} aria-hidden="true" />
          <p className="text-[0.83rem] leading-[1.7]" style={{ color: 'var(--text-primary)' }}>
            {chapter.shift}
          </p>
        </div>

        {/* ── Milestones, always visible ──────────────────────── */}
        <div className="mt-5">
          <p
            className="font-mono-code text-[0.65rem] uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            {chapter.milestones.length} documented milestone{chapter.milestones.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {chapter.milestones.map((milestone) => {
              const label = (
                <>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {milestone.label}
                  </span>
                  <span className="block text-[0.78rem] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
                    {milestone.detail}
                  </span>
                </>
              )

              return (
                <li key={milestone.id} className="flex gap-2.5 items-start text-[0.83rem]">
                  <span style={{ color: accent }} aria-hidden="true">
                    ◆
                  </span>
                  {milestone.href ? (
                    <a
                      href={milestone.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/milestone rounded transition-colors hover:text-[var(--text-primary)]"
                    >
                      {label}
                      <span
                        className="mt-0.5 inline-flex items-center gap-1 font-mono-code text-[0.62rem]"
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
                    <span>{label}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── Doorway into the related section ────────────────── */}
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
            {chapter.explore.label}
            <FiArrowUpRight size={12} aria-hidden="true" />
          </a>
        )}
      </div>
    </motion.article>
  )
}