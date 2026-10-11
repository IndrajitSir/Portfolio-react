import {
  useId,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

/** A depth layer: flat at rest, moves `z` px toward the viewer when the card is hovered. */
export function TiltLayer({
  z,
  interactive = false,
  className = '',
  children,
}: {
  z: number
  /** Layers ignore the pointer by default; turn on for buttons and links. */
  interactive?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`tc-layer ${interactive ? 'tc-layer--live' : ''} ${className}`}
      style={{ '--z': `${z}px` } as CSSProperties}
    >
      {children}
    </div>
  )
}

interface TiltSurfaceProps {
  accent?: string
  /** Degrees at the card edge. Keep it small for big panels. */
  maxTilt?: number
  className?: string
  cardClassName?: string
  children: ReactNode
}

export function TiltSurface({
  accent = 'var(--accent-teal)',
  maxTilt = 6,
  className = '',
  cardClassName = '',
  children,
}: TiltSurfaceProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const grainId = `tc-grain-${useId().replace(/:/g, '')}`

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 170, damping: 20, mass: 0.5 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)

  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt])
  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt])
  const gx = useTransform(sx, [-0.5, 0.5], [0, 100])
  const gy = useTransform(sy, [-0.5, 0.5], [0, 100])
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in srgb, var(--tc-accent) 20%, transparent), transparent 55%)`

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse' || !rootRef.current) return
    const r = rootRef.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      ref={rootRef}
      className={`tc tc--fill ${className}`}
      style={{ '--tc-accent': accent } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className={`tc-card relative w-full rounded-xl ${cardClassName}`}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        <svg
          aria-hidden="true"
          className="tc-grain pointer-events-none absolute inset-0 h-full w-full rounded-xl"
        >
          <filter id={grainId}>
            <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.46" />
              <feFuncG type="linear" slope="0.46" />
              <feFuncB type="linear" slope="0.46" />
              <feFuncA type="linear" slope="0.56" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.47" intercept="-0.23" />
              <feFuncG type="linear" slope="1.47" intercept="-0.23" />
              <feFuncB type="linear" slope="1.47" intercept="-0.23" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainId})`} />
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              'radial-gradient(70% 45% at 30% 0%, color-mix(in srgb, var(--tc-accent) 12%, transparent), transparent 70%)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="tc-glare pointer-events-none absolute inset-0 rounded-xl"
          style={{ backgroundImage: glare }}
        />

        {children}
      </motion.div>
    </div>
  )
}