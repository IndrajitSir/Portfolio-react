import { motion } from 'framer-motion'
import { staggerContainer } from '@/utils/animations'
import { SectionLabel, SectionBackground } from '@/components/ui'
import { experiences } from '@/data'
import TimelineItem from './TimelineItem'

export default function Experience() {
  return (
    <section
      id="experience"
      aria-label="Experience section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <SectionBackground variant="rise" />
      <div className="max-container section-padding relative z-10">
        <SectionLabel
          index="03"
          label="Career"
          title="Work"
          titleAccent="experience"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-3xl"
        >
          {experiences.map((exp, i) => (
            <TimelineItem
              key={exp.id}
              experience={exp}
              index={i}
              isLast={i === experiences.length - 1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
