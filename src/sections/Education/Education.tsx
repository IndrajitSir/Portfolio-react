import { SectionLabel, SectionBackground } from '@/components/ui'
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
        <SectionLabel
          index="06"
          label="Learning"
          title="Academic"
          titleAccent="background"
        />

        {/* The journey is ordered earliest → latest and fills in as you scroll,
            so the progression itself is the story. */}
        <AcademicJourney items={educationList} />
      </div>
    </section>
  )
}
