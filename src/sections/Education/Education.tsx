import { SectionLabel, SectionBackground, LearningOrb } from '@/components/ui'
import { Parallax } from '@/components/animations'
import { educationList } from '@/data'
import AcademicJourney from './AcademicJourney'

export default function Education() {
  return (
    <section
      id="education"
      aria-label="Education section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <SectionBackground variant="orbit" />
      <div className="max-container section-padding relative z-10">
        {/* The orb shares the heading row on wide screens and centres above the
            timeline on narrow ones, so it is always a featured object rather
            than a stray one floating over the content. */}
        <div className="flex flex-col items-start sm:flex-row sm:items-start sm:justify-between">
          <SectionLabel
            index="06"
            label="Learning"
            title="Academic"
            titleAccent="background"
          />
          <LearningOrb className="mb-8 self-center sm:mb-0 sm:self-start sm:mt-1" />
        </div>

        {/* The journey is ordered earliest → latest and fills in as you scroll,
            so the progression itself is the story. Carried on its own layer so
            the timeline lags the text above it as the reader travels down. */}
        <Parallax distance={18}>
          <AcademicJourney items={educationList} />
        </Parallax>
      </div>
    </section>
  )
}
