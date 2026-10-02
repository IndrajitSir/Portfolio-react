import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { personalInfo } from '@/data'

const ROLES = ['Backend Engineer', 'API Architect', 'Open-Source Builder']
const DESCRIPTION =
  'I build scalable backend systems, high-performance APIs, and developer tools that solve real-world problems.'

const EASE = [0.22, 1, 0.36, 1] as const
const NAME_WORDS = ['Indrajit', 'Mandal']

/** Availability pill with a pulsing status light and a slow border sweep. */
function AvailabilityBadge() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
      className="
        relative inline-flex w-fit max-w-full items-center gap-2 self-start overflow-hidden
        rounded-full border border-[var(--border-glow)] bg-[var(--glow-teal)] px-3.5 py-1.5
        font-mono-code text-[0.66rem] uppercase tracking-[0.18em]
      "
      style={{ color: 'var(--accent-teal)' }}
      aria-label="Currently available for opportunities"
    >
      {!reduceMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
          }}
          animate={{ x: ['-120%', '420%'] }}
          transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
        />
      )}

      <span className="relative flex h-2 w-2" aria-hidden="true">
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: 'var(--accent-teal)' }}
            animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ background: 'var(--accent-teal)' }}
        />
      </span>

      <span className="relative">Available for opportunities</span>
    </motion.div>
  )
}

/** A single word revealed through a masked vertical transition. */
function MaskedWord({
  word,
  index,
  accent,
}: {
  word: string
  index: number
  accent?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const [swept, setSwept] = useState(false)

  return (
    <span className="mr-[0.22em] inline-block overflow-hidden pb-[0.06em] align-bottom last:mr-0">
      <motion.span
        className="relative inline-block"
        initial={reduceMotion ? undefined : { y: '118%', opacity: 0 }}
        animate={reduceMotion ? undefined : { y: '0%', opacity: 1 }}
        transition={{ duration: 0.95, delay: 0.28 + index * 0.12, ease: EASE }}
      >
        <span
          style={
            accent
              ? {
                  backgroundImage:
                    'linear-gradient(100deg, var(--accent-teal), var(--accent-indigo) 55%, var(--accent-teal))',
                  backgroundSize: '220% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  filter: 'drop-shadow(0 0 26px var(--glow-teal))',
                }
              : { color: 'var(--text-primary)' }
          }
        >
          {word}
        </span>

        {/* One-time light sweep across the accent word. */}
        {accent && !reduceMotion && !swept && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <motion.span
              className="absolute inset-y-0 w-1/2 -skew-x-12"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                mixBlendMode: 'overlay',
              }}
              initial={{ x: '-160%' }}
              animate={{ x: '260%' }}
              transition={{ duration: 1.1, delay: 1.15, ease: 'easeInOut' }}
              onAnimationComplete={() => setSwept(true)}
            />
          </span>
        )}
      </motion.span>
    </span>
  )
}

/** Professional headline revealed word-by-word, with a slow accent cycle. */
function RoleHeadline() {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % ROLES.length), 3400)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  let wordIndex = 0

  return (
    <h2
      className="text-[clamp(1.05rem,2.4vw,1.5rem)] font-medium tracking-tight"
      aria-label={ROLES.join(' · ')}
    >
      {ROLES.map((role, roleIdx) => {
        const isActive = roleIdx === active
        const words = role.split(' ')
        return (
          <span key={role} className="inline-flex items-baseline">
            {words.map((word) => {
              const delay = 0.7 + wordIndex * 0.06
              wordIndex += 1
              return (
                <span key={word} className="mr-[0.28em] inline-block overflow-hidden align-bottom">
                  <motion.span
                    className="relative inline-block"
                    initial={reduceMotion ? undefined : { y: '110%', opacity: 0 }}
                    animate={reduceMotion ? undefined : { y: '0%', opacity: 1 }}
                    transition={{ duration: 0.6, delay, ease: EASE }}
                    style={{
                      color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      transition: reduceMotion ? 'none' : 'color 0.5s ease',
                    }}
                  >
                    {word}
                    {isActive && !reduceMotion && (
                      <motion.span
                        layoutId="role-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px"
                        style={{ background: 'var(--accent-teal)' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      />
                    )}
                  </motion.span>
                </span>
              )
            })}
            {roleIdx < ROLES.length - 1 && (
              <motion.span
                initial={reduceMotion ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 + wordIndex * 0.06 }}
                className="mr-[0.28em] select-none"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              >
                ·
              </motion.span>
            )}
          </span>
        )
      })}
    </h2>
  )
}

export default function HeroIdentity() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col gap-4">
      <AvailabilityBadge />

      <div className="flex flex-col gap-1">
        <motion.span
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-mono-code text-[0.62rem] uppercase tracking-[0.22em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Systems Architecture / Dossier
        </motion.span>

        <h1
          className="font-display font-light leading-[1.02] tracking-tight"
          style={{ fontSize: 'clamp(2.9rem, 7vw, 5.4rem)' }}
        >
          {NAME_WORDS.map((word, i) => (
            <MaskedWord key={word} word={word} index={i} accent={i === 1} />
          ))}
        </h1>
      </div>

      <RoleHeadline />

      <motion.p
        initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
        className="max-w-[34rem] text-sm leading-6"
        style={{ color: 'var(--text-secondary)' }}
      >
        {DESCRIPTION}
      </motion.p>

      <p className="sr-only">
        {personalInfo.name} — {ROLES.join(', ')}.
      </p>
    </div>
  )
}
