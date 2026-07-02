import { motion } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  once?: boolean
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  once = true,
}: AnimatedTextProps) {
  const words = text.split(' ')

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block overflow-hidden"
          variants={{
            hidden: {},
            visible: {},
          }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', opacity: 0 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: {
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                  delay: delay + i * stagger,
                },
              },
            }}
          >
            {word}
          </motion.span>
        </motion.span>
      ))}
    </motion.span>
  )
}
