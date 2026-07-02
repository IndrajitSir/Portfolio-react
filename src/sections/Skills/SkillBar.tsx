import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { Skill } from '@/types'

interface SkillBarProps {
  skill: Skill
}

export default function SkillBar({ skill }: SkillBarProps) {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true })
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (inView) setAnimated(true)
  }, [inView])

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {skill.name}
        </span>
        <span
          className="font-mono-code text-[0.7rem]"
          style={{ color: 'var(--accent-teal)' }}
        >
          {skill.level}%
        </span>
      </div>
      <div
        className="h-[3px] rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}
        role="progressbar"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} proficiency: ${skill.level}%`}
      >
        <div
          className="h-full rounded-full transition-all ease-out"
          style={{
            width: animated ? `${skill.level}%` : '0%',
            background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))',
            transitionDuration: '1.3s',
          }}
        />
      </div>
    </div>
  )
}
