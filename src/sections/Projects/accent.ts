import type { AccentKey, Project } from '@/types'

/**
 * Which accent a project is drawn in.
 *
 * A project may name its own accent; the rest alternate with their position in
 * the carousel, so consecutive cards never read as one block. The card and the
 * case-study panel both ask here, which is what keeps the panel looking like the
 * same document as the card it came from.
 */
export const accentKey = (project: Project, index: number): AccentKey =>
  project.accent ?? (index % 2 === 0 ? 'teal' : 'indigo')