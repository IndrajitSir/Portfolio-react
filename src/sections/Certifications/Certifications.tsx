import { SectionLabel, SectionBackground } from '@/components/ui'
import { sortedCredentials } from '@/data'
import CredentialExplorer from './CertExplorer'

export default function Certifications() {
  return (
    <section
      id="credentials"
      aria-label="Certifications and achievements"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SectionBackground variant="award" />
      <div className="max-container section-padding relative z-10">
        <SectionLabel
          index="07"
          label="Credentials"
          title="Certifications,"
          titleAccent="badges & awards"
        />

        <CredentialExplorer credentials={sortedCredentials} />
      </div>
    </section>
  )
}