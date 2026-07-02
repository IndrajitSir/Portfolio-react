import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FiArrowDown } from 'react-icons/fi'
import { personalInfo } from '@/data'
import { scrollToSection } from '@/utils'
import { MagneticButton } from '@/components/ui'
import CursorParticlesCanvas from '@/components/ui/CursorParticlesCanvas'
import HeroBadge from './HeroBadge'
import HeroStats from './HeroStats'

// Lazy-load heavy 3D canvas
const HeroCanvas = lazy(() => import('@/components/three/HeroCanvas'))

// Background gradient blobs
function GradientBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-[0.07]"
        style={{ background: 'radial-gradient(ellipse, var(--accent-teal), transparent)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full blur-[100px] opacity-[0.05]"
        style={{ background: 'radial-gradient(ellipse, var(--accent-indigo), transparent)' }}
      />
    </div>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
      aria-label="Hero section"
    >
      <GradientBlobs />

      {/* ── Background: Particle Swarm ────────────────────── */}
      <CursorParticlesCanvas />
      <GradientBlobs />

      <div className="max-container section-padding w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Content ───────────────────────── */}
          <div>
            <HeroBadge />

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="font-display font-light leading-[1.05] tracking-tight mb-4"
              style={{
                fontSize: 'clamp(3rem, 7vw, 5.8rem)',
                color: 'var(--text-primary)',
              }}
            >
              Indrajit
              <br />
              <em className="not-italic" style={{ color: 'var(--accent-teal)' }}>
                Mandal
              </em>
            </motion.h1>

            {/* Role */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="font-mono-code text-base mb-5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span style={{ color: 'var(--accent-indigo)' }}>&lt;</span>
              {personalInfo.title}
              <span style={{ color: 'var(--accent-indigo)' }}> /&gt;</span>
            </motion.p>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="text-[1.05rem] leading-[1.8] max-w-[480px] mb-9"
              style={{ color: 'var(--text-secondary)' }}
            >
              {personalInfo.tagline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticButton
                href="#projects"
                onClick={(e?: React.MouseEvent) => { e?.preventDefault(); scrollToSection('projects') }}
                className="
                  inline-flex items-center gap-2 px-7 py-3.5 rounded-full
                  font-semibold text-[0.9rem] tracking-wide
                  bg-[var(--accent-teal)] text-[var(--bg-primary)]
                  hover:shadow-[0_0_40px_var(--glow-teal)]
                  transition-all duration-300
                "
              >
                View Work
                <FiArrowDown size={16} />
              </MagneticButton>

              <MagneticButton
                href="#contact"
                onClick={(e?: React.MouseEvent) => { e?.preventDefault(); scrollToSection('contact') }}
                className="
                  inline-flex items-center gap-2 px-7 py-3.5 rounded-full
                  font-semibold text-[0.9rem] tracking-wide
                  border border-[var(--border)] bg-[var(--surface)]
                  text-[var(--text-primary)]
                  hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                  transition-all duration-300
                "
              >
                Get In Touch →
              </MagneticButton>
            </motion.div>

            <HeroStats />
          </div>

          {/* ── Right: 3D Canvas ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="hidden lg:block w-full aspect-square max-w-[480px] mx-auto z-10"
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent-teal)', borderTopColor: 'transparent' }}
                  />
                </div>
              }
            >
              <HeroCanvas />
            </Suspense>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span
          className="font-mono-code text-[0.65rem] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          scroll
        </span>
        <motion.div
          className="w-px h-10"
          style={{ background: 'linear-gradient(to bottom, var(--accent-teal), transparent)' }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
