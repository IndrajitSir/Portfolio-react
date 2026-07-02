import type { SkillCategory } from '@/types'

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages',
    icon: '💻',
    skills: [
      { name: 'JavaScript', level: 98 },
      { name: 'Java', level: 92 },
      { name: 'Python', level: 75 },
      { name: 'C/C++', level: 70 },
    ],
    tags: ['ES6+', 'Async/Await', 'OOP', 'COLLECTION FRAMEWORK'],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: '⚙️',
    skills: [
      { name: 'Node.js', level: 85 },
      { name: 'Express.js', level: 90 },
      { name: 'REST APIs', level: 95 },
    ],
    tags: ['Auth/JWT', 'OAUTH', 'SOCKET I.O', 'REDIS'],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: '🗄️',
    skills: [
      { name: 'MySQL', level: 80 },
      { name: 'MongoDB', level: 72 },
      { name: 'PostgreSQL', level: 90 },
    ],
    tags: ['Indexing', 'Query Optimization', 'Relations'],
  },
  {
    id: 'tools',
    title: 'Tools & DevOps',
    icon: '🔧',
    skills: [],
    tags: ['Git', 'GitHub', 'Postman', 'npm', 'VS Code', 'Linux'],
  },
  {
    id: 'concepts',
    title: 'Concepts',
    icon: '🧠',
    skills: [],
    tags: ['DSA', 'Auth & Authorization', 'System Design', 'Computer Networking', 'Indexing Strategies'],
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    icon: '📊',
    skills: [],
    tags: ['SAP S/4HANA', 'SD Module', 'Order-to-Cash', 'Data Management', 'ERP'],
  },
]

export const techStack = [
  { name: 'JavaScript', icon: '🟨' },
  { name: 'Java', icon: '☕' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Express.js', icon: '⚡' },
  { name: 'MySQL', icon: '🐬' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Git', icon: '🐙' },
  { name: 'Postman', icon: '📮' },
  { name: 'JWT Auth', icon: '🛡️' },
  { name: 'REST APIs', icon: '🔄' },
  { name: 'SAP S/4HANA', icon: '📊' },
  { name: 'Android', icon: '📱' },
  { name: 'SQL Indexing', icon: '🔍' },
  { name: 'System Design', icon: '🏗️' },
]
