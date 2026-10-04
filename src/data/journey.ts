import type { JourneyChapter } from '@/types'

/**
 * The engineering journey, in order.
 *
 * These chapters are the narrative backbone of the portfolio. Each one is written
 * from documented milestones only — a public post, a shipped project, a role, or
 * a credential. Nothing here invents a hardship, a motive, or a turning point
 * that the sources do not state.
 *
 * Where a date could not be verified, the chapter says so instead of guessing.
 */
export const journeyChapters: JourneyChapter[] = [
  {
    id: 'learn',
    index: 'I',
    year: 'Early',
    title: 'Learn to code',
    kicker: 'Foundations',
    summary:
      'Java, object-oriented thinking and repeated problem solving. The first documented milestone was a Java badge on HackerRank, followed by a HackerRank Skill Certificate.',
    shift: 'From writing code to being challenged on it.',
    kind: 'learning',
    accent: 'teal',
    sourceUrl: 'https://lnkd.in/p/dy_-z43J',
    milestones: [
      {
        id: 'hackerrank-java',
        label: 'First Java badge',
        detail: 'HackerRank — the first publicly shared coding milestone.',
        href: 'https://lnkd.in/p/dy_-z43J',
      },
      {
        id: 'hackerrank-skill',
        label: 'HackerRank Skill Certificate',
        detail: 'Coding challenges described as the way the problem-solving skills improved.',
        href: 'https://lnkd.in/p/dRdnd2dj',
      },
      {
        id: 'java-75-days',
        label: '75 Days Learning Challenge — Java',
        detail: 'Day 21 documented: multiple inheritance implemented with interfaces.',
        href: 'https://lnkd.in/p/dEuwP_zW',
      },
      {
        id: 'cybersecurity-workshop',
        label: 'Cybersecurity awareness workshop',
        detail: 'A three-day workshop by Data Space Security, 23 November 2022.',
        href: 'https://lnkd.in/p/d3cnYcNa',
      },
    ],
    explore: { label: 'See the credentials behind this', href: '#credentials' },
  },
  {
    id: 'build',
    index: 'II',
    year: '2024',
    title: 'Build something',
    kicker: 'First real applications',
    summary:
      'A four-week web development internship at SystemTron, 22 April to 19 May 2024. Four tasks, each one a working front-end application.',
    shift: 'From exercises to applications someone could actually use.',
    kind: 'build',
    accent: 'indigo',
    sourceUrl: 'https://lnkd.in/p/dRJE79Sp',
    milestones: [
      {
        id: 'systemtron',
        label: 'SystemTron internship',
        detail: 'Web development intern, 22 April – 19 May 2024.',
        href: 'https://lnkd.in/p/dRJE79Sp',
      },
      {
        id: 'calculator',
        label: 'Calculator',
        detail: 'The first internship task — interface and UI implementation.',
        href: 'https://lnkd.in/p/dRJE79Sp',
      },
      {
        id: 'netflix',
        label: 'Netflix clone',
        detail: 'The second task — UI design and frontend implementation.',
        href: 'https://lnkd.in/p/dNXW6RPa',
      },
      {
        id: 'todo',
        label: 'To-do website',
        detail: 'The third task — a practical user-interface application.',
        href: 'https://lnkd.in/p/d_yAxHFQ',
      },
      {
        id: 'connect4',
        label: 'Connect Four',
        detail: 'The fourth task — game logic and algorithmic thinking.',
        href: 'https://lnkd.in/p/d2yUSsRq',
      },
    ],
    explore: { label: 'See the role in detail', href: '#experience' },
  },
  {
    id: 'compete',
    index: 'III',
    year: '2024',
    title: 'Take the challenge',
    kicker: 'Working under constraints',
    summary:
      'Two national-level quiz entries in 2024: the RBI@90 Nationwide Online Quiz, associated with Kazi Nazrul University, and the TATA Crucible Campus Quiz, representing RICIS Institution, Raniganj.',
    shift: 'From building alone to performing in front of an audience.',
    kind: 'recognition',
    accent: 'orange',
    sourceUrl: 'https://lnkd.in/p/dpBbU42w',
    milestones: [
      {
        id: 'rbi-90',
        label: 'RBI@90 Nationwide Online Quiz',
        detail: 'Participation certificate, 2024 — financial literacy and banking awareness.',
        href: 'https://lnkd.in/p/dpBbU42w',
      },
      {
        id: 'tata',
        label: 'TATA Crucible Campus Quiz',
        detail: 'Represented RICIS Institution, Raniganj, via Unstop.',
        href: 'https://lnkd.in/p/dM5_zVGb',
      },
    ],
    explore: { label: 'See the recognition', href: '#credentials' },
  },
  {
    id: 'backend',
    index: 'IV',
    year: '2025',
    title: 'Understand the backend',
    kicker: 'Server-side focus',
    summary:
      'A documented shift toward Node.js, MongoDB and backend architecture — a seven-day intensive bootcamp, an Introduction to Node.js badge, and the same year’s Microsoft Learn AI and machine learning fundamentals badges.',
    shift: 'From the browser to the server and the database behind it.',
    kind: 'learning',
    accent: 'violet',
    sourceUrl: 'https://lnkd.in/p/djvPR3Um',
    milestones: [
      {
        id: 'node-bootcamp',
        label: 'Node.js + MongoDB bootcamp',
        detail: 'A seven-day intensive on backend architecture, databases and server-side programming.',
        href: 'https://lnkd.in/p/djvPR3Um',
      },
      {
        id: 'node-badge',
        label: 'Introduction to Node.js',
        detail: 'Microsoft Learn badge.',
        href: 'https://lnkd.in/p/dGekP9be',
      },
      {
        id: 'genai',
        label: 'Fundamentals of Generative AI',
        detail: 'Microsoft Learn badge — a learning area, not professional ML work.',
        href: 'https://lnkd.in/p/dGJiXNRw',
      },
      {
        id: 'ml',
        label: 'Fundamentals of Machine Learning',
        detail: 'Microsoft Learn badge.',
        href: 'https://lnkd.in/p/dc8pHhPy',
      },
      {
        id: 'ai-concepts',
        label: 'Fundamental AI Concepts',
        detail: 'Microsoft Learn badge.',
        href: 'https://lnkd.in/p/dPX7z9SJ',
      },
    ],
    explore: { label: 'See the toolkit this built', href: '#skills' },
  },
  {
    id: 'systems',
    index: 'V',
    year: '2025',
    title: 'Build a real system',
    kicker: 'Full stack, end to end',
    summary:
      'An industrial internship in full-stack web development with the MERN stack at Ardent Computech, producing the Campus Placement Recruitment System — a multi-role portal covering the whole placement lifecycle.',
    shift: 'From single features to a system with roles, data and a lifecycle.',
    kind: 'build',
    accent: 'teal',
    sourceUrl: 'https://lnkd.in/p/dKbPKHbq',
    milestones: [
      {
        id: 'mern',
        label: 'MERN industrial internship',
        detail: 'Full-stack web development at Ardent Computech, 2025.',
        href: 'https://lnkd.in/p/dKbPKHbq',
      },
      {
        id: 'cprs',
        label: 'Campus Placement Recruitment System',
        detail: 'The internship project — student, company and admin roles.',
        href: '#projects',
      },
      {
        id: 'git-github',
        label: 'Git & GitHub for Beginners',
        detail: 'Workshop run by Microsoft Learn Student Ambassadors.',
        href: 'https://lnkd.in/p/dm7JG8aj',
      },
      {
        id: 'career-webinar',
        label: 'Career Guidance Webinar',
        detail: 'Skill Dunia Edutech with E-Cell IIT Hyderabad, 31 May 2025.',
        href: 'https://lnkd.in/p/d7PY97fK',
      },
    ],
    explore: { label: 'Explore the project', href: '#projects' },
  },
  {
    id: 'design',
    index: 'VI',
    year: '2025',
    title: 'Think in systems',
    kicker: 'Low-level design',
    summary:
      'A Coder Army LLD Hackathon entry built on SOLID, encapsulation and five design patterns, documented with a UML class diagram, a sequence diagram and a happy-flow diagram. The first submission shipped without a README — that omission became the lesson that shaped the write-up.',
    shift: 'From making code work to deciding how the code should be shaped.',
    kind: 'design',
    accent: 'orange',
    sourceUrl: 'https://lnkd.in/p/dT2GkJmH',
    milestones: [
      {
        id: 'lld-hackathon',
        label: 'Coder Army LLD Hackathon',
        detail: 'A one-week submission with prototype code and in-memory implementation.',
        href: 'https://lnkd.in/p/dT2GkJmH',
      },
      {
        id: 'patterns',
        label: 'Strategy, Factory, Singleton, Observer, Decorator',
        detail: 'The design patterns applied, with UML and sequence diagrams.',
        href: 'https://lnkd.in/p/dtQsCvQt',
      },
      {
        id: 'lesson',
        label: 'The missing README',
        detail: 'The first submission omitted the README; the repository was then updated with the full design explanation and diagrams.',
        href: 'https://lnkd.in/p/dtQsCvQt',
      },
    ],
    explore: { label: 'See this applied in the work', href: '#experience' },
  },
  {
    id: 'ship',
    index: 'VII',
    year: '2026',
    title: 'Work on production backend',
    kicker: 'Distronix',
    summary:
      'Junior Software Developer at Distronix, building the backend foundations a finance-focused NestJS application runs on: an authorization system, a file-scanning service, and an indexing pass across 150+ database models.',
    shift: 'From systems I designed to systems other people depend on daily.',
    kind: 'work',
    accent: 'teal',
    sourceUrl: 'https://lnkd.in/p/in/indrajit-mandal-34a9842a5',
    milestones: [
      {
        id: 'auth-system',
        label: 'Authorization system from scratch',
        detail: 'Role and resource-based access control for a finance-focused NestJS application.',
        href: '#experience',
      },
      {
        id: 'filescanner',
        label: 'FileScanner service',
        detail: 'ClamAV integration with metadata stripping before files reach storage.',
        href: '#experience',
      },
      {
        id: 'indexing',
        label: '150+ models indexed',
        detail: 'An indexing strategy pass chosen from real access patterns.',
        href: '#experience',
      },
    ],
    explore: { label: 'Follow the role', href: '#experience' },
  },
  {
    id: 'publish',
    index: 'VIII',
    year: '2026',
    title: 'Build for other developers',
    kicker: 'Open source',
    summary:
      'The authorization system became two public npm packages — @indrajitsir/nest-auth-core and @indrajitsir/nest-auth-sql-adapter, published at v0.1.0. The work behind them made the distinction between building an application and building a library: abstractions, dependencies, public APIs and extension points.',
    shift: 'From solving my own problem to shipping reusable infrastructure.',
    kind: 'open-source',
    accent: 'violet',
    sourceUrl: 'https://lnkd.in/p/d2DYsU7X',
    milestones: [
      {
        id: 'core',
        label: '@indrajitsir/nest-auth-core',
        detail: 'A persistence-agnostic authorization core for NestJS.',
        href: 'https://www.npmjs.com/package/@indrajitsir/nest-auth-core',
      },
      {
        id: 'adapter',
        label: '@indrajitsir/nest-auth-sql-adapter',
        detail: 'A TypeORM QueryBuilder-based SQL adapter for that core.',
        href: 'https://www.npmjs.com/package/@indrajitsir/nest-auth-sql-adapter',
      },
      {
        id: 'lesson',
        label: 'Application vs. library',
        detail: 'Designing for future users rather than for a single application.',
        href: 'https://lnkd.in/p/d2DYsU7X',
      },
    ],
    explore: { label: 'Open the case study', href: '#projects' },
  },
]

/** Chapters keyed by id, for cross-section lookups. */
export const chapterById = (id: string): JourneyChapter | undefined =>
  journeyChapters.find((c) => c.id === id)