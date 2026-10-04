import type { AccentKey, Experience } from '@/types'
import { experiences } from '@/data'

/**
 * Presentation metadata for the career section.
 *
 * Kept beside the section rather than in `src/data/experience.ts`, because glyphs,
 * labels and accents are UI concerns — the data file stays pure facts.
 */

/**
 * Each role carries the accent of the work it represents, so the thread gradient
 * reads as a progression rather than four unrelated colours.
 */
const ROLE_ACCENT: Record<string, AccentKey> = {
  distronix: 'teal',
  'jai-balaji': 'orange',
  'ardent-computech': 'indigo',
  systemtron: 'violet',
}

export const accentFor = (id: string): AccentKey => ROLE_ACCENT[id] ?? 'teal'

/**
 * Engagement type, stated plainly.
 *
 * Internships are kept visually distinct from employment so a short placement is
 * never read as a permanent role. The label is always visible, not a tooltip.
 */
export const TYPE_LABEL: Record<Experience['type'], string> = {
  fulltime: 'Full-time',
  parttime: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
}

/** The glyph and wording that open each milestone. */
export const roleKind = (experience: Experience): { glyph: string; label: string } =>
  experience.type === 'internship'
    ? { glyph: '✦', label: 'Internship' }
    : { glyph: '◆', label: 'Employment' }

/**
 * Roles oldest first.
 *
 * The data is newest first, which is right for a list and wrong for a journey:
 * a career is read from the first placement to the current one, so the reader
 * travels the same direction the thread draws.
 */
export const careerRoles: Experience[] = [...experiences].reverse()

/** Every stage across every flow of every role — the count the section reports. */
export const TOTAL_SYSTEMS = careerRoles.reduce(
  (sum, role) => sum + (role.story?.flows.length ?? 0),
  0,
)

/** Stable DOM id for a role, so the compass and the thread can point at it. */
export const roleAnchor = (id: string): string => `role-${id}`

/** Zero-padded position in the career, used by the stations and the compass. */
export const roleIndex = (index: number): string => String(index + 1).padStart(2, '0')