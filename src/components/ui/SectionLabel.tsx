import type { ReactNode } from 'react'
import { MaskReveal, SlideIn } from '@/components/animations'

interface SectionLabelProps {
  index: string
  label: string
  title: string
  titleAccent?: string // italic coloured word at the end
  className?: string
  /**
   * An object to sit on the eyebrow line, immediately after `index — label`.
   *
   * Deliberately a slot rather than a hard-coded decoration: the eyebrow is the
   * one line every section already has, so anything that belongs *with* the
   * heading has somewhere honest to live, and each section decides whether it
   * has one. A trailing object is centred against the label's own line, which is
   * why the row's height is the object's height — nothing is absolutely
   * positioned over the heading below it.
   */
  trailing?: ReactNode
}

/**
 * The eyebrow + heading that opens every section.
 *
 * The eyebrow slides in from the left — the direction the section's own rail
 * runs — and the heading is uncovered by a clip mask, so it reads as being
 * printed rather than fading up. Both are shared primitives, so every section
 * opens with the same two beats.
 */
export default function SectionLabel({
  index,
  label,
  title,
  titleAccent,
  className = '',
  trailing,
}: SectionLabelProps) {
  return (
    <div className={`mb-14 ${className}`}>
      {/* eyebrow */}
      <SlideIn from="left" distance={22} className="flex items-center gap-3 mb-3">
        <span
          className="block w-6 h-px"
          style={{ background: 'var(--accent-teal)' }}
        />
        <span
          className="font-mono-code text-xs tracking-widest uppercase whitespace-nowrap"
          style={{ color: 'var(--accent-teal)' }}
        >
          {index} — {label}
        </span>
        {trailing}
      </SlideIn>

      {/* heading */}
      <h2
        className="font-display font-light leading-tight text-[clamp(2rem,4vw,3.2rem)] tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        <MaskReveal>
          {title}
          {titleAccent && (
            <>
              {' '}
              <em className="not-italic" style={{ color: 'var(--accent-teal)' }}>
                {titleAccent}
              </em>
            </>
          )}
        </MaskReveal>
      </h2>
    </div>
  )
}
