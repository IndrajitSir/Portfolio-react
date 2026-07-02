import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export default function GlowCard({
  children,
  className = '',
  glowColor = 'var(--glow-teal)',
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el   = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setGlow({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    })
  }

  const onMouseLeave = () => setGlow((g) => ({ ...g, opacity: 0 }))

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`relative overflow-hidden rounded-2xl glass ${className}`}
    >
      {/* Spotlight gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(400px circle at ${glow.x}px ${glow.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}
