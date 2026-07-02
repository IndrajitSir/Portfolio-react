import { motion } from 'framer-motion'
import { staggerContainer } from '@/utils/animations'
import { SectionLabel } from '@/components/ui'
import { skillCategories, techStack } from '@/data'
import SkillCategoryCard from './SkillCategoryCard'

export default function Skills() {
  return (
    <section
      id="skills"
      aria-label="Skills section"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-container section-padding">
        <SectionLabel
          index="02"
          label="Expertise"
          title="Technical"
          titleAccent="skills"
        />

        {/* Category grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16"
        >
          {skillCategories.map((cat, i) => (
            <SkillCategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </motion.div>

        {/* Tech stack chips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-mono-code text-[0.72rem] uppercase tracking-widest mb-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Full tech arsenal
          </p>
          <div className="flex flex-wrap gap-3">
            {techStack.map((item) => (
              <motion.span
                key={item.name}
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-full cursor-default
                  border border-[var(--border)] bg-[var(--surface)]
                  font-mono-code text-[0.8rem]
                  hover:border-[var(--border-glow)] hover:bg-[var(--glow-teal)]
                  hover:text-[var(--accent-teal)]
                  transition-colors duration-200
                "
                style={{ color: 'var(--text-secondary)' }}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
