import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'campus-placement',
    number: '01',
    title: 'Campus Placement Recruitment System',
    period: 'February 2025 – June 2025',
    category: 'Full-Stack Web',
    description:
      'A full-featured recruitment portal bridging students and companies for campus hiring, managing the entire placement lifecycle from registration to offer letters.',
    longDescription:
      'Designed and developed a comprehensive campus placement management system that digitizes the entire recruitment workflow. The platform supports multi-role access for students, companies, and administrators, streamlining everything from profile creation and job posting to interview scheduling and offer management.',
    features: [
      'Role-based access control (Student / Company / Admin)',
      'End-to-end placement workflow management',
      'Real-time application status tracking',
      'Admin dashboard for schedule coordination',
      'Company job posting and applicant filtering',
      'Automated email notifications for status updates',
    ],
    challenges: [
      'Designing a flexible RBAC system that scales to different user types without duplicating business logic',
      'Managing complex relational data across students, companies, jobs, and applications',
      'Keeping the admin dashboard performant with real-time filtering across large datasets',
    ],
    solutions: [
      'Built a middleware-based permission layer that cleanly separates concerns by role',
      'Used normalized MySQL schema with strategic indexing on high-frequency query columns',
      'Implemented server-side pagination and lazy loading on dashboard endpoints',
    ],
    technologies: ['Node.js', 'Express.js', 'MySQL', 'REST API', 'JavaScript', 'JWT'],
    liveUrl: 'https://campus-placement-portal.vercel.app/',
    githubUrl: 'https://github.com/IndrajitSir',
  },
  {
    id: 'whatsapp-alert',
    number: '02',
    title: 'WhatsApp Smart Alert App',
    period: 'January 2026 – February 2026',
    category: 'Android',
    description:
      'An intelligent Android application that monitors WhatsApp notifications and triggers custom priority alerts based on configurable keyword detection — never miss an urgent message again.',
    longDescription:
      'Built a background Android service that intercepts notification events from WhatsApp, runs them through a configurable keyword engine, and fires custom high-priority alerts when trigger words are detected. Designed for professionals who cannot afford to miss time-sensitive messages.',
    features: [
      'Real-time notification listening with minimal battery impact',
      'Configurable keyword engine (urgent, meeting, custom terms)',
      'Time-based alert controls with on/off toggles',
      'Per-contact and per-group alert rule configuration',
      'Alert history log with timestamps',
      'Quiet hours mode to suppress alerts during set periods',
    ],
    challenges: [
      'Intercepting Android system notifications without violating app sandboxing or OS restrictions',
      'Keeping the background service alive across different Android vendor battery optimizations',
      'Designing a keyword engine flexible enough for regex-like matching without complex setup',
    ],
    solutions: [
      'Implemented NotificationListenerService with proper permission handling and fallback guidance',
      'Used WorkManager for resilient background processing that survives Doze mode',
      'Built a simple rule DSL that compiles to efficient string matchers at runtime',
    ],
    technologies: ['Android', 'Java', 'Notification API', 'Background Services', 'WorkManager'],
    githubUrl: 'https://github.com/IndrajitSir',
  },
]
