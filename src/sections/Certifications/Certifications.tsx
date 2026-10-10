import { SectionLabel, SectionBackground } from '@/components/ui'
import { Parallax } from '@/components/animations'
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

        {/* The explorer drifts on its own layer, so the credential wall feels
            like a surface sliding behind the heading rather than a flat block. */}
        <Parallax distance={18}>
          <CredentialExplorer credentials={sortedCredentials} />
        </Parallax>
      </div>
    </section>
  )
}