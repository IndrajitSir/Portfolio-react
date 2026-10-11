import type { IconType } from 'react-icons'
import {
  FiActivity, FiArchive, FiAward, FiBarChart2, FiBox, FiCode, FiCpu, FiDatabase,
  FiEyeOff, FiFolder, FiGitBranch, FiGlobe, FiGrid, FiKey, FiLayers, FiLayout,
  FiLock, FiPackage, FiSearch, FiServer, FiShield, FiShoppingCart, FiTool, FiUsers,
  FiZap, FiList,
} from 'react-icons/fi'
import { /*FaCss3Alt,*/ FaHtml5, FaJava } from 'react-icons/fa'
import {
  SiDocker, SiExpress, SiGit, SiGnubash, SiJavascript, SiJsonwebtokens, SiKotlin,
  SiLinux, SiMongodb, SiMysql, SiNestjs, SiNextdotjs, SiNginx, SiNodedotjs, SiNpm,
  SiPostgresql, SiPrisma, SiPython, SiReact, SiRedis, SiSap, SiTailwindcss,
  SiTypescript, SiVite, SiVitest, SiZod,
} from 'react-icons/si'

/** One icon per category: the centrepiece of the card. */
export const CATEGORY_ICONS: Record<string, IconType> = {
  backend: FiServer,
  databases: FiDatabase,
  frontend: FiLayout,
  languages: FiCode,
  architecture: FiLayers,
  'open-source': FiPackage,
  infrastructure: FiTool,
  security: FiLock,
  learning: FiCpu,
}

/** Each domain gets its own accent, which colours its cards and the glow behind the rail. */
export const DOMAIN_ACCENT: Record<string, string> = {
  backend: 'var(--accent-teal)',
  databases: 'var(--accent-indigo)',
  frontend: 'var(--accent-violet)',
  languages: 'var(--accent-orange)',
  architecture: 'var(--accent-teal)',
  'open-source': 'var(--accent-green)',
  infrastructure: 'var(--accent-orange)',
  security: 'var(--accent-indigo)',
  learning: 'var(--accent-violet)',
}

/** Keyed by the exact `name` in skillCategories. */
const ITEM_ICONS: Record<string, IconType> = {
  // Backend
  NestJS: SiNestjs,
  'Node.js': SiNodedotjs,
  'Express.js': SiExpress,
  'REST APIs': FiGlobe,
  TypeScript: SiTypescript,
  'Authorization & RBAC': FiUsers,
  'File scanning & ClamAV': FiSearch,
  // Databases
  MySQL: SiMysql,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  'Indexing strategy': FiList,
  Prisma: SiPrisma,
  // Frontend
  'React.js': SiReact,
  'HTML & CSS': FaHtml5,
  JavaScript: SiJavascript,
  'Tailwind CSS': SiTailwindcss,
  'Next.js': SiNextdotjs,
  'UI implementation': FiLayout,
  // Languages
  Java: FaJava,
  Kotlin: SiKotlin,
  Python: SiPython,
  SQL: FiDatabase,
  Bash: SiGnubash,
  // Design & architecture
  'Low-Level Design': FiLayers,
  'SOLID principles': FiBox,
  'Design patterns': FiGrid,
  'UML & sequence diagrams': FiGitBranch,
  'System design': FiCpu,
  'Registry architecture': FiArchive,
  // Open source & tooling
  'npm publishing': SiNpm,
  'Git & GitHub': SiGit,
  Vite: SiVite,
  Vitest: SiVitest,
  Monorepo: FiFolder,
  Zod: SiZod,
  // Infrastructure
  Linux: SiLinux,
  NGINX: SiNginx,
  PM2: FiActivity,
  Redis: SiRedis,
  Docker: SiDocker,
  'SAP S/4HANA': SiSap,
  'ERP · Order-to-Cash': FiShoppingCart,
  // Security
  'JWT authentication': SiJsonwebtokens,
  'Role & resource access control': FiKey,
  'Antivirus integration': FiShield,
  'Metadata stripping': FiEyeOff,
  'Security awareness': FiAward,
  // AI & data
  'Generative AI fundamentals': FiZap,
  'Machine learning fundamentals': FiActivity,
  'AI concepts': FiCpu,
  'Data science fundamentals': FiBarChart2,
}

export const iconFor = (name: string): IconType => ITEM_ICONS[name] ?? FiCode