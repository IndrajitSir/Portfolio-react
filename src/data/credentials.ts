import type { Credential, CredentialKind } from '@/types'

/**
 * Every credential, learning milestone and competition entry, typed by kind.
 *
 * The distinction matters and is enforced here rather than in prose: a Microsoft
 * Learn badge is a knowledge signal, a certificate is issued on completion, a
 * workshop is attendance, and a competition entry is participation. The UI reads
 * `kind` and labels each one accordingly, so nothing is overstated.
 *
 * Entries marked `needs-review` were supplied as a scanned document but are not
 * described in the source material. They are shown as provisional rather than
 * presented as verified.
 */

/** Plain-language labels for each credential kind. */
export const CREDENTIAL_KIND_LABEL: Record<CredentialKind, string> = {
  certificate: 'Certificate',
  badge: 'Learning badge',
  workshop: 'Workshop',
  bootcamp: 'Bootcamp',
  competition: 'Competition',
  learning: 'Self-directed learning',
}

/** A one-line explanation of what the kind actually means, shown on detail. */
export const CREDENTIAL_KIND_NOTE: Record<CredentialKind, string> = {
  certificate: 'Issued on completion of a defined course of study.',
  badge: 'A Microsoft Learn or HackerRank knowledge badge — a learning signal, not a professional certification.',
  workshop: 'Attended a workshop. Attendance only — not a qualification.',
  bootcamp: 'An intensive, time-boxed training programme.',
  competition: 'Entered and completed a competition or quiz.',
  learning: 'Self-directed study with publicly documented progress.',
}

