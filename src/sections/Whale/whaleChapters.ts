import {
  experiences,
  journeyChapters,
  personalInfo,
  projects,
  skillCategories,
} from '@/data'
import { clamp } from '@/utils'

/**
 * The six containers on the whale's back are the portfolio's real chapters.
 *
 * Nothing here is invented for the 3D scene: every line comes from the data the
 * rest of the portfolio already renders, and every chapter links to the section
 * that owns it. The array order is also the container order — four across the
 * base row, two on the stepped row above them.
 */
export interface WhaleChapter {
  id: string
  code: string
  label: string
  title: string
  /** Section the container opens, as a hash anchor. */
  href: string
  summary: string
  facts: string[]
  links: { label: string; href: string; external?: boolean }[]
}

const role = experiences[0]

export const whaleChapters: WhaleChapter[] = [
  {
    id: 'about',
    code: 'CH-01',
    label: 'Identity',
    title: 'The engineer behind the work',
    href: '#about',
    summary: personalInfo.tagline,
    facts: [
      `${personalInfo.title} at ${role.company} · ${role.period}`,
      `${personalInfo.location} · remote-capable`,
      'BCA, Kazi Nazrul University · CGPA 8.14',
    ],
    links: [{ label: 'Read the full profile', href: '#about' }],
  },
  {
    id: 'journey',
    code: 'CH-02',
    label: 'Journey',
    title: 'From first badge to production',
    href: '#journey',
    summary: `${journeyChapters.length} documented chapters, from a HackerRank Java badge to backend systems other people depend on daily.`,
    facts: [
      `${journeyChapters[0].year} · ${journeyChapters[0].title}`,
      `${journeyChapters[Math.floor(journeyChapters.length / 2)].year} · ${
        journeyChapters[Math.floor(journeyChapters.length / 2)].title
      }`,
      `${journeyChapters[journeyChapters.length - 1].year} · ${
        journeyChapters[journeyChapters.length - 1].title
      }`,
    ],
    links: [{ label: 'Walk the chapters', href: '#journey' }],
  },
  {
    id: 'skills',
    code: 'CH-03',
    label: 'Stack',
    title: 'The engineering toolkit',
    href: '#skills',
    summary:
      'Backend, databases and interfaces — each technology is listed only where the portfolio can evidence it.',
    facts: skillCategories
      .slice(0, 4)
      .map((category) => `${category.title} · ${category.items.length} evidence-backed skills`),
    links: [{ label: 'Open the stack', href: '#skills' }],
  },
  {
    id: 'projects',
    code: 'CH-04',
    label: 'Work',
    title: 'Shipped systems & open source',
    href: '#projects',
    summary: `${projects.length} projects, including two public npm packages published from a production authorization system.`,
    facts: projects.slice(0, 3).map((project) => `${project.title} · ${project.category}`),
    links: [{ label: 'Browse every project', href: '#projects' }],
  },
  {
    id: 'experience',
    code: 'CH-05',
    label: 'Career',
    title: 'Where the work happens',
    href: '#experience',
    summary: role.story?.summary ?? role.description[0],
    facts: experiences
      .slice(0, 4)
      .map((item) => `${item.role} — ${item.company} · ${item.period}`),
    links: [{ label: 'Read the roles in detail', href: '#experience' }],
  },
  {
    id: 'contact',
    code: 'CH-06',
    label: 'Contact',
    title: 'Open a channel',
    href: '#contact',
    summary:
      'Available for backend and full-stack roles. The fastest route is email — the contact form below reaches the same inbox.',
    facts: [personalInfo.email, personalInfo.location, 'GitHub · IndrajitSir'],
    links: [
      { label: 'Email Indrajit', href: `mailto:${personalInfo.email}`, external: true },
      { label: 'GitHub', href: personalInfo.github, external: true },
      ...(personalInfo.linkedin
        ? [{ label: 'LinkedIn', href: personalInfo.linkedin, external: true }]
        : []),
    ],
  },
]

/**
 * Final container rests, in the same order as `whaleChapters`.
 *
 * Coordinates are world units: the whale runs along X with its head at -3.5 and
 * its tail at +3.1, the back sits near y=1.1, and the containers sit on top of
 * it as chunky plates in Docker's stepped two-row stack, set forward of the
 * tail the way the mark sets them. These positions are shared by the meshes,
 * the hover labels and the camera dive.
 */
export const CONTAINER_SIZE = { width: 0.96, height: 0.92, depth: 1.1 }

export const containerPositions: [number, number, number][] = [
  [-2.14, 1.62, 0],
  [-1.08, 1.62, 0],
  [-0.02, 1.62, 0],
  [1.04, 1.62, 0],
  [-1.61, 2.56, 0],
  [-0.55, 2.56, 0],
]

/**
 * The pinned stage is split into screens of scrolling: three to assemble the
 * whale, then 1.5 per container. The viewport itself is the last screen, since a
 * sticky element only stays pinned for its section's height minus one viewport.
 *
 * A container used to get a single screen, which put its whole camera move —
 * slide to the door, dolly in, hold inside, pull back out — inside one viewport
 * of scrolling. It read as a flicker rather than a visit, so each container now
 * gets 1.5 screens: the door still opens at 36% of the screen, but the visitor
 * has ~1.5 viewports of travel either side of it instead of one.
 */
const ASSEMBLY_SCREENS = 3
const CHAPTER_SCREENS = 1.5
const TRAVEL_SCREENS = ASSEMBLY_SCREENS + whaleChapters.length * CHAPTER_SCREENS
export const WHALE_STAGE_HEIGHT = `${(TRAVEL_SCREENS + 1) * 100}svh`

/** Fraction of the pinned scroll that assembles the whale. */
export const ASSEMBLY_END = ASSEMBLY_SCREENS / TRAVEL_SCREENS

/** Within a container's screen, the camera is at the door between these. */
export const INSIDE_IN = 0.36
export const INSIDE_OUT = 0.82

/**
 * Where the scroll has taken the camera: which container (`index`) and how far
 * through its screen (`t`), plus whether the camera is inside it. Scrolling is
 * the single source of truth — the camera, the door and the interior panel all
 * read this, which is what keeps reverse scrolling and clicks consistent.
 */
export const tourState = (progress: number) => {
  const position =
    clamp((progress - ASSEMBLY_END) / (1 - ASSEMBLY_END), 0, 1) * whaleChapters.length
  const index = Math.min(whaleChapters.length - 1, Math.floor(position))
  const t = clamp(position - index, 0, 1)
  return { index, t, inside: t >= INSIDE_IN && t < INSIDE_OUT }
}

/** Scroll position that leaves the camera inside a container, for clicks and deep links. */
export const progressForChapter = (index: number) =>
  ASSEMBLY_END +
  ((index + (INSIDE_IN + INSIDE_OUT) / 2) / whaleChapters.length) * (1 - ASSEMBLY_END)
