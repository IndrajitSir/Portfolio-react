export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  verySlow: 1.0,
} as const

export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const SECTION_IDS = {
  hero: 'hero',
  about: 'about',
  skills: 'skills',
  experience: 'experience',
  projects: 'projects',
  education: 'education',
  certifications: 'certifications',
  contact: 'contact',
} as const

export const COLORS = {
  accent: {
    teal: '#5eead4',
    indigo: '#818cf8',
    orange: '#fb923c',
  },
  bg: {
    primary: '#08090d',
    secondary: '#0d0f17',
    tertiary: '#12141f',
  },
} as const
