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
  type SpringOptions,
} from 'framer-motion'

/**
 * A reusable 3D tilt surface.
 *
 * The component owns one idea: lean the card toward the pointer and let a soft
 * accent glare track it, with a spring so it never snaps. Everything else — the
 * border, the background, the content — belongs to the consumer, so the same
 * component can back a certification row, a project tile or anything else.
 *
 * It degrades cleanly: `prefers-reduced-motion` and non-mouse pointers (touch)
 * get a static surface that still lights up on hover and focus, so the card is
 * fully usable without the motion.
 */
export interface TiltCardProps {
  children: ReactNode
  /** Extra classes for the tilting surface — radius, border, background, padding. */
  className?: string
  /** Extra classes for the outer perspective wrapper — sizing, spacing, grid placement. */
  wrapperClassName?: string
  /** Maximum rotation, in degrees, reached at the card's edge. */
  maxTilt?: number
  /** CSS perspective in px. Smaller values exaggerate the depth. */
  perspective?: number
  /** Scale applied while the pointer is over the card. */
  hoverScale?: number
  /** Accent colour driving the glow and the pointer glare. */
  accent?: string
  /** Spring that settles the tilt — stiffness/damping or `{ duration, bounce }`. */
  spring?: SpringOptions
  /** Render the grain, accent wash and pointer glare treatment. */
  effects?: boolean
  /** Turn the pointer-following tilt off, leaving the surface static. */
  disabled?: boolean
}

/** The default is a soft, restrained settle — premium, never bouncy. */
const DEFAULT_SPRING: SpringOptions = { stiffness: 170, damping: 20, mass: 0.5 }

export default function TiltCard({
  children,
  className = '',
  wrapperClassName = '',
  maxTilt = 8,
  perspective = 1000,
  hoverScale = 1.01,
  accent = 'var(--accent-teal)',
  spring = DEFAULT_SPRING,
  effects = true,
  disabled = false,
}: TiltCardProps) {
  const reduceMotion = useReducedMotion()
  const interactive = !disabled && !reduceMotion
  const rootRef = useRef<HTMLDivElement>(null)
  // Each card needs its own filter id, or every grain layer would share one.
  const grainId = `tc-grain-${useId().replace(/:/g, '')}`

  // Pointer position over the card, -0.5 … 0.5, springed so it never snaps.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)

  // The edge nearest the cursor tips away, like pressing a rocker.
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt])
  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt])

  const gx = useTransform(sx, [-0.5, 0.5], [0, 100])
  const gy = useTransform(sy, [-0.5, 0.5], [0, 100])
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in srgb, var(--tc-accent) 20%, transparent), transparent 55%)`

  // Measured on the wrapper (which never rotates), so the tilt can't feed
  // back into its own pointer coordinates.
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || e.pointerType !== 'mouse' || !rootRef.current) return
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
      className={`tc group ${wrapperClassName}`}
      style={{ '--tc-accent': accent, perspective: `${perspective}px` } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className={`tc-card ${className}`}
        style={interactive ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        whileHover={interactive ? { scale: hoverScale } : undefined}
      >
        {/* Backdrop: grain and accent wash sit under the content. */}
        {effects && (
          <>
            <svg aria-hidden="true" className="tc-grain pointer-events-none absolute inset-0 h-full w-full">
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
            <div aria-hidden="true" className="tc-wash pointer-events-none absolute inset-0" />
          </>
        )}

        <div className="relative">{children}</div>

        {/* Glare sits on top of the content, at low opacity, so it reads as light. */}
        {effects && interactive && (
          <motion.div
            aria-hidden="true"
            className="tc-glare pointer-events-none absolute inset-0"
            style={{ backgroundImage: glare }}
          />
        )}
      </motion.div>
    </div>
  )
}
