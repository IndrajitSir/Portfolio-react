import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const spring = useSpring(progress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.body.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 h-[2px] z-[200] origin-left"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))',
        scaleX: spring,
      }}
    />
  )
}
