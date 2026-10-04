import type { ComponentType } from 'react'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { accentColor, accentRgb } from '@/utils/accents'
import { DURATION, EASE_OUT_EXPO } from '@/utils/motion'
import type { JourneyChapter } from '@/types'
import { journeyChapters } from '@/data'
import type { StageProps } from './stages/types'
import StageLearn from './stages/StageLearn'
import StageBuild from './stages/StageBuild'
import StageCompete from './stages/StageCompete'
import StageBackend from './stages/StageBackend'
import StageSystem from './stages/StageSystem'
import StageDesign from './stages/StageDesign'
import StageWork from './stages/StageWork'
import StagePublish from './stages/StagePublish'

/**
 * The stage — one picture per chapter, and the reason this section is a story
 * rather than a list.
 *
 * Every chapter gets its own drawing. There is no shared template with the
 * content swapped: Chapter I is a seed and its first four proofs, Chapter II is
 * four windows assembling, Chapter III a spotlight and a crowd, Chapter IV a
 * network boundary, Chapter V three roles on one lifecycle, Chapter VI a class
 * diagram becoming a sequence diagram, Chapter VII three services and a
 * 150-cell index, Chapter VIII the Chapter I seed inside a published package.
 *
 * They still read as one system because they share a frame, a travel spine and
 * the eight accumulating ticks along the bottom — see `stages/stageKit.tsx`.
 *
 * One treatment is mounted at a time. Switching chapters dissolves the new
 * drawing in over the frame, which is the moment the previous chapter hands over
 * to the next. Under `prefers-reduced-motion` the progress value is pinned at 1,
 * so every stage renders its finished state and the transition becomes a plain swap.
 *
 * The handover is a keyed remount rather than an `AnimatePresence` exit/enter
 * pair, for two reasons. Waiting mode unmounts the outgoing stage before mounting
 * the incoming one, so a fast scroll through several chapters can leave the frame
 * empty until the exit animation reports back — which is what happens on a slow
 * frame budget. And the simultaneous mode that fixes that keeps both drawings
 * mounted at once, so they stack and the panel grows to twice its height
 * mid-scroll. A remount can do neither. Continuity does not suffer: the frame,
 * the travel spine and the eight accumulating ticks live *outside* the keyed
 * child and never re-mount, so only the drawing changes.
 */

const STAGES: Record<string, { name: string; draw: ComponentType<StageProps> }> = {
  learn: { name: 'First light', draw: StageLearn },
  build: { name: 'Four tasks', draw: StageBuild },
  compete: { name: 'Under the spotlight', draw: StageCompete },
  backend: { name: 'Across the network', draw: StageBackend },
  systems: { name: 'Three roles, one lifecycle', draw: StageSystem },
  design: { name: 'The shape decides it', draw: StageDesign },
  ship: { name: 'What others depend on', draw: StageWork },
  publish: { name: 'A package', draw: StagePublish },
}

// A chapter with no drawing is the one failure this section cannot absorb — it
// would leave a blank frame beside the text with nothing to show for it. Check
// the keys against the data at load rather than finding out on screen.
const untreated = journeyChapters.filter((chapter) => !STAGES[chapter.id]).map((c) => c.id)
if (untreated.length > 0) {
  throw new Error(`Journey chapters with no stage treatment: ${untreated.join(', ')}`)
}

interface JourneyStageProps {
  chapter: JourneyChapter
  /** 0→1 scroll progress through that chapter's own block. */
  progress: StageProps['progress']
  /** Chapters already passed, 0–8. */
  travelled: number
  /** Small viewport: the drawing sheds detail instead of shrinking to nothing. */
  compact: boolean
}

export default function JourneyStage({
  chapter,
  progress,
  travelled,
  compact,
}: JourneyStageProps) {
  const reduceMotion = useReducedMotion()
  const accent = accentColor[chapter.accent]
  const rgb = accentRgb[chapter.accent]
  const stage = STAGES[chapter.id]
  const Draw = stage?.draw

  // Pinning the value at 1 is the whole reduced-motion story for this section:
  // stages choreograph off progress, so "finished" is simply "fully scrolled".
  const finished = useMotionValue(1)
  const value = reduceMotion ? finished : progress

  if (!Draw) return null

  // No `backdrop-blur` on the card on purpose: it sits over the section's
  // animated backdrop, and a backdrop filter would force the browser to re-blur
  // that moving layer every frame. A near-opaque fill reads the same but costs
  // nothing to composite.
  return (
    <div
      className="overflow-hidden rounded-2xl border p-3 sm:p-4"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--bg-secondary) 90%, transparent)',
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className="font-mono-code text-[0.58rem] uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {stage.name}
        </span>
        <span className="font-mono-code text-[0.55rem]" style={{ color: 'var(--text-muted)' }}>
          {travelled}/8 chapters passed
        </span>
      </div>

      <motion.div
        key={chapter.id}
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DURATION.quick, ease: EASE_OUT_EXPO }}
      >
        <Draw progress={value} accent={accent} rgb={rgb} travelled={travelled} compact={compact} />
      </motion.div>
    </div>
  )
}