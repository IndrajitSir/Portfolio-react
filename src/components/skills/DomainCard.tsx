import { useRef, useState, type ComponentProps } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { IconType } from 'react-icons'
import { TiltLayer, TiltSurface } from '@/components/ui/TiltSurface'
import { EvidenceChip } from '../ui/SkillConstellation'

type Evidence = ComponentProps<typeof EvidenceChip>['evidence']

export interface DomainItem {
  name: string
  evidence: Evidence[]
  Icon: IconType
}

export interface DomainData {
  id: string
  title: string
  short: string
  summary: string
  evidenceCount: number
  connects: string[]
  Icon: IconType
  items: DomainItem[]
}

/* ── Tooltip ────────────────────────────────────────────────────────────
   Portalled to <body> with fixed positioning, so the card's scroll area and
   3D context can never clip it. aria-hidden: the button's aria-label already
   carries the same information. */
interface TipState { x: number; top: number; bottom: number }

function Tooltip({ tip, item }: { tip: TipState; item: DomainItem }) {
  const below = tip.top < 150
  const x = Math.min(Math.max(tip.x, 116), window.innerWidth - 116)
  const shown = item.evidence.slice(0, 3)
  const more = item.evidence.length - shown.length

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[200]"
      style={{
        left: x,
        top: below ? tip.bottom + 10 : tip.top - 10,
        transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: below ? -4 : 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="w-max max-w-[220px] rounded-lg border px-3 py-2 shadow-xl"
        style={{
          background: 'var(--panel-raised)',
          borderColor: 'var(--border-glow)',
          boxShadow: '0 12px 30px -12px rgba(0,0,0,0.6), 0 0 22px -10px var(--accent-teal)',
        }}
      >
        <p
          className="font-mono-code text-[0.66rem] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--accent-teal)' }}
        >
          {item.name}
        </p>
        <p className="font-mono-code text-[0.56rem] uppercase" style={{ color: 'var(--text-muted)' }}>
          {item.evidence.length} {item.evidence.length === 1 ? 'piece' : 'pieces'} of evidence
        </p>
        <div className="mt-1.5 space-y-0.5">
          {shown.map((e, i) => (
            <p key={i} className="text-[0.68rem] leading-snug" style={{ color: 'var(--text-secondary)' }}>
              – {e.label}
            </p>
          ))}
          {more > 0 && (
            <p className="text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
              + {more} more
            </p>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}

/* ── One technology tile ──────────────────────────────────────────────── */
function SkillIcon({
  item,
  index,
  selected,
  onSelect,
}: {
  item: DomainItem
  index: number
  selected: boolean
  onSelect: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [tip, setTip] = useState<TipState | null>(null)
  const Icon = item.Icon

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setTip({ x: r.left + r.width / 2, top: r.top, bottom: r.bottom })
  }
  const hide = () => setTip(null)

  // Tiles sit at staggered depths, so the grid shears as the card tilts.
  const z = 26 + (index % 3) * 12

  return (
    <>
      <TiltLayer z={z} interactive className="shrink-0">
        <button
          ref={ref}
          type="button"
          onClick={onSelect}
          onPointerEnter={show}
          onPointerLeave={hide}
          onFocus={show}
          onBlur={hide}
          aria-pressed={selected}
          aria-label={`${item.name}, ${item.evidence.length} ${
            item.evidence.length === 1 ? 'piece' : 'pieces'
          } of evidence`}
          data-selected={selected}
          className="sk-tile"
        >
          <span className="sk-float" style={{ '--d': `${index * 0.45}s` } as React.CSSProperties}>
            <Icon size={24} />
          </span>
        </button>
      </TiltLayer>
      {tip && <Tooltip tip={tip} item={item} />}
    </>
  )
}

/* ── The card ─────────────────────────────────────────────────────────── */
interface DomainCardProps {
  domain: DomainData
  domains: DomainData[]
  onJump: (id: string) => void
}

export default function DomainCard({ domain }: DomainCardProps) {
  const reduceMotion = useReducedMotion()
  // Resets for free: the parent's keyed motion.div remounts this per domain.
  const [selected, setSelected] = useState<string | null>(null)

  const CategoryIcon = domain.Icon
  const current = domain.items.find((i) => i.name === selected) ?? null
  const SelectedIcon = current?.Icon

  return (
    <TiltSurface maxTilt={5} cardClassName="p-5">
      {/* Header */}
      <div className="tc-3d flex items-center gap-4">
        <TiltLayer z={64} className="shrink-0">
          <span className="tc-badge flex h-14 w-14 items-center justify-center rounded-2xl">
            <CategoryIcon size={26} />
          </span>
        </TiltLayer>
        <TiltLayer z={34}>
          <h3
            className="font-mono-code text-[0.78rem] uppercase tracking-widest"
            style={{ color: 'var(--accent-teal)' }}
          >
            {domain.title}
          </h3>
          <p className="font-mono-code text-[0.62rem]" style={{ color: 'var(--text-muted)' }}>
            {domain.evidenceCount} pieces of evidence
          </p>
        </TiltLayer>
      </div>

      <TiltLayer z={18} className="mt-4">
        <p className="text-[0.78rem] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
          {domain.summary}
        </p>
      </TiltLayer>

      {/* Stack */}
      <TiltLayer z={22} className="mt-5">
        <p
          className="font-mono-code text-[0.56rem] uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Stack · hover for a summary, select for the evidence
        </p>
      </TiltLayer>

      <div className="tc-3d mt-2.5 flex flex-wrap gap-3">
        {domain.items.map((item, i) => (
          <SkillIcon
            key={item.name}
            item={item}
            index={i}
            selected={selected === item.name}
            onSelect={() => setSelected((s) => (s === item.name ? null : item.name))}
          />
        ))}
      </div>

      {/* Evidence tray: fixed height, so selecting never moves the card */}
      <TiltLayer z={14} interactive className="mt-4">
        <div
          data-lenis-prevent
          className="h-[112px] overflow-y-auto overscroll-contain rounded-lg border p-3"
          style={{ background: 'var(--panel-raised)', borderColor: 'var(--border)' }}
        >
          <motion.div
            key={current?.name ?? 'idle'}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {current && SelectedIcon ? (
              <>
                <p
                  className="mb-2 flex items-center gap-2 font-mono-code text-[0.6rem] uppercase tracking-widest"
                  style={{ color: 'var(--accent-teal)' }}
                >
                  <SelectedIcon size={13} />
                  {current.name}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {current.evidence.map((evidence, i) => (
                    <li key={`${current.name}-${evidence.label}-${i}`}>
                      <EvidenceChip evidence={evidence} />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-[0.72rem] leading-5" style={{ color: 'var(--text-muted)' }}>
                Select an icon to see where it shows up in my roles, projects and credentials.
              </p>
            )}
          </motion.div>
        </div>
      </TiltLayer>
    </TiltSurface>
  )
}