export const credentials: Credential[] = [
  // ── Certifications ───────────────────────────────────────────────────────
  {
    id: 'efset',
    title: 'EF SET English Certificate — B2 Upper-Intermediate',
    issuer: 'EF Education First',
    kind: 'certificate',
    status: 'verified',
    area: 'Professional English',
    description:
      'Scored 58/100, achieving B2 Upper-Intermediate. A verified certificate with a public verification link.',
    url: 'https://cert.efset.org/yXKKuy',
    icon: '🌍',
    accent: 'teal',
  },
  {
    id: 'csde',
    title: 'CSDE — Certificate in Service Desk Executive',
    issuer: 'Anudip Foundation · METTL',
    kind: 'certificate',
    status: 'verified',
    area: 'IT and service desk operations',
    description:
      'IT and soft-skills certification covering service desk operations, customer support and communication.',
    icon: '🎖️',
    accent: 'indigo',
  },

  // ── HackerRank ───────────────────────────────────────────────────────────
  {
    id: 'hackerrank-java',
    title: 'Java Badge',
    issuer: 'HackerRank',
    kind: 'badge',
    status: 'verified',
    area: 'Java · Problem solving',
    description:
      'The first Java badge earned and publicly shared — the earliest documented coding milestone in the journey.',
    sourceUrl: 'https://lnkd.in/p/dy_-z43J',
    icon: '☕',
    accent: 'orange',
  },
  {
    id: 'hackerrank-skill',
    title: 'HackerRank Skill Certificate',
    issuer: 'HackerRank',
    kind: 'certificate',
    status: 'verified',
    area: 'Problem solving',
    description:
      'Coding challenges documented as the experience that improved problem-solving skills and expanded programming knowledge.',
    sourceUrl: 'https://lnkd.in/p/dRdnd2dj',
    icon: '🥇',
    accent: 'orange',
  },

  // ── Microsoft Learn ──────────────────────────────────────────────────────
  {
    id: 'ms-nodejs',
    title: 'Introduction to Node.js',
    issuer: 'Microsoft Learn',
    kind: 'badge',
    status: 'verified',
    area: 'Node.js · Backend',
    description:
      'Microsoft Learn badge covering Node.js — part of the documented shift toward backend development.',
    sourceUrl: 'https://lnkd.in/p/dGekP9be',
    icon: '🟢',
    accent: 'green',
  },
  {
    id: 'ms-genai',
    title: 'Fundamentals of Generative AI',
    issuer: 'Microsoft Learn',
    kind: 'badge',
    status: 'verified',
    area: 'Generative AI',
    description:
      'A learning-area badge. This is foundational exposure to generative AI, not professional ML engineering experience.',
    sourceUrl: 'https://lnkd.in/p/dGJiXNRw',
    icon: '✨',
    accent: 'violet',
  },
  {
    id: 'ms-ai-concepts',
    title: 'Fundamental AI Concepts',
    issuer: 'Microsoft Learn',
    kind: 'badge',
    status: 'verified',
    area: 'Artificial intelligence',
    description: 'Microsoft Learn badge covering fundamental AI concepts.',
    sourceUrl: 'https://lnkd.in/p/dPX7z9SJ',
    icon: '🧠',
    accent: 'violet',
  },
  {
    id: 'ms-ml',
    title: 'Fundamentals of Machine Learning',
    issuer: 'Microsoft Learn',
    kind: 'badge',
    status: 'verified',
    area: 'Machine learning',
    description:
      'Microsoft Learn badge in machine learning fundamentals — a learning area alongside data science.',
    sourceUrl: 'https://lnkd.in/p/dc8pHhPy',
    icon: '📈',
    accent: 'violet',
  },

  // ── Workshops & bootcamps ────────────────────────────────────────────────
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Awareness Workshop',
    issuer: 'Data Space Security',
    kind: 'workshop',
    status: 'verified',
    period: '23 November 2022 · 3 days',
    area: 'Security awareness',
    description:
      'A three-day cybersecurity awareness workshop — an early documented point in the journey, and the earliest documented link to security.',
    sourceUrl: 'https://lnkd.in/p/d3cnYcNa',
    evidenceImage: '/LinkedIn/33_Indrajit%20Mandal-2022-11-28.jpeg',
    icon: '🛡️',
    accent: 'orange',
  },
  {
    id: 'node-mongo-bootcamp',
    title: 'Node.js + MongoDB Backend Bootcamp',
    issuer: 'Intensive backend programme',
    kind: 'bootcamp',
    status: 'verified',
    period: '7 days',
    area: 'Node.js · MongoDB · Backend architecture',
    description:
      'A seven-day intensive on Node.js, MongoDB, backend architecture and server-side programming, with hands-on application development.',
    sourceUrl: 'https://lnkd.in/p/djvPR3Um',
    icon: '⚙️',
    accent: 'teal',
  },
  {
    id: 'git-github',
    title: 'Git & GitHub for Beginners',
    issuer: 'Microsoft Learn Student Ambassadors',
    kind: 'workshop',
    status: 'verified',
    area: 'Version control · Collaboration',
    description:
      'A workshop on version control and collaborative development, delivered with Microsoft Learn Student Ambassadors.',
    sourceUrl: 'https://lnkd.in/p/dm7JG8aj',
    icon: '🐙',
    accent: 'indigo',
  },
  {
    id: 'career-webinar',
    title: 'Career Guidance Webinar',
    issuer: 'Skill Dunia Edutech · E-Cell IIT Hyderabad',
    kind: 'workshop',
    status: 'verified',
    period: '31 May 2025',
    area: 'Career development',
    description:
      'A career guidance session on technology career opportunities and planning, run with E-Cell IIT Hyderabad.',
    sourceUrl: 'https://lnkd.in/p/d7PY97fK',
    icon: '🎯',
    accent: 'indigo',
  },

  // ── Self-directed learning ───────────────────────────────────────────────
  {
    id: 'java-75-days',
    title: '75 Days Learning Challenge — Java',
    issuer: 'Self-directed',
    kind: 'learning',
    status: 'verified',
    area: 'Java · OOP · DSA',
    description:
      'A 75-day Java learning challenge. Day 21 is publicly documented: multiple inheritance implemented using interfaces.',
    sourceUrl: 'https://lnkd.in/p/dEuwP_zW',
    icon: '📆',
    accent: 'orange',
  },

  // ── Competitions ─────────────────────────────────────────────────────────
  {
    id: 'rbi-90',
    title: 'RBI@90 Nationwide Online Quiz',
    issuer: 'Reserve Bank of India · Kazi Nazrul University',
    kind: 'competition',
    status: 'verified',
    period: '2024',
    area: 'Financial literacy · Banking awareness',
    description:
      'Participation certificate in a nationwide online quiz covering financial literacy, banking awareness and RBI initiatives.',
    sourceUrl: 'https://lnkd.in/p/dpBbU42w',
    evidenceImage: '/LinkedIn/RBI_90%20participation.jpg',
    icon: '🏅',
    accent: 'teal',
  },
  {
    id: 'tata-crucible',
    title: 'TATA Crucible Campus Quiz',
    issuer: 'TATA · RICIS Institution, Raniganj',
    kind: 'competition',
    status: 'verified',
    period: '2024',
    area: 'General knowledge · Competition',
    description:
      'Represented RICIS Institution, Raniganj in the TATA Crucible Campus Quiz, entering through Unstop.',
    sourceUrl: 'https://lnkd.in/p/dM5_zVGb',
    icon: '🏆',
    accent: 'orange',
  },
  {
    id: 'lld-hackathon',
    title: 'Coder Army LLD Hackathon',
    issuer: 'Coder Army',
    kind: 'competition',
    status: 'verified',
    period: '2025 · one-week submission window',
    area: 'Low-level design · Design patterns',
    description:
      'A low-level design submission applying SOLID, encapsulation and five design patterns, documented with UML class, sequence and happy-flow diagrams.',
    sourceUrl: 'https://lnkd.in/p/dT2GkJmH',
    icon: '🏗️',
    accent: 'violet',
  },

  // ── Provisional ──────────────────────────────────────────────────────────
  {
    id: 'guvi',
    title: 'Guvi Certification',
    issuer: 'Guvi',
    kind: 'certificate',
    status: 'needs-review',
    area: 'Not yet documented',
    description:
      'A scanned Guvi certification was supplied as evidence but no source describes its course, date or result. Details are pending verification.',
    evidenceImage: '/LinkedIn/GuviCertification%20-%20h48815w37zu5M337a1.png',
    icon: '📜',
    accent: 'indigo',
  },
]

/** Credentials grouped by kind, for the filter rail. */
export const credentialKinds = (
  Object.keys(CREDENTIAL_KIND_LABEL) as CredentialKind[]
).filter((kind) => credentials.some((c) => c.kind === kind))

/** The earliest period string that looks like a year, for chronological sorting. */
const yearOf = (credential: Credential): number | null => {
  const match = credential.period?.match(/(19|20)\d{2}/)
  return match ? Number(match[0]) : null
}

/** Verified credentials first, then provisional, each newest year first. */
export const sortedCredentials = [...credentials].sort((a, b) => {
  if (a.status !== b.status) return a.status === 'verified' ? -1 : 1
  const yearA = yearOf(a)
  const yearB = yearOf(b)
  if (yearA !== null && yearB !== null && yearA !== yearB) return yearB - yearA
  return a.title.localeCompare(b.title)
})