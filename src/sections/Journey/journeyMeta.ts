import type { ChapterKind } from '@/types'

/**
 * Presentation metadata for chapter kinds.
 *
 * Kept beside the section rather than in the data file, because glyphs and
 * labels are UI concerns — `src/data/journey.ts` stays pure facts.
 */
export const ChapterKindMeta: Record<ChapterKind, { label: string; glyph: string }> = {
  origin: { label: 'Origin', glyph: '◈' },
  learning: { label: 'Learning', glyph: '✦' },
  build: { label: 'Build', glyph: '▣' },
  design: { label: 'Design', glyph: '◇' },
  work: { label: 'Work', glyph: '◆' },
  'open-source': { label: 'Open source', glyph: '⬡' },
  recognition: { label: 'Recognition', glyph: '✧' },
}

/** Stable DOM id for a chapter, so the chapter rail can jump to it. */
export const chapterAnchor = (id: string): string => `chapter-${id}`