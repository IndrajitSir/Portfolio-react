import type { Experience } from '@/types'

export const experiences: Experience[] = [
  {
    id: 'distronix',
    role: 'Junior Software Developer',
    company: 'Distronix',
    companyUrl: 'https://distronix.in',
    period: 'May 2026 – Present',
    startDate: '2026-05',
    current: true,
    type: 'fulltime',
    description: [
      'Analyzed 150+ database models to design and implement efficient indexing strategies, measurably improving query performance and system reliability.',
      'Built and deployed an administrator endpoint for loan initiation, delivering a critical backend feature to production.',
      'Resolved complex relational model errors during project setup, ensuring smooth developer onboarding.',
      'Contributed to backend architecture discussions and API design, shaping the foundation for scalable services.',
    ],
    technologies: ['Node.js', 'Express.js', 'MySQL', 'REST APIs', 'Git'],
  },
  {
    id: 'jai-balaji',
    role: 'SAP Officer Trainee',
    company: 'Jai Balaji Industries Pvt Ltd',
    companyUrl: 'https://www.jaibalajigroup.com/',
    period: 'August 2025 – May 2026',
    startDate: '2025-08',
    endDate: '2026-05',
    current: false,
    type: 'fulltime',
    description: [
      'Supported sales operations in SAP S/4HANA (SD module), assisting with end-to-end order-to-cash processes.',
      'Maintained accurate sales records and collaborated cross-functionally to ensure smooth operational workflows.',
      'Gained hands-on exposure to enterprise ERP systems, developing understanding of business process modeling.',
    ],
    technologies: ['SAP S/4HANA', 'SD Module', 'Order-to-Cash', 'ERP'],
  },
]
