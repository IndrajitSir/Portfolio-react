import type { Education } from '@/types'

/**
 * Academic record.
 *
 * Chronology, institution and result exactly as recorded. The narrative
 * deliberately stops here: the education section does not claim that a
 * qualification caused any later technical interest, because the available
 * sources do not establish that link.
 */
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

/**
 * Institution context that the sources do confirm.
 *
 * `RICIS Institution, Raniganj` is named as the representing institution in the
 * TATA Crucible Campus Quiz entry, and `Kazi Nazrul University` is associated with
 * the RBI@90 Nationwide Online Quiz. Both are stated as they appear — this is a
 * record of where the study happened, not a claim about what it produced.
 */
export const institutionNotes: Record<string, string> = {
  bca: 'RICIS Institution, Raniganj — also the representing institution in the TATA Crucible Campus Quiz (2024). Kazi Nazrul University is associated with the RBI@90 Nationwide Online Quiz entry.',
}