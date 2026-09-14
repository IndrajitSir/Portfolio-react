import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

const DEFAULT_ROLES = [
  'Junior Software Developer',
  'Chess Player',
  'Backend Engineer',
  'API Architect',
  'Problem Solver',
]

interface UseTypewriterOptions {
  /** Characters per second while typing */
  typeSpeed?: number
  /** Characters per second while deleting */
  deleteSpeed?: number
  /** Pause in ms once a word is fully typed */
  holdDelay?: number
}

/**
 * Character-by-character typewriter powered by framer-motion's `animate`
 * (rAF + interpolation — no setInterval/setTimeout typing loops).
 */
function useTypewriter(
  words: string[],
  { typeSpeed = 90, deleteSpeed = 50, holdDelay = 2300 }: UseTypewriterOptions = {},
) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState('')
  const [phase, setPhase] = useState<'typing' | 'deleting' | 'holding'>('typing')

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(words[0])
      return
    }

    const word = words[index % words.length]
    let cancelled = false

    if (phase === 'holding') {
      const timer = window.setTimeout(() => setPhase('deleting'), holdDelay)
      return () => window.clearTimeout(timer)
    }

    const isTyping = phase === 'typing'
    const from = isTyping ? 0 : word.length
    const to = isTyping ? word.length : 0
    const cps = isTyping ? typeSpeed : deleteSpeed
    const duration = Math.max(Math.abs(to - from) / cps, 0.1)

    const controls = animate(from, to, {
      duration,
      ease: 'linear',
      onUpdate: (value) => {
        if (!cancelled) setDisplay(word.slice(0, Math.round(value)))
      },
      onComplete: () => {
        if (cancelled) return
        if (isTyping) {
          setPhase('holding')
        } else {
          setIndex((current) => (current + 1) % words.length)
          setPhase('typing')
        }
      },
    })

    return () => {
      cancelled = true
      controls.stop()
    }
  }, [index, phase, words, typeSpeed, deleteSpeed, holdDelay, reduceMotion])

  return display
}

interface CodeTypingWindowProps {
  roles?: string[]
  typeSpeed?: number
  deleteSpeed?: number
  holdDelay?: number
  className?: string
}

export default function CodeTypingWindow({
  roles = DEFAULT_ROLES,
  typeSpeed = 90,
  deleteSpeed = 50,
  holdDelay = 2300,
  className = '',
}: CodeTypingWindowProps) {
  const currentRole = useTypewriter(roles, { typeSpeed, deleteSpeed, holdDelay })

  return (
    <figure
      className={`overflow-hidden rounded-xl border border-white/10 bg-[#0c0e15]/90 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl ${className}`}
      aria-label={`Code editor showing current role: ${currentRole}`}
    >
      {/* ── Window chrome ─────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex-1">
          <div className="mx-auto w-fit rounded-md bg-white/5 px-3 py-0.5 font-mono text-[0.68rem] tracking-wide text-slate-400">
            ~/portfolio/src/hero.tsx
          </div>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────── */}
      <div className="flex items-end gap-1 border-b border-white/10 px-3">
        <div className="flex items-center gap-2 rounded-t-md border-x border-t border-white/10 bg-[#0c0e15] px-3 py-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-400/80" />
          <span className="font-mono text-[0.72rem] text-slate-200">hero.tsx</span>
          <span className="ml-1 text-[0.65rem] text-slate-500">✕</span>
        </div>
        <div className="hidden items-center gap-2 rounded-t-md px-3 py-1.5 sm:flex">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-600" />
          <span className="font-mono text-[0.72rem] text-slate-500">App.tsx</span>
        </div>
      </div>

      {/* ── Editor body ───────────────────────────────── */}
      <div className="overflow-x-auto p-4 font-mono text-[0.8rem] leading-7 sm:text-[0.85rem]">
        <pre className="min-w-max">
          <code>
            <div className="flex gap-4">
              <span className="select-none text-right text-slate-600">1</span>
              <span className="text-slate-500">// Indrajit Mandal — developer profile</span>
            </div>
            <div className="flex gap-4">
              <span className="select-none text-right text-slate-600">2</span>
              <span>
                <span className="text-indigo-300">const</span>{' '}
                <span className="text-slate-200">developer</span>{' '}
                <span className="text-slate-400">=</span> <span className="text-slate-400">{'{'}</span>
              </span>
            </div>
            <div className="flex gap-4">
              <span className="select-none text-right text-slate-600">3</span>
              <span className="pl-4">
                <span className="text-slate-200">name</span>
                <span className="text-slate-400">:</span>{' '}
                <span className="text-teal-300">&quot;Indrajit Mandal&quot;</span>
                <span className="text-slate-400">,</span>
              </span>
            </div>

            {/* Active typing line */}
            <div className="flex gap-4 bg-teal-400/[0.04]">
              <span className="select-none text-right text-slate-600">4</span>
              <span className="pl-4">
                <span className="text-slate-200">role</span>
                <span className="text-slate-400">:</span>{' '}
                <span className="text-teal-300">
                  &quot;{currentRole}&quot;
                  <span
                    className="editor-cursor"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-slate-400">,</span>
              </span>
            </div>

            <div className="flex gap-4">
              <span className="select-none text-right text-slate-600">5</span>
              <span className="text-slate-400">{'};'}</span>
            </div>
          </code>
        </pre>
      </div>
    </figure>
  )
}
