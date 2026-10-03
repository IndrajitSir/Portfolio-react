import { SectionLabel, SectionBackground } from '@/components/ui'
import { certifications } from '@/data'
import CertExplorer from './CertExplorer'

export default function Certifications() {
  return (
    <section
      id="certifications"
      aria-label="Certifications section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SectionBackground variant="award" />
      <div className="max-container section-padding relative z-10">
        <SectionLabel
          index="06"
          label="Credentials"
          title="Certifications &"
          titleAccent="achievements"
        />

        <CertExplorer certifications={certifications} />
      </div>
    </section>
  )
}
