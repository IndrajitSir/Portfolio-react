import {
  useId,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import type { IconType } from 'react-icons'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'

const MAX_TILT = 10 // degrees at the card edge

interface TiltCardProps {
  title: string
  /** Large icon in the middle of the card. */
  icon: IconType
  /** Icons that travel around it. 4–6 looks best. */
  orbit?: IconType[]
  /** Small label with a live dot, top-left. */
  status?: string
  footer?: string
  /** Makes the whole card a link (stretched-link pattern). */
  href?: string
  accent?: string
  className?: string
}

/** A depth layer: sits flat at rest and moves `z` px toward the viewer on hover. */
function Layer({
  z,
  className = '',
  children,
}: {
  z: number
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`tc-layer ${className}`} style={{ '--z': `${z}px` } as CSSProperties}>
      {children}
    </div>
  )
}

export default function TiltCard({
  title,
  icon: Icon,
  orbit = [],
  status,
  footer,
  href,
  accent = 'var(--accent-teal)',
  className = '',
}: TiltCardProps) {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  // Each card needs its own filter id, or every grain layer would share one.
  const grainId = `tc-grain-${useId().replace(/:/g, '')}`

  // Pointer position over the card, -0.5 … 0.5, springed so it never snaps.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 170, damping: 20, mass: 0.5 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)

  // The edge nearest the cursor tips away, like pressing a rocker.
  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT])
  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_TILT, -MAX_TILT])

  const gx = useTransform(sx, [-0.5, 0.5], [0, 100])
  const gy = useTransform(sy, [-0.5, 0.5], [0, 100])
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, color-mix(in srgb, var(--tc-accent) 22%, transparent), transparent 55%)`

  // Measured on the wrapper (which never rotates), so the tilt can't feed
  // back into its own pointer coordinates.
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
      className={`tc ${className}`}
      style={{ '--tc-accent': accent } as CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        className="tc-card relative h-[350px] w-[290px] rounded-xl sm:h-[370px] sm:w-[300px]"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        {/* Flat backdrop: grain, accent wash, pointer glare */}
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
              'radial-gradient(70% 45% at 50% 62%, color-mix(in srgb, var(--tc-accent) 14%, transparent), transparent 70%)',
          }}
        />
        <motion.div
          aria-hidden="true"
          className="tc-glare pointer-events-none absolute inset-0 rounded-xl"
          style={{ backgroundImage: glare }}
        />

        {/* Orbit: furthest back, so it reads as the environment */}
        {orbit.length > 0 && (
          <Layer z={12} className="tc-orbit-mask absolute inset-0">
            <div className="tc-orbit absolute left-1/2 top-[62%] h-0 w-0">
              {orbit.map((OrbitIcon, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="tc-orbit-item"
                  style={{ '--a': `${(360 / orbit.length) * i}deg` } as CSSProperties}
                >
                  <OrbitIcon size={18} />
                </span>
              ))}
            </div>
          </Layer>
        )}

        {/* Status */}
        {status && (
          <Layer z={30} className="absolute left-4 top-4">
            <div
              className="flex items-center gap-2 font-mono-code text-[0.62rem] uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping"
                  style={{ background: 'var(--tc-accent)' }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--tc-accent)' }}
                />
              </span>
              {status}
            </div>
          </Layer>
        )}

        {/* Title */}
        <Layer z={55} className="absolute inset-x-0 top-14 px-4 text-center">
          <p
            className="font-display text-[1.7rem] font-light leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </p>
        </Layer>

        {/* Centrepiece: closest to the viewer */}
        <Layer z={85} className="absolute inset-x-0 top-[62%] -mt-9 flex justify-center">
          <span className="tc-badge flex h-[72px] w-[72px] items-center justify-center rounded-2xl">
            <Icon size={30} />
          </span>
        </Layer>

        {/* Footer */}
        {footer && (
          <Layer z={35} className="absolute inset-x-0 bottom-6 px-6 text-center">
            <p
              className="font-mono-code text-[0.62rem] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {footer}
            </p>
          </Layer>
        )}

        {/* Stretched link: layers ignore pointer events, so this takes every click */}
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title}: open project`}
            className="absolute inset-0 rounded-xl"
          />
        )}
      </motion.div>
    </div>
  )
}