import type { MotionValue } from 'framer-motion'

/**
 * Everything a chapter stage needs, passed down by the dispatcher.
 *
 * `progress` is 0→1 across the chapter's own block. It is pinned at 1 for
 * reduced-motion visitors, so a stage that animates from its beats renders its
 * finished state and never needs a second code path.
 */
export interface StageProps {
  /** 0→1 scroll progress through this chapter, pinned at 1 under reduced motion. */
  progress: MotionValue<number>
  /** Theme-aware accent colour for this chapter, e.g. "var(--accent-teal)". */
  accent: string
  /** rgb triplet for the same accent, e.g. "94,234,212". */
  rgb: string
  /** Chapters already passed, 0–8 — lights the accumulating ticks. */
  travelled: number
  /** True on a small viewport, where the drawing sheds its detail. */
  compact: boolean
}