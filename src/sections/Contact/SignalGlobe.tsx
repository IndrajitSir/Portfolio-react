import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Globe from '@/components/originkit/ui/globe'
import { personalInfo } from '@/data'

/**
 * SignalGlobe
 * ─────────────────────────────────────────────────────────────────────────────
 * The visual half of the Contact section's "signal reaches me directly" story.
 * OriginKit's dotted earth sits in a slim instrument panel in the left column:
 * the marker sits on the contributor's real location, the ring slowly rotates,
 * and a mono caption frames it as a live telemetry readout — consistent with
 * the runtime language the rest of the portfolio already speaks.
 * One-OriginKit-component-per-section: this globe is Contact's only OriginKit
 * scene; the pulse behind the section is our own `SignalPulse`.
 *
 * Adaptations from the raw OriginKit component:
 *   • The palette is remapped to the site's accents: teal land dots, indigo
 *     markers, near-black ocean — instead of the library's white/black.
 *   • The component rebuilds its whole scene whenever props churn, so every
 *     prop read from tokens is memoised once — render-stable by construction.
 *   • The scene mounts only while the contact section is near the viewport,
 *     and never mounts under `prefers-reduced-motion`.
 *   • A restrained scroll parallax (±14px, transform-only) drifts the panel
 *     against the page, so the left column has the same depth cues the rest
 *     of the portfolio already uses. Reduced motion keeps the panel still.
 */

const PANEL_HEIGHT = 'clamp(220px, 34vh, 300px)'

export default function SignalGlobe() {
  const reduceMotion = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const near = useInView(frameRef, { margin: '240px 0px 240px 0px' })

  // Travel the panel itself makes through the viewport; drive a small
  // transform-only drift from it. No layout property is animated.
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [14, -14])

  // OriginKit's Globe tears down and rebuilds its entire Three.js scene when
  // any of these change, so all of them are render-stable (literal or memoised)
  // — one lifetime, one scene, no rebuild loops.
  const dots = useMemo(
    () => ({ color: '#5eead4', size: 5, density: 7, allDots: false }),
    [],
  )
  const markerConfig = useMemo(
    () => ({
      markers: [
        // West Bengal, India — the location the Contact telemetry reports.
        { lat: 22.9868, lng: 87.855 },
      ],
      color: '#818cf8',
      size: 55,
    }),
    [],
  )

  return (
    <motion.div
      style={reduceMotion ? undefined : { y: parallaxY }}
    >
      <div
        data-reveal
        ref={frameRef}
        aria-hidden="true"
        className="relative rounded-2xl border overflow-hidden pointer-events-none"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        {/* Corner brackets — the same instrument language the topology card uses. */}
        <span
          aria-hidden="true"
          className="absolute left-3 top-3 h-3 w-3 border-l border-t"
          style={{ borderColor: 'var(--border-glow)' }}
        />
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 h-3 w-3 border-r border-b"
          style={{ borderColor: 'var(--border-glow)' }}
        />

        <div className="relative" style={{ height: PANEL_HEIGHT }}>
          {near && !reduceMotion && (
            <Globe
              dots={dots}
              markerConfig={markerConfig}
              fill="dots"
              showOutline={false}
              showGrid={false}
              speed={2}
              direction="left"
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        <div
          className="flex items-center justify-between px-4 py-2.5 border-t font-mono-code text-[0.6rem] uppercase tracking-[0.18em]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>
            Uplink: <span style={{ color: 'var(--accent-teal)' }}>{personalInfo.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--accent-teal)' }}
              aria-hidden="true"
            />
            Reachable
          </span>
        </div>
      </div>
    </motion.div>
  )
}
