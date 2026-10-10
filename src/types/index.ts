// ─── Resume / Data Types ────────────────────────────────────────────────────

export * from './avatar'

export interface PersonalInfo {
  name: string
  title: string
  tagline: string
  email: string
  phone: string
  location: string
  github: string
  resumeUrl?: string
  linkedin?: string
  website?: string
  available: boolean
}

// ─── Evidence ───────────────────────────────────────────────────────────────
//
// The portfolio used to attach a self-assigned 0-100 number to every skill.
// Those numbers were not measured by anything, so they have been removed.
//
// A skill claim is now only ever accompanied by a pointer to the place in this
// portfolio that actually backs it up: a shipped project, a role, a credential,
// or a documented learning activity. If nothing evidences a skill, it does not
// get claimed.

/** What kind of record backs a technology claim. */
export type EvidenceKind = 'project' | 'role' | 'credential' | 'learning'

export interface SkillEvidence {
  kind: EvidenceKind
  /** Human-readable pointer, e.g. "NestJS Authorization Library". */
  label: string
  /** Where the evidence lives — a portfolio anchor, repo, or public post. */
  href?: string
}

export interface Skill {
  name: string
  /** Every place in the portfolio that demonstrates this technology. */
  evidence: SkillEvidence[]
}

export interface SkillCategory {
  id: string
  title: string
  icon: string
  /** One line on what this domain is actually used for. */
  summary: string
  /** Named capabilities in this domain, each carrying its evidence. */
  items: Skill[]
  /** Ids of domains this one flows into — drawn as links on the map. */
  connects: string[]
}

// ─── Journey ────────────────────────────────────────────────────────────────

/** The kind of shift a chapter marks. Used to pick its glyph and accent. */
export type ChapterKind =
  | 'origin'
  | 'learning'
  | 'build'
  | 'design'
  | 'work'
  | 'open-source'
  | 'recognition'

export interface Milestone {
  id: string
  label: string
  detail: string
  /** Verified link — a public post, repository, or live application. */
  href?: string
}

/**
 * One chapter of the engineering journey.
 *
 * These are chronological and factual: each `summary` and `shift` is written
 * from documented milestones only. No hardship, motivation, or turning point is
 * implied beyond what the source material states.
 */
export interface JourneyChapter {
  id: string
  index: string
  year: string
  title: string
  kicker: string
  summary: string
  /** What actually changed at this point in the work. */
  shift: string
  kind: ChapterKind
  accent: AccentKey
  milestones: Milestone[]
  /** Doorway into the portfolio section this chapter leads to. */
  explore?: { label: string; href: string }
  /** Public post that evidences the chapter. */
  sourceUrl?: string
}

// ─── Credentials ────────────────────────────────────────────────────────────

/**
 * Credentials are deliberately typed by kind.
 *
 * A Microsoft Learn badge is not the same claim as a certification, and neither
 * is the same as attending a workshop or entering a quiz. The UI renders each
 * kind differently so the portfolio never overstates what was earned.
 */
export type CredentialKind =
  | 'certificate'
  | 'badge'
  | 'workshop'
  | 'bootcamp'
  | 'competition'
  | 'learning'

/**
 * How well an entry is backed up.
 *
 * `verified` — a public post or issuer page confirms it.
 * `needs-review` — a document was supplied but no source describes it, so the
 * entry is shown as provisional rather than stated as fact.
 */
export type CredentialStatus = 'verified' | 'needs-review'

export interface Credential {
  id: string
  title: string
  issuer: string
  kind: CredentialKind
  status: CredentialStatus
  /** Display period. Only set when the source supports it. */
  period?: string
  /** Subject area this covers. */
  area: string
  description: string
  /** Only set when a real third-party verification link exists. */
  url?: string
  /** Public post that evidences the entry. */
  sourceUrl?: string
  /** Scanned document supplied as evidence. */
  evidenceImage?: string
  icon: string
  accent: AccentKey
}

/** A publicly verifiable source behind a claim in this portfolio. */
export interface SourceRecord {
  id: string
  label: string
  url: string
  /** Which part of the portfolio it supports. */
  supports: string
}

// Key into the showcase-canvas registry (see sections/Projects/ProjectCard).
export type ProjectVisual =
  | 'nest-auth'
  | 'whatsapp-alert'
  | 'placement'
  | 'omniscript'
  | 'resqgo'
  | 'grapify'
  | 'tryonix'
  | 'bubble'
  | 'generic-a'
  | 'generic-b'

export type AccentKey = 'teal' | 'indigo' | 'orange' | 'violet' | 'green'

export interface Project {
  id: string
  number: string
  title: string
  period: string
  description: string
  longDescription: string
  features: string[]
  challenges: string[]
  solutions: string[]
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  category: string
  /** Which animated showcase canvas renders this project. */
  visual?: ProjectVisual
  /** Accent colour used for the card's number, glow and tags. */
  accent?: AccentKey
  /** Marks a project whose source is publicly available. */
  openSource?: boolean
  /** One-line outcome, shown as a caption under the title. */
  highlight?: string
}

/** Compact, future-proof entries for the Side Projects collection. */
export interface SideProject {
  id: string
  number: string
  title: string
  tagline: string
  description: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  accent: AccentKey
  visual: ProjectVisual
  /** Hint shown on the preview, describing the real interaction. */
  interaction?: string
  /** Honest qualifier where functionality has boundaries (e.g. demo mode). */
  note?: string
  /** Presentation hint — `wide` spans the full row on large screens. */
  layout?: 'card' | 'wide'
}

/** A single step in a work-story flow diagram. */
export interface FlowStage {
  id: string
  label: string
  detail: string
  accent?: AccentKey
}

/** One self-explanatory narrative within a role. */
export interface ExperienceFlow {
  id: string
  label: string
  title: string
  stages: FlowStage[]
}

export interface ExperienceStory {
  /** One-sentence "what the work was". */
  summary: string
  flows: ExperienceFlow[]
}

export interface Experience {
  id: string
  role: string
  company: string
  companyUrl?: string
  period: string
  startDate: string
  endDate?: string
  current: boolean
  description: string[]
  technologies?: string[]
  type: 'fulltime' | 'parttime' | 'internship' | 'contract'
  /** Visual narrative(s) that demonstrate the actual work. */
  story?: ExperienceStory
  /** Public post that evidences the role. */
  sourceUrl?: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  university?: string
  period: string
  score: string
  scoreType: 'cgpa' | 'percentage'
  icon: string
}

export interface Language {
  name: string
  level: string
  flag: string
}

export interface NavItem {
  label: string
  href: string
}

// ─── Animation / UI Types ───────────────────────────────────────────────────

export interface AnimationVariant {
  hidden: Record<string, unknown>
  visible: Record<string, unknown>
}

export type ThemeMode = 'dark' | 'light'

export interface CursorState {
  x: number
  y: number
  isHovering: boolean
  isClicking: boolean
}