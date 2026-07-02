import type { Education, Certification } from '@/types'

export const educationList: Education[] = [
  {
    id: 'bca',
    degree: 'Bachelor in Computer Application',
    institution: 'RICIS Institution',
    university: 'Kazi Nazrul University',
    period: '2022 – 2025',
    score: '8.14 / 10.0',
    scoreType: 'cgpa',
    icon: '🎓',
  },
  {
    id: 'class12',
    degree: '12th Standard (Science)',
    institution: '+2 National High School, Dumka',
    period: 'Completed 2022',
    score: '63.9 / 100',
    scoreType: 'percentage',
    icon: '📘',
  },
  {
    id: 'class10',
    degree: '10th Standard',
    institution: 'High School Hathiyapather',
    period: 'Completed',
    score: '83.2 / 100',
    scoreType: 'percentage',
    icon: '📗',
  },
]

export const certifications: Certification[] = [
  {
    id: 'csde',
    title: 'CSDE – Certificate in Service Desk Executive',
    issuer: 'Anudip Foundation · METTL',
    description:
      'IT skills and soft skills certification covering service desk operations, customer support, and communication excellence.',
    icon: '🎖️',
  },
  {
    id: 'efset',
    title: 'EF SET English Certificate — B2 Upper-Intermediate',
    issuer: 'EF Education First',
    description:
      'Scored 58/100, achieving B2 Upper-Intermediate level. Demonstrates professional-level English communication capability.',
    url: 'https://cert.efset.org/yXKKuy',
    icon: '🌍',
  },
]
