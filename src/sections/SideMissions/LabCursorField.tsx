import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import CursorRingField from '@/components/originkit/ui/cursor-ring-field'

/**
 * LabCursorField
 * ─────────────────────────────────────────────────────────────────────────────
 * The Side Missions page's ambient backdrop: OriginKit's cursor-reactive
 * particle field, drifting behind the "experimental lab" header. The ring
 * wanders on its own and hands over to the cursor when a pointer is present —
 * exactly the "play with something weird" invitation this route is about.
 *
 * Why here and not the portfolio home: Strobi (the portfolio's own cursor
 * companion) is deliberately unmounted on this route (see `App.tsx`), so a
 * cursor-reactive field here cannot fight the hero's existing cursor systems.
 *
 * Adaptations from the raw OriginKit component:
 *   • Colors follow the route's indigo accent identity (`var(--accent-indigo)`
 *     equivalents) rather than the library's blue/violet defaults.
 *   • Density and dot size are trimmed well under defaults so the field stays
 *     a whisper behind text, not a foreground.
 *   • The component runs an always-on rAF from mount, so the scene only mounts
 *     while the viewport is near the page top and never under
 *     `prefers-reduced-motion` (no meaningful static frame exists).
 *   • Placed at `z-0` under the section's `z-10` content and with
 *     `pointer-events-none` — it can never block link taps on the mission
 *     cards.
 */

export default function LabCursorField() {
  const reduceMotion = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const near = useInView(frameRef, { margin: '200px 0px 200px 0px' })

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[46vh] overflow-hidden opacity-[0.42]"
    >
      {near && !reduceMotion && (
        <CursorRingField
          background="transparent"
          colors={['#818cf8', '#5eead4', '#0b0b18']}
          density={55}
          dotSize={55}
          speed={4}
          cameraDistance={175}
          ring={{
            // Tuned after measuring: tighter ring, softer push and gentler
            // turbulence — the field steers obediently and stays a whisper
            // instead of grabbing attention away from the mission cards.
            push: 30,
            width: 7.5,
            radius: 9.5,
            turbulence: 55,
          }}
          style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }}
        />
      )}
    </div>
  )
}
