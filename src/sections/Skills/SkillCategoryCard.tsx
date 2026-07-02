import { motion } from 'framer-motion'
import { fadeInUp } from '@/utils/animations'
import { GlowCard, Tag } from '@/components/ui'
import SkillBar from './SkillBar'
import type { SkillCategory } from '@/types'

interface SkillCategoryCardProps {
  category: SkillCategory
  index: number
}

export default function SkillCategoryCard({ category, index }: SkillCategoryCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      transition={{ delay: index * 0.08 }}
    >
      <GlowCard className="h-full">
        <div className="p-7 flex flex-col gap-5 h-full">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{category.icon}</span>
            <h3
              className="font-mono-code text-[0.72rem] uppercase tracking-widest"
              style={{ color: 'var(--accent-teal)' }}
            >
              {category.title}
            </h3>
          </div>

          {/* Bars */}
          {category.skills.length > 0 && (
            <div className="space-y-3.5">
              {category.skills.map((skill) => (
                <SkillBar key={skill.name} skill={skill} />
              ))}
            </div>
          )}

          {/* Tags */}
          {category.tags && category.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto pt-1">
              {category.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
        </div>
      </GlowCard>
    </motion.div>
  )
}
