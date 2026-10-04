import type { SourceRecord } from '@/types'

/**
 * Verified sources behind the claims in this portfolio.
 *
 * Every entry points at a public LinkedIn post the profile owner shared, so any
 * visitor can check a milestone rather than take the portfolio's word for it.
 *
 * Integrity rule for this file: add new sources, never silently rewrite an old
 * one. If two sources disagree, the conflict is flagged in the data layer rather
 * than resolved by guessing.
 */

export const sources: SourceRecord[] = [
  // ── Early programming ────────────────────────────────────────────────────
  {
    id: 'hackerrank-java',
    label: 'First Java badge on HackerRank',
    url: 'https://lnkd.in/p/dy_-z43J',
    supports: 'Journey · Learn to code · Credential: HackerRank Java',
  },
  {
    id: 'hackerrank-skill',
    label: 'HackerRank Skill Certificate',
    url: 'https://lnkd.in/p/dRdnd2dj',
    supports: 'Journey · Learn to code · Credential: HackerRank Skill Certificate',
  },
  {
    id: 'java-75-days',
    label: '75 Days Learning Challenge — Java, day 21',
    url: 'https://lnkd.in/p/dEuwP_zW',
    supports: 'Journey · Learn to code · Credential: 75 Days Java Challenge',
  },

  // ── Security ─────────────────────────────────────────────────────────────
  {
    id: 'cybersecurity-workshop',
    label: 'Cybersecurity Awareness Workshop (Data Space Security)',
    url: 'https://lnkd.in/p/d3cnYcNa',
    supports: 'Credential: Cybersecurity Awareness Workshop',
  },

  // ── SystemTron internship ────────────────────────────────────────────────
  {
    id: 'systemtron-start',
    label: 'Joining SystemTron as a web development intern',
    url: 'https://lnkd.in/p/dRJE79Sp',
    supports: 'Experience: SystemTron · Journey: Build something',
  },
  {
    id: 'systemtron-netflix',
    label: 'SystemTron task 2 — Netflix clone',
    url: 'https://lnkd.in/p/dNXW6RPa',
    supports: 'Journey: Build something',
  },
  {
    id: 'systemtron-todo',
    label: 'SystemTron task 3 — To-do website',
    url: 'https://lnkd.in/p/d_yAxHFQ',
    supports: 'Journey: Build something',
  },
  {
    id: 'systemtron-connect4',
    label: 'SystemTron task 4 — Connect Four',
    url: 'https://lnkd.in/p/d2yUSsRq',
    supports: 'Journey: Build something',
  },
  {
    id: 'systemtron-reflection',
    label: 'SystemTron internship reflection (22 Apr – 19 May 2024)',
    url: 'https://lnkd.in/p/d3cnYcNa',
    supports: 'Experience: SystemTron',
  },

  // ── Competitions ─────────────────────────────────────────────────────────
  {
    id: 'rbi-90',
    label: 'RBI@90 Nationwide Online Quiz 2024',
    url: 'https://lnkd.in/p/dpBbU42w',
    supports: 'Credential: RBI@90 Nationwide Online Quiz',
  },
  {
    id: 'tata-crucible',
    label: 'TATA Crucible Campus Quiz 2024 (RICIS Institution, Raniganj)',
    url: 'https://lnkd.in/p/dM5_zVGb',
    supports: 'Credential: TATA Crucible Campus Quiz',
  },

  // ── AI / ML learning ─────────────────────────────────────────────────────
  {
    id: 'ms-genai',
    label: 'Fundamentals of Generative AI badge',
    url: 'https://lnkd.in/p/dGJiXNRw',
    supports: 'Credential: Fundamentals of Generative AI',
  },
  {
    id: 'ms-ai-concepts',
    label: 'Fundamental AI Concepts badge',
    url: 'https://lnkd.in/p/dPX7z9SJ',
    supports: 'Credential: Fundamental AI Concepts',
  },
  {
    id: 'ms-ml',
    label: 'Fundamentals of Machine Learning badge',
    url: 'https://lnkd.in/p/dc8pHhPy',
    supports: 'Credential: Fundamentals of Machine Learning',
  },

  // ── Backend & tooling ────────────────────────────────────────────────────
  {
    id: 'ms-nodejs',
    label: 'Introduction to Node.js badge',
    url: 'https://lnkd.in/p/dGekP9be',
    supports: 'Credential: Introduction to Node.js',
  },
  {
    id: 'node-mongo-bootcamp',
    label: '7-day Node.js + MongoDB backend bootcamp',
    url: 'https://lnkd.in/p/djvPR3Um',
    supports: 'Credential: Node.js + MongoDB bootcamp · Journey: Understand the backend',
  },
  {
    id: 'git-github-workshop',
    label: 'Git & GitHub for Beginners workshop (Microsoft Learn Student Ambassadors)',
    url: 'https://lnkd.in/p/dm7JG8aj',
    supports: 'Credential: Git & GitHub for Beginners',
  },
  {
    id: 'career-webinar',
    label: 'Career Guidance Webinar — Skill Dunia Edutech × E-Cell IIT Hyderabad (31 May 2025)',
    url: 'https://lnkd.in/p/d7PY97fK',
    supports: 'Credential: Career Guidance Webinar',
  },

  // ── Full stack ───────────────────────────────────────────────────────────
  {
    id: 'mern-internship',
    label: 'Industrial Internship — Full Stack Web Development (MERN), Ardent Computech',
    url: 'https://lnkd.in/p/dKbPKHbq',
    supports: 'Experience: Ardent Computech · Project: Campus Placement Recruitment System',
  },

  // ── System design ────────────────────────────────────────────────────────
  {
    id: 'lld-hackathon',
    label: 'Coder Army LLD Hackathon — submission',
    url: 'https://lnkd.in/p/dT2GkJmH',
    supports: 'Journey: Think in systems',
  },
  {
    id: 'lld-reflection',
    label: 'LLD design patterns and design-write-up reflection',
    url: 'https://lnkd.in/p/dtQsCvQt',
    supports: 'Journey: Think in systems',
  },

  // ── Open source ──────────────────────────────────────────────────────────
  {
    id: 'nest-auth-release',
    label: 'First open-source npm packages — @indrajitsir/nest-auth-core',
    url: 'https://lnkd.in/p/d2DYsU7X',
    supports: 'Project: NestJS Authorization Library · Journey: Build for other developers',
  },
]

/** Look a source up by id. */
export const sourceById = (id: string): SourceRecord | undefined =>
  sources.find((s) => s.id === id)