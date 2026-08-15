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
      'Designed and implemented a complete authorization system from scratch for a finance-focused NestJS application, including role and resource-based access control — this implementation became the foundation for developing and publishing a reusable NestJS authorization library on npm.',
      'Developed a reusable FileScanner service for a NestJS microservice that integrates with ClamAV and clamscan to scan uploaded files for malicious content, with image-specific processing to remove embedded metadata before files are persisted to storage.',
      'Analyzed 150+ database models to identify and implement efficient indexing strategies, measurably improving query performance and overall system reliability.',
    ],
    technologies: ['NestJS', 'TypeScript', 'Node.js', 'Express.js', 'MySQL', 'REST APIs', 'Git'],
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
