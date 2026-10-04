import type { SkillCategory } from '@/types'

/**
 * The engineering toolkit, grouped by what the domains are actually for.
 *
 * This file previously assigned each technology a self-scored 0-100 proficiency
 * number. Nothing measured those numbers, so they are gone. Every technology
 * here now carries `evidence`: a pointer to the project, role or credential in
 * this portfolio that demonstrates it. A technology with no evidence does not
 * get listed.
 *
 * Add evidence, never scores. If you ship something new, add it as a project and
 * link it here — that is how a skill earns its place.
 */

const PKG_CORE = 'https://www.npmjs.com/package/@indrajitsir/nest-auth-core'
const PKG_ADAPTER = 'https://www.npmjs.com/package/@indrajitsir/nest-auth-sql-adapter'

export const skillCategories: SkillCategory[] = [
  {
    id: 'backend',
    title: 'Backend',
    icon: '⚙️',
    summary: 'The server side — APIs, authorization and the logic behind the interface.',
    connects: ['databases', 'architecture'],
    items: [
      {
        name: 'NestJS',
        evidence: [
          { kind: 'role', label: 'Authorization system at Distronix', href: '#experience' },
          { kind: 'project', label: 'NestJS Authorization Library', href: '#projects' },
        ],
      },
      {
        name: 'Node.js',
        evidence: [
          { kind: 'role', label: 'Backend development at Distronix', href: '#experience' },
          { kind: 'role', label: 'MERN full-stack internship', href: '#experience' },
          { kind: 'credential', label: 'Introduction to Node.js badge', href: '#credentials' },
        ],
      },
      {
        name: 'Express.js',
        evidence: [
          { kind: 'role', label: 'MERN full-stack internship', href: '#experience' },
          { kind: 'project', label: 'Campus Placement Recruitment System', href: '#projects' },
        ],
      },
      {
        name: 'REST APIs',
        evidence: [
          { kind: 'role', label: 'Backend development at Distronix', href: '#experience' },
          { kind: 'project', label: 'Campus Placement Recruitment System', href: '#projects' },
        ],
      },
      {
        name: 'TypeScript',
        evidence: [
          { kind: 'project', label: 'NestJS Authorization Library', href: '#projects' },
          { kind: 'project', label: 'OmniScript', href: '#projects' },
          { kind: 'project', label: 'ResQ-Go', href: '#projects' },
        ],
      },
      {
        name: 'Authorization & RBAC',
        evidence: [
          { kind: 'project', label: 'Built as a reusable library on npm', href: PKG_CORE },
          { kind: 'role', label: 'Authorization system at Distronix', href: '#experience' },
        ],
      },
      {
        name: 'File scanning & ClamAV',
        evidence: [{ kind: 'role', label: 'FileScanner service at Distronix', href: '#experience' }],
      },
    ],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: '🗄️',
    summary: 'Relational modelling, indexing and document storage.',
    connects: ['backend'],
    items: [
      {
        name: 'MySQL',
        evidence: [{ kind: 'role', label: 'Indexing pass across 150+ models at Distronix', href: '#experience' }],
      },
      {
        name: 'PostgreSQL',
        evidence: [{ kind: 'role', label: 'Relational data workflows at Distronix', href: '#experience' }],
      },
      {
        name: 'MongoDB',
        evidence: [
          { kind: 'role', label: 'MERN full-stack internship', href: '#experience' },
          { kind: 'credential', label: 'Node.js + MongoDB bootcamp', href: '#credentials' },
        ],
      },
      {
        name: 'Indexing strategy',
        evidence: [{ kind: 'role', label: '150+ models analysed and indexed', href: '#experience' }],
      },
      {
        name: 'Prisma',
        evidence: [{ kind: 'project', label: 'ResQ-Go data layer', href: '#projects' }],
      },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    icon: '🎨',
    summary: 'Interfaces built to be understood — from first internship task to design systems.',
    connects: ['backend'],
    items: [
      {
        name: 'React.js',
        evidence: [
          { kind: 'role', label: 'MERN full-stack internship', href: '#experience' },
          { kind: 'project', label: 'OmniScript', href: '#projects' },
          { kind: 'project', label: 'ResQ-Go web app', href: '#projects' },
          { kind: 'project', label: 'GrapiFy', href: '#/side-missions' },
        ],
      },
      {
        name: 'HTML & CSS',
        evidence: [
          { kind: 'role', label: 'SystemTron web development internship', href: '#experience' },
          { kind: 'project', label: 'Bubble Game', href: '#/side-missions' },
        ],
      },
      {
        name: 'JavaScript',
        evidence: [
          { kind: 'role', label: 'SystemTron web development internship', href: '#experience' },
          { kind: 'project', label: 'OmniScript', href: '#projects' },
        ],
      },
      {
        name: 'Tailwind CSS',
        evidence: [{ kind: 'project', label: 'TryOnix AI', href: '#/side-missions' }],
      },
      {
        name: 'Next.js',
        evidence: [{ kind: 'project', label: 'ResQ-Go web app', href: '#projects' }],
      },
      {
        name: 'UI implementation',
        evidence: [{ kind: 'role', label: 'Four front-end apps at SystemTron', href: '#experience' }],
      },
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: '💻',
    summary: 'The languages behind the work, and the object-oriented thinking that ties them together.',
    connects: ['architecture'],
    items: [
      {
        name: 'Java',
        evidence: [
          { kind: 'credential', label: 'HackerRank Java badge', href: '#credentials' },
          { kind: 'credential', label: '75 Days Java Challenge', href: '#credentials' },
          { kind: 'project', label: 'WhatsApp Smart Alert App', href: '#projects' },
        ],
      },
      {
        name: 'Kotlin',
        evidence: [{ kind: 'project', label: 'WhatsApp Smart Alert App', href: '#projects' }],
      },
      {
        name: 'TypeScript',
        evidence: [{ kind: 'project', label: 'NestJS Authorization Library', href: '#projects' }],
      },
      {
        name: 'JavaScript',
        evidence: [{ kind: 'project', label: 'OmniScript', href: '#projects' }],
      },
      {
        name: 'Python',
        evidence: [{ kind: 'project', label: 'TryOnix AI', href: '#/side-missions' }],
      },
      {
        name: 'SQL',
        evidence: [{ kind: 'project', label: 'SQL adapter package', href: PKG_ADAPTER }],
      },
      {
        name: 'Bash',
        evidence: [{ kind: 'project', label: 'Script composer in OmniScript', href: '#projects' }],
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Design & Architecture',
    icon: '🏗️',
    summary: 'Deciding how the code should be shaped, not just whether it runs.',
    connects: ['open-source'],
    items: [
      {
        name: 'Low-Level Design',
        evidence: [{ kind: 'credential', label: 'Coder Army LLD Hackathon', href: '#credentials' }],
      },
      {
        name: 'SOLID principles',
        evidence: [{ kind: 'credential', label: 'Applied in the LLD hackathon', href: '#credentials' }],
      },
      {
        name: 'Design patterns',
        evidence: [
          {
            kind: 'credential',
            label: 'Strategy, Factory, Singleton, Observer, Decorator',
            href: '#credentials',
          },
        ],
      },
      {
        name: 'UML & sequence diagrams',
        evidence: [{ kind: 'credential', label: 'Documented for the LLD submission', href: '#credentials' }],
      },
      {
        name: 'System design',
        evidence: [
          { kind: 'project', label: 'Shared booking state machine in ResQ-Go', href: '#projects' },
          { kind: 'credential', label: 'LLD hackathon submission', href: '#credentials' },
        ],
      },
      {
        name: 'Registry architecture',
        evidence: [{ kind: 'project', label: 'Domain → Template → Tool registry in OmniScript', href: '#projects' }],
      },
    ],
  },
  {
    id: 'open-source',
    title: 'Open Source & Tooling',
    icon: '📦',
    summary: 'Packaging, publishing and the tools that make the work repeatable.',
    connects: [],
    items: [
      {
        name: 'npm publishing',
        evidence: [
          { kind: 'project', label: 'Two packages published at v0.1.0', href: PKG_CORE },
          { kind: 'credential', label: 'First open-source release post', href: '#credentials' },
        ],
      },
      {
        name: 'Git & GitHub',
        evidence: [
          { kind: 'credential', label: 'Git & GitHub for Beginners workshop', href: '#credentials' },
          { kind: 'project', label: 'Public repositories', href: 'https://github.com/IndrajitSir' },
        ],
      },
      {
        name: 'Vite',
        evidence: [{ kind: 'project', label: 'Build tooling for OmniScript', href: '#projects' }],
      },
      {
        name: 'Vitest',
        evidence: [{ kind: 'project', label: 'Unit tests plus real bash -n checks in OmniScript', href: '#projects' }],
      },
      {
        name: 'Monorepo',
        evidence: [{ kind: 'project', label: 'Shared contracts package in ResQ-Go', href: '#projects' }],
      },
      {
        name: 'Zod',
        evidence: [{ kind: 'project', label: 'Shared validation schemas in ResQ-Go', href: '#projects' }],
      },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure & Ops',
    icon: '🛠️',
    summary: 'Running things outside the codebase — deployments, servers and enterprise systems.',
    connects: ['backend'],
    items: [
      {
        name: 'Linux',
        evidence: [{ kind: 'credential', label: 'ClamAV / clamscan deployment context', href: '#experience' }],
      },
      {
        name: 'NGINX',
        evidence: [{ kind: 'role', label: 'Serving the NestJS applications at Distronix', href: '#experience' }],
      },
      {
        name: 'PM2',
        evidence: [{ kind: 'role', label: 'Node.js process management at Distronix', href: '#experience' }],
      },
      {
        name: 'Redis',
        evidence: [{ kind: 'role', label: 'Caching layer for the NestJS applications', href: '#experience' }],
      },
      {
        name: 'Docker',
        evidence: [{ kind: 'project', label: 'Containerised service workflow', href: '#projects' }],
      },
      {
        name: 'SAP S/4HANA',
        evidence: [{ kind: 'role', label: 'SAP Officer Trainee at Jai Balaji Industries', href: '#experience' }],
      },
      {
        name: 'ERP · Order-to-Cash',
        evidence: [{ kind: 'role', label: 'Sales operations in the SD module', href: '#experience' }],
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: '🔐',
    summary: 'Access control and secure file handling — the thread running through the whole journey.',
    connects: ['backend'],
    items: [
      {
        name: 'JWT authentication',
        evidence: [
          { kind: 'role', label: 'JWT guard in the Distronix authorization system', href: '#experience' },
          { kind: 'project', label: 'NestJS Authorization Library', href: '#projects' },
        ],
      },
      {
        name: 'Role & resource access control',
        evidence: [{ kind: 'project', label: 'Core feature of the npm library', href: PKG_CORE }],
      },
      {
        name: 'Antivirus integration',
        evidence: [{ kind: 'role', label: 'FileScanner service at Distronix', href: '#experience' }],
      },
      {
        name: 'Metadata stripping',
        evidence: [{ kind: 'role', label: 'Image processing before storage', href: '#experience' }],
      },
      {
        name: 'Security awareness',
        evidence: [
          { kind: 'credential', label: 'Cybersecurity awareness workshop, 2022', href: '#credentials' },
        ],
      },
    ],
  },
  {
    id: 'learning',
    title: 'AI & Data Fundamentals',
    icon: '🧠',
    summary: 'Foundational exposure — documented learning, not professional ML engineering.',
    connects: [],
    items: [
      {
        name: 'Generative AI fundamentals',
        evidence: [{ kind: 'credential', label: 'Microsoft Learn badge', href: '#credentials' }],
      },
      {
        name: 'Machine learning fundamentals',
        evidence: [{ kind: 'credential', label: 'Microsoft Learn badge', href: '#credentials' }],
      },
      {
        name: 'AI concepts',
        evidence: [{ kind: 'credential', label: 'Microsoft Learn badge', href: '#credentials' }],
      },
      {
        name: 'Data science fundamentals',
        evidence: [{ kind: 'credential', label: 'Documented learning area', href: '#credentials' }],
      },
    ],
  },
]

/** Flat list of every technology, for the chip rail and search. */
export const allSkills = skillCategories.flatMap((category) =>
  category.items.map((skill) => ({ ...skill, domain: category.id, domainTitle: category.title })),
)

/** Look up a technology by name, case-insensitively. */
export const findSkill = (name: string) =>
  allSkills.find((s) => s.name.toLowerCase() === name.toLowerCase())

/**
 * Domains with no incoming links, so the map can draw an anchor.
 * Computed from the data rather than hard-coded.
 */
export const orphanDomains = skillCategories
  .filter((c) => !skillCategories.some((other) => other.connects.includes(c.id)))
  .map((c) => c.id)