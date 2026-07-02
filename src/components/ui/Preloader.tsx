import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
  const [progress, setProgress] = useState(0)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 10 + 3
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => setDone(true), 400)
          return 100
        }
        return next
      })
    }, 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6"
          style={{ background: 'var(--bg-primary)' }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
        >
          <motion.p
            className="font-display text-4xl text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-[var(--accent-teal)] italic">Indrajit</span> Mandal
          </motion.p>

          {/* Bar */}
          <div
            className="w-48 h-[2px] rounded-full overflow-hidden"
            style={{ background: 'var(--border)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-indigo))',
                width: `${progress}%`,
                transition: 'width 0.05s linear',
              }}
            />
          </div>

          <p
            className="font-mono-code text-xs text-[var(--accent-teal)]"
          >
            {Math.floor(progress)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
