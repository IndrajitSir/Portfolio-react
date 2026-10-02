import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** Fraction of the cursor offset applied as translation. */
  strength?: number
  onClick?: (e?: React.MouseEvent) => void
  href?: string
  target?: string
  rel?: string
  'aria-label'?: string
}

/**
 * Wraps a CTA with a restrained magnetic pull toward the cursor. The effect is
 * automatically disabled for coarse pointers and `prefers-reduced-motion`, so
 * touch users and motion-sensitive visitors get a completely static control.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.22,
  onClick,
  href,
  target,
  rel,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reduceMotion) {
      setEnabled(false)
      return
    }
    setEnabled(!window.matchMedia('(pointer: coarse)').matches)
  }, [reduceMotion])

  const onMouseMove = (e: React.MouseEvent) => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }

  const onMouseLeave = () => setPos({ x: 0, y: 0 })

  const Tag = href ? 'a' : 'button'

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <motion.div
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.5 }}
      >
        <Tag
          href={href}
          target={target}
          rel={rel}
          onClick={onClick}
          aria-label={ariaLabel}
          className={className}
        >
          {children}
        </Tag>
      </motion.div>
    </div>
  )
}
