// ─── Resume / Data Types ────────────────────────────────────────────────────

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

export interface Skill {
  name: string
  level: number // 0-100
}

export interface SkillCategory {
  id: string
  title: string
  icon: string
  skills: Skill[]
  tags?: string[]
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

export interface Certification {
  id: string
  title: string
  issuer: string
  description: string
  url?: string
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
