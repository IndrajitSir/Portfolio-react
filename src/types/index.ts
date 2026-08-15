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
