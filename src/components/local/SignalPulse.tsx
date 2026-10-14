import { useEffect, useRef } from 'react'

/**
 * SignalPulse
 * ─────────────────────────────────────────────────────────────────────────────
 * Our own component, written the way the OriginKit library builds its scenes
 * (audited from energy-ring / saturn / cursor-ring-field):
 *
 *   • one useEffect owns the whole scene; props live in a ref so re-renders
 *     never touch the loop.
 *   • one rAF loop, delta-time clamped so a tab-switch can't jump the phase.
 *   • device pixel ratio capped at 2; transparent background via clearRect so
 *     the section's own surface shows through.
 *   • `prefers-reduced-motion` renders one calm frame and never starts the
 *     loop — a still, coherent composition instead of an always-on animation.
 *   • cleanup cancels the frame and every listener is scoped to the canvas, so
 *     teardown is complete.
 *
 * Design: a slow radar-style pulse — three rings expanding from a core beacon
 * while a faint sweep rotates inside. It is deliberately *soft*: additive
 * strokes, no flashing, the palette driven entirely by caller-passed colors so
 * it can be tuned per-section. It is the Contact section's signal — the visual
 * argument for "the signal reaches me directly".
 */

export interface SignalPulseProps {
  /** Core + ring color (site teal by default). */
  accent?: string
  /** Secondary hue mixing into the outermost ring (site indigo). */
  secondary?: string
  /** 0–100: how strongly rings are drawn; percentage keeps tuning neutral. */
  intensity?: number
  /** Seconds for one ring to travel edge → fade. Higher = calmer. */
  period?: number
  /** Rotation speed of the sweep, degrees per second. 0 = no sweep. */
  sweep?: number
  /** Transparent by default; a color string paints an opaque backdrop. */
  background?: string
  className?: string
  style?: React.CSSProperties
}

export default function SignalPulse({
  accent = '#5eead4',
  secondary = '#818cf8',
  intensity = 55,
  period = 5.2,
  sweep = 8,
  background,
  className,
  style,
}: SignalPulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Loop-read state rides in a ref, OriginKit-style: the effect below closes
  // over it once and never re-subscribes.
  const live = useRef({ accent, secondary, intensity, period, sweep, background })
  live.current = { accent, secondary, intensity, period, sweep, background }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let W = 1
    let H = 1
    let dpr = 1
    const clampDpr = Math.min(window.devicePixelRatio || 1, 2)
    let t = 0
    let last = 0

    const rgbaOf = (hex: string, a: number) => {
      const m = hex.trim().match(/^#([0-9a-f]{6})$/i)
      if (!m) return hex
      const n = parseInt(m[1], 16)
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`
    }

    const resize = () => {
      const parent = canvas.parentElement
      W = Math.max(1, parent?.clientWidth || canvas.clientWidth || 1)
      H = Math.max(1, parent?.clientHeight || canvas.clientHeight || 1)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
    }
    const ro = new ResizeObserver(resize)
    resize()
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const paint = (time: number) => {
      const p = live.current
      const R = Math.min(W, H) / 2
      const cx = W / 2
      const cy = H / 2
      const k = Math.max(0, Math.min(100, p.intensity)) / 100

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      if (p.background && p.background !== 'transparent') {
        ctx.fillStyle = p.background
        ctx.fillRect(0, 0, W, H)
      } else {
        ctx.clearRect(0, 0, W, H)
      }

      // The static ring rim — quiet, always present.
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineWidth = 1
      ctx.strokeStyle = rgbaOf(p.accent, 0.16 * k + 0.06)
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.94, 0, Math.PI * 2)
      ctx.stroke()

      // Three phase-offset pulses expanding outward and fading.
      const P = Math.max(1.5, p.period)
      for (let i = 0; i < 3; i++) {
        const u = ((time / P + i / 3) % 1 + 1) % 1
        const r = R * (0.16 + 0.78 * u)
        const fade = Math.sin(Math.PI * u) ** 1.4 // in → out envelope
        ctx.lineWidth = 1.4 + 2.6 * (1 - u)
        ctx.strokeStyle = rgbaOf(i === 2 ? p.secondary : p.accent, 0.34 * k * fade)
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Rotating sweep: a soft wedge, barely there.
      if (p.sweep > 0) {
        const a = (time * p.sweep * Math.PI) / 180
        const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R)
        grad.addColorStop(0, rgbaOf(p.accent, 0))
        grad.addColorStop(0.72, rgbaOf(p.accent, 0.06 * k))
        grad.addColorStop(1, rgbaOf(p.accent, 0))
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R, a, a + Math.PI / 5)
        ctx.closePath()
        ctx.fill()
      }

      // Core beacon with a slow breath.
      const breath = 0.8 + 0.2 * Math.sin(time * 1.1)
      ctx.globalCompositeOperation = 'source-over'
      ctx.beginPath()
      ctx.arc(cx, cy, 2.6 * clampDpr, 0, Math.PI * 2)
      ctx.fillStyle = rgbaOf(p.accent, 0.9)
      ctx.shadowColor = rgbaOf(p.accent, 0.55 * breath)
      ctx.shadowBlur = 14 * dpr
      ctx.fill()
      ctx.shadowBlur = 0
    }

    if (reduceMotion) {
      // One calm frame — a still composition instead of a loop.
      resize()
      paint(1.7)
      return () => ro.disconnect()
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0
      last = now
      t += dt
      if (W < 4 || H < 4) return
      paint(t)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  )
}
