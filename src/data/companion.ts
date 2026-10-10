/**
 * What Strobi says as the visitor travels the page.
 *
 * The companion's *face* is resolved from the journey chapter and the career role
 * (see `components/ui/StrobiCompanion.tsx`); these lines are the other half of the
 * character. Each one is a tip rather than a label: the visitor can already read
 * "Skills" in the heading, so the bubble is only worth the space if it says
 * something the heading does not.
 *
 * Keyed by the section id `useActiveSection` resolves, so a newly added section
 * shows up here as a gap instead of silently producing an empty bubble. The two
 * narrative threads carry a tip per chapter and per role as well, because a single
 * line would go stale a third of the way through an eight-chapter scroll.
 *
 * Keep them short: the bubble is deliberately no wider than 17rem, and it is not
 * the place for a sentence that needs a comma.
 */
export const SECTION_TIPS: Record<string, string> = {
  '': "Hi, I'm Strobi — scroll and I'll follow along.",
  about: 'The short version. Everything after this goes deeper.',
  journey: 'Eight chapters, oldest first — read them in order.',
  skills: 'Only the tools I actually reach for.',
  experience: 'Newest role first; each diagram shows how the work fits together.',
  projects: 'Open a card for the problem, the build and the result.',
  education: 'Where the theory and the practice meet.',
  credentials: 'Every certificate here is verified — tap one to check.',
  contact: 'The form opens your mail client with the subject already set.',
}

export const CHAPTER_TIPS: Record<string, string> = {
  learn: 'One Java course is what started all of this.',
  build: 'The first builds — and the first bugs I actually enjoyed.',
  compete: 'Contests, where being fast stops being optional.',
  backend: 'The turn towards servers, data and uptime.',
  systems: 'The first service that had to stay up without me.',
  design: 'Designing the shape before writing the code.',
  ship: 'Backend work other people now depend on.',
  publish: 'Published packages, used by developers I have never met.',
}

export const ROLE_TIPS: Record<string, string> = {
  distronix: 'Where I am now: NestJS, PostgreSQL, real traffic.',
  'jai-balaji': 'Enterprise process, up close and unglamorous.',
  'ardent-computech': 'My first team, and my first deploy.',
  systemtron: 'Four weeks that decided the direction.',
}
