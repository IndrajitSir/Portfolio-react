import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { fadeInUp } from '@/utils/animations'

interface RevealBlockProps {
  children: ReactNode
  className?: string
  variants?: Variants
  delay?: number
  once?: boolean
}

export default function RevealBlock({
  children,
  className = '',
  variants = fadeInUp,
  delay = 0,
  once = true,
}: RevealBlockProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={{
        hidden: variants.hidden as Record<string, unknown>,
        visible: {
          ...(variants.visible as Record<string, unknown>),
          transition: {
            ...((variants.visible as { transition?: Record<string, unknown> }).transition ?? {}),
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
