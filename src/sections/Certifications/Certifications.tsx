import { motion } from 'framer-motion'
import { staggerContainer } from '@/utils/animations'
import { SectionLabel, SectionBackground } from '@/components/ui'
import { certifications } from '@/data'
import CertCard from './CertCard'

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

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {certifications.map((cert, i) => (
            <CertCard key={cert.id} cert={cert} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
