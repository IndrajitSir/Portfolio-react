/**
 * Text that appears *inside* the stage artwork.
 *
 * Two rules govern this file:
 *  1. every entry is an abbreviation of something already in
 *     `src/data/journey.ts` — a milestone label, a summary phrase, or a chapter
 *     title. Nothing here is a new claim;
 *  2. none of it is load-bearing. A visitor who never sees the artwork still has
 *     the full chapter text, the full milestone list and the source links, so
 *     shortening a label here costs nothing.
 */

import { journeyChapters } from '@/data'

/** Look a chapter up by id, throwing loudly if the artwork and the data drift. */
const chapter = (id: string) => {
  const found = journeyChapters.find((c) => c.id === id)
  if (!found) throw new Error(`Journey stage references unknown chapter: ${id}`)
  return found
}

/** Milestone labels for a chapter, in order — the raw material for stage labels. */
export const milestoneLabels = (id: string): string[] =>
  chapter(id).milestones.map((m) => m.label)

/** The four SystemTron tasks, which are what Chapter II's windows depict. */
export const BUILD_TASKS = milestoneLabels('build').slice(1)

/** The two 2024 quiz entries, split into the headline and the qualifier. */
export const COMPETE_ENTRIES = [
  { title: 'RBI@90', sub: 'Nationwide quiz' },
  { title: 'TATA Crucible', sub: 'Campus quiz' },
] as const

/** Microsoft Learn badges earned in the same year as the Node.js bootcamp. */
export const BACKEND_BADGES = [
  { short: 'GenAI', full: 'Fundamentals of Generative AI' },
  { short: 'ML', full: 'Fundamentals of Machine Learning' },
  { short: 'AI concepts', full: 'Fundamental AI Concepts' },
] as const

/** The three roles the Campus Placement Recruitment System gives its users. */
export const SYSTEM_ROLES = ['Student', 'Company', 'Admin'] as const

/**
 * The five design patterns recorded for the LLD hackathon.
 *
 * The one-line notes are standard textbook definitions of each pattern — they
 * explain the vocabulary the chapter already lists, and are not claims about how
 * the repository was built.
 */
export const DESIGN_PATTERNS = [
  { name: 'Strategy', role: 'Swap behaviour behind one interface.' },
  { name: 'Factory', role: 'Create the right implementation without naming it.' },
  { name: 'Singleton', role: 'One shared instance for state that must not repeat.' },
  { name: 'Observer', role: 'Broadcast changes to whoever is listening.' },
  { name: 'Decorator', role: 'Add behaviour by wrapping, not by editing.' },
] as const

/**
 * Distronix services, drawn from that chapter's own milestones.
 *
 * `card` is the headline that fits inside the artwork; `full` is the milestone
 * label as written, and the detail line under the controls quotes that chapter's
 * own milestone detail rather than any summary of ours.
 */
export const WORK_SERVICES = [
  { id: 'auth', short: 'Auth', card: 'Authorization', full: milestoneLabels('ship')[0] },
  { id: 'scan', short: 'Scan', card: 'FileScanner', full: milestoneLabels('ship')[1] },
  { id: 'index', short: 'Index', card: 'Indexing pass', full: milestoneLabels('ship')[2] },
] as const

/** The two published packages, verbatim from Chapter VIII's milestones. */
export const PUBLISH_PACKAGES = {
  core: milestoneLabels('publish')[0],
  adapter: milestoneLabels('publish')[1],
} as const