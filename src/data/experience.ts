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
    story: {
      summary:
        'I build the backend foundations — authorization, secure file handling and database performance — that product teams build on.',
      flows: [
        {
          id: 'auth',
          label: 'Authorization system',
          title: 'Authorization request lifecycle',
          stages: [
            {
              id: 'request',
              label: 'Request',
              detail: 'An authenticated request reaches a protected route in the NestJS application.',
            },
            {
              id: 'guard',
              label: 'JWT Guard',
              detail: 'A NestJS guard verifies the token and resolves the caller identity before anything else runs.',
            },
            {
              id: 'engine',
              label: 'Auth Engine',
              detail: 'The core authorization engine evaluates the required role and resource for the route.',
            },
            {
              id: 'provider',
              label: 'Provider',
              detail: 'A minimal provider interface keeps the engine fully decoupled from any specific database.',
            },
            {
              id: 'adapter',
              label: 'SQL Adapter',
              detail: 'The SQL adapter resolves the caller roles, grants and resource scopes from the database.',
            },
            {
              id: 'decision',
              label: 'Decision',
              detail: 'Role and resource-based access control produce a clean allow-or-deny decision.',
            },
            {
              id: 'route',
              label: 'Protected route',
              detail: 'The request proceeds only if the policy passes — this engine became the npm authorization library.',
            },
          ],
        },
        {
          id: 'scanner',
          label: 'FileScanner service',
          title: 'Secure upload pipeline',
          stages: [
            { id: 'upload', label: 'Upload', detail: 'A client uploads a file to the NestJS microservice.' },
            {
              id: 'scanner',
              label: 'FileScanner',
              detail: 'A reusable FileScanner service stages the file and coordinates inspection.',
            },
            {
              id: 'clamav',
              label: 'ClamAV scan',
              detail: 'The file is scanned with ClamAV / clamscan to detect malicious content.',
            },
            {
              id: 'strip',
              label: 'Metadata strip',
              detail: 'Image uploads get specific processing to remove embedded metadata.',
            },
            {
              id: 'storage',
              label: 'Storage',
              detail: 'Only clean, metadata-stripped files are persisted to storage.',
            },
          ],
        },
        {
          id: 'indexing',
          label: 'Database indexing',
          title: 'Query performance pass',
          stages: [
            {
              id: 'models',
              label: '150+ models',
              detail: 'Analysed 150+ database models across the application to find the pressure points.',
            },
            {
              id: 'slow',
              label: 'Slow queries',
              detail: 'Identified the queries scanning full tables on high-frequency columns.',
            },
            {
              id: 'index',
              label: 'Index strategy',
              detail: 'Chose indexes that match the real access patterns instead of indexing blindly.',
            },
            {
              id: 'planner',
              label: 'Query planner',
              detail: 'The planner now selects an index rather than scanning the whole table.',
            },
            {
              id: 'faster',
              label: 'Faster reads',
              detail: 'Measurably better query performance and overall system reliability.',
            },
          ],
        },
      ],
    },
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
    story: {
      summary:
        'I worked on the enterprise side of the stack — running sales operations through SAP and keeping the order-to-cash cycle moving.',
      flows: [
        {
          id: 'otc',
          label: 'Order-to-Cash',
          title: 'Order-to-cash cycle (SAP SD)',
          stages: [
            { id: 'order', label: 'Sales Order', detail: 'Captured the customer order in SAP S/4HANA (SD module).' },
            { id: 'delivery', label: 'Delivery', detail: 'Created and scheduled the outbound delivery for the order.' },
            { id: 'picking', label: 'Picking', detail: 'Warehouse confirmed the picked quantity against the delivery.' },
            { id: 'goods', label: 'Goods Issue', detail: 'Stock was posted out of inventory at goods issue.' },
            { id: 'billing', label: 'Billing', detail: 'Generated the invoice from the delivery document.' },
            { id: 'payment', label: 'Payment', detail: 'Tracked the payment through to close the cycle.' },
          ],
        },
        {
          id: 'ops',
          label: 'Sales operations',
          title: 'Records & cross-functional workflow',
          stages: [
            {
              id: 'records',
              label: 'Records',
              detail: 'Maintained accurate sales records across the SD module.',
            },
            {
              id: 'cross',
              label: 'Coordination',
              detail: 'Collaborated cross-functionally so operational workflows stayed smooth.',
            },
            {
              id: 'erp',
              label: 'ERP exposure',
              detail: 'Built hands-on understanding of enterprise ERP systems and business process modelling.',
            },
          ],
        },
      ],
    },
  },
]
