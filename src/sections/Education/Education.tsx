import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { SectionLabel, LearningOrb } from '@/components/ui'
import { Parallax } from '@/components/animations'
import FormulaStream from '@/components/originkit/ui/formula-stream'
import { educationList } from '@/data'
import AcademicJourney from './AcademicJourney'

/**
 * The Learning section's backdrop: the OriginKit formula stream.
 *
 * It replaces the section's previous generic orbit canvas rather than stacking
 * on top of it — the section gets one backdrop, not two — because a band of
 * mathematics and physics drifting across the header says "academic background"
 * in a way that concentric rings never did, and it is the same order of cost.
 *
 * Three adaptations make it belong here rather than look pasted in:
 *
 *  · **Palette.** The stream defaults to orange-on-black (Originkit's own
 *    identity). It is fed the portfolio's `--bg-secondary`, the muted body text
 *    colour at a third of its alpha, and a mono face at 13px, so what moves
 *    behind the heading reads as this site's type on this site's black.
 *  · **Bounded.** The root ships `minWidth: 1200 / minHeight: 800`, which would
 *    spill out of a phone and force a 2000px-tall canvas backing store on a
 *    tablet. Both are zeroed, the band is a fixed 720px at the top of the
 *    section, and a mask dissolves its lower edge so the timeline below is never
 *    competing with moving type.
 *  · **Gated twice.** It is mounted only while the section is near the viewport —
 *    the stream runs an unconditional `requestAnimationFrame` loop, and leaving
 *    it mounted four screens away would burn frames on something nobody can see —
 *    and it is not mounted at all under `prefers-reduced-motion`, where a field
 *    of drifting text is exactly the motion that setting exists to stop.
 *
 * The band is `pointer-events-none`: it is scenery, and the product's own cursor
 * companion, the section's draggable orb and every link in the timeline keep
 * their gestures. That also means the stream's cursor-repulsion never fires,
 * which is the right trade for a backdrop — and why it is not tuned for it.
 */
function FormulaField() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  // Generous margin: the band mounts a little before it is visible and stands
  // down once the reader is well past it, so scrolling in and out of the section
  // does not re-initialise the sprite atlases at the edge of the screen.
  const near = useInView(ref, { margin: '600px 0px 600px 0px' })

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, #000 42%, transparent 92%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 42%, transparent 92%)',
      }}
    >
      {near && !reduceMotion && (
        <FormulaStream
          background="#0d0f17"
          textColor="rgba(232, 234, 240, 0.26)"
          accent="#5eead4"
          density={13}
          speed={38}
          curve={26}
          gap={104}
          font={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontStyle: 'normal',
            fontWeight: 400,
            letterSpacing: '0.06em',
          }}
          style={{ minWidth: 0, minHeight: 0 }}
        />
      )}
    </div>
  )
}

export default function Education() {
  return (
    <section
      id="education"
      aria-label="Education section"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <FormulaField />
      <div className="max-container section-padding relative z-10">
        {/* The orb sits on the eyebrow line itself, directly after
            "06 — Learning", centred against the label's own baseline. The slot
            is what keeps it there rather than beside the section: the eyebrow
            row grows to whatever the orb needs, so the orb never has to be
            absolutely positioned over the heading below it, and the heading is
            never covered. Its size is a `clamp()` and its play area scales with
            it, so on a phone the orb shrinks to fit the short eyebrow line
            instead of pushing past the gutter. */}
        <SectionLabel
          index="06"
          label="Learning"
          title="Academic"
          titleAccent="background"
          trailing={<LearningOrb className="-ml-[calc(var(--orb-size)*0.26)]" />}
        />

        {/* The journey is ordered earliest → latest and fills in as you scroll,
            so the progression itself is the story. Carried on its own layer so
            the timeline lags the text above it as the reader travels down. */}
        <Parallax distance={18}>
          <AcademicJourney items={educationList} />
        </Parallax>
      </div>
    </section>
  )
}
