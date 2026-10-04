import { useEffect, type RefObject } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { SPRING_POINTER } from '@/utils/motion'

/**
 * The atmosphere behind "The person behind the code".
 *
 * Three planes at different depths. They are the reason the section reads as a
 * room rather than a flat panel:
 *
 *  - a far perspective floor that barely moves, so the background has an
 *    orientation instead of being wallpaper;
 *  - a middle plane of slow contour rings;
 *  - a near plane of technical tokens that answers the pointer.
 *
 * All three are driven by two inputs only — where the section is in the viewport,
 * and where the pointer is. Nothing loops on a timer, so the section is still
 * when the visitor stops, and there is no motion competing with reading.
 *
 * Under `prefers-reduced-motion` the planes keep their composition but travel
 * nowhere: the amplitude is multiplied by zero rather than the layers being
 * removed, so the section still looks deliberate without moving.
 */

interface AboutDepthProps {
  targetRef: RefObject<HTMLElement>
}

const TOKENS = [
  { x: 6, y: 18, glyph: '{ }', size: 15 },
  { x: 17, y: 74, glyph: '#', size: 12 },
  { x: 88, y: 30, glyph: '◆', size: 10 },
  { x: 93, y: 62, glyph: '</>', size: 13 },
  { x: 12, y: 52, glyph: '[]', size: 11 },
  { x: 78, y: 12, glyph: '/*', size: 12 },
  { x: 40, y: 88, glyph: '·', size: 22 },
]

export default function AboutDepth({ targetRef }: AboutDepthProps) {
  const reduceMotion = useReducedMotion()
  const amp = reduceMotion ? 0 : 1

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start end', 'end start'] })

  // Pointer position, normalised to −1…1. Spring-smoothed so it drifts rather
  // than snaps, and shared by every near-plane token so they move together —
  // one connected system instead of several independent effects.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const softX = useSpring(pointerX, SPRING_POINTER)
  const softY = useSpring(pointerY, SPRING_POINTER)

  useEffect(() => {
    if (reduceMotion) return
    const onMove = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointerX, pointerY, reduceMotion])

  // Parallax. The near plane travels four times as far as the far one, which is
  // what sells the separation.
  const farY = useTransform(scrollYProgress, [0, 1], [70 * amp, -70 * amp])
  const midY = useTransform(scrollYProgress, [0, 1], [130 * amp, -130 * amp])
  const nearY = useTransform(scrollYProgress, [0, 1], [210 * amp, -210 * amp])
  const driftX = useTransform(softX, [-1, 1], [-30 * amp, 30 * amp])
  const driftY = useTransform(softY, [-1, 1], [-22 * amp, 22 * amp])

  // Presence: the planes are absent until the section arrives and fade as it
  // leaves, so the entry and the exit both read as transitions rather than cuts.
  const presence = useTransform(scrollYProgress, [0, 0.2, 0.82, 1], [0, 1, 1, 0])
  const nearPresence = useTransform(presence, [0, 1], [0.35, 1])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* ── Far plane: a perspective floor ──────────────────────────── */}
      <motion.svg
        style={{ y: farY, opacity: presence }}
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-[-6%] bottom-[-14%] h-[62%] w-[112%]"
        fill="none"
      >
        {Array.from({ length: 13 }, (_, i) => (
          <line
            key={`ray${i}`}
            x1={500}
            y1={-40}
            x2={i * 100 - 150}
            y2={600}
            stroke="var(--accent-teal)"
            strokeWidth={0.6}
            opacity={0.16}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={`row${i}`}
            x1={-200}
            y1={40 + i * i * 22}
            x2={1200}
            y2={40 + i * i * 22}
            stroke="var(--accent-teal)"
            strokeWidth={0.6}
            opacity={0.12}
          />
        ))}
      </motion.svg>

      {/* ── Middle plane: contour rings ─────────────────────────────── */}
      <motion.div style={{ y: midY, opacity: presence }} className="absolute inset-0">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="h-full w-full" fill="none">
          {[
            { cx: 200, cy: 200, rx: 300, ry: 190 },
            { cx: 800, cy: 420, rx: 340, ry: 210 },
            { cx: 520, cy: 120, rx: 260, ry: 150 },
          ].map((ring, i) => (
            <ellipse
              key={i}
              cx={ring.cx}
              cy={ring.cy}
              rx={ring.rx}
              ry={ring.ry}
              stroke="var(--accent-indigo)"
              strokeWidth={0.7}
              opacity={0.16}
            />
          ))}
        </svg>
      </motion.div>

      {/* ── Near plane: technical tokens, following the pointer ─────── */}
      <motion.div style={{ y: nearY, x: driftX, opacity: nearPresence }} className="absolute inset-0">
        <motion.div style={{ y: driftY }} className="absolute inset-0">
          {TOKENS.map((token) => (
            <span
              key={token.glyph + token.y}
              aria-hidden="true"
              className="absolute select-none font-mono-code"
              style={{
                left: `${token.x}%`,
                top: `${token.y}%`,
                fontSize: token.size,
                color: 'var(--accent-teal)',
                opacity: 0.22,
              }}
            >
              {token.glyph}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}