import { motion } from 'framer-motion'
import { staggerContainer } from '@/utils/animations'
import { SectionLabel, SectionBackground } from '@/components/ui'
import { educationList } from '@/data'
import EduCard from './EduCard'

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
          index="05"
          label="Learning"
          title="Academic"
          titleAccent="background"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {educationList.map((edu, i) => (
            <EduCard key={edu.id} edu={edu} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
