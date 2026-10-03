import { useEffect, useRef } from 'react'
import { drawGrid } from '@/utils/canvas'
import { useCanvasScene, type SceneFrame } from '@/hooks'

// Bubble Game showcase: a real, playable miniature of the actual game — a grid
// of numbered bubbles, a hit target, a 60-second timer and a running score.
// Popping a matching bubble scores. Vertical page scroll is preserved via
// `touch-action: pan-y`; nothing calls preventDefault.
interface Bubble {
  value: number
  popT: number
  bob: number
}

export default function BubbleGameCanvas() {
  const bubblesRef = useRef<Bubble[]>([])
  const colsRef = useRef(0)
  const rowsRef = useRef(0)
  const targetRef = useRef(5)
  const scoreRef = useRef(0)
  const popupsRef = useRef<{ x: number; y: number; t: number }[]>([])
  const pointerRef = useRef({ x: -999, y: -999, active: false })
  const canvasRef = useCanvasScene(({ ctx, W, H, t, pal }: SceneFrame) => {
    drawGrid(ctx, W, H, 22, `rgba(${pal.teal},${pal.isLight ? 0.05 : 0.06})`)

    const topY = 34
    const bottomY = H - 18
    const cell = 26
    const cols = Math.max(5, Math.floor((W - 20) / cell))
    const rows = Math.max(3, Math.floor((bottomY - topY) / cell))

    // (Re)seed the bubble grid when the layout size changes.
    if (cols !== colsRef.current || rows !== rowsRef.current) {
      colsRef.current = cols
      rowsRef.current = rows
      bubblesRef.current = Array.from({ length: cols * rows }, () => ({
        value: 1 + Math.floor(Math.random() * 9),
        popT: 1,
        bob: Math.random() * Math.PI * 2,
      }))
    }

    // Target rotates so the "hit number" reads as a live objective.
    targetRef.current = 1 + (Math.floor(t / 6) % 9)

    const gridW = cols * cell
    const offsetX = (W - gridW) / 2
    const bubbles = bubblesRef.current

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c
        const b = bubbles[idx]
        if (!b) continue
        const bx = offsetX + c * cell + cell / 2
        const by = topY + r * cell + cell / 2 + Math.sin(t * 1.4 + b.bob) * 1.6
        const radius = (cell - 7) / 2

        if (b.popT < 1) {
          // pop burst
          b.popT = Math.min(1, b.popT + 0.06)
          const fade = 1 - b.popT
          ctx.strokeStyle = `rgba(${pal.teal},${fade * 0.9})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(bx, by, radius + b.popT * 12, 0, Math.PI * 2)
          ctx.stroke()
          if (b.popT >= 1) b.value = 1 + Math.floor(Math.random() * 9)
          continue
        }

        const matches = b.value === targetRef.current
        const near = Math.hypot(pointerRef.current.x - bx, pointerRef.current.y - by) < radius + 4
        const rgb = matches ? pal.teal : pal.indigo
        const alpha = matches ? 0.32 : 0.12

        ctx.fillStyle = pal.isLight ? `rgba(${rgb},${alpha * 0.6})` : `rgba(${rgb},${alpha})`
        ctx.strokeStyle = `rgba(${rgb},${near ? 0.95 : matches ? 0.7 : 0.32})`
        ctx.lineWidth = near ? 1.8 : 1
        ctx.beginPath()
        ctx.arc(bx, by, radius + (near ? 1.5 : 0), 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        ctx.font = `700 ${radius}px 'JetBrains Mono', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = matches ? `rgba(${pal.teal},1)` : `rgba(${pal.text},0.6)`
        ctx.fillText(String(b.value), bx, by + 0.5)
      }
    }

    // Floating +10 popups
    popupsRef.current = popupsRef.current.filter((p) => t - p.t < 0.9)
    popupsRef.current.forEach((p) => {
      const age = (t - p.t) / 0.9
      ctx.font = "700 9px 'JetBrains Mono', monospace"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = `rgba(${pal.teal},${1 - age})`
      ctx.fillText('+10', p.x, p.y - age * 18)
    })

    // ── HUD ─────────────────────────────────────────────────
    ctx.font = "600 9px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    // Kept clear of the S-badge in the card's top-left corner.
    ctx.fillStyle = `rgba(${pal.text},0.65)`
    ctx.fillText('HIT', 60, 14)
    ctx.fillStyle = `rgba(${pal.teal},1)`
    ctx.fillText(String(targetRef.current), 86, 14)

    const remaining = 60 - Math.floor(t % 60)
    ctx.fillStyle = `rgba(${pal.text},0.65)`
    ctx.fillText('TIMER', W / 2 - 24, 14)
    ctx.fillStyle = remaining <= 10 ? `rgba(${pal.orange},1)` : `rgba(${pal.text},0.9)`
    ctx.fillText(String(remaining), W / 2 + 18, 14)

    ctx.textAlign = 'right'
    ctx.fillStyle = `rgba(${pal.text},0.65)`
    ctx.fillText('SCORE', W - 44, 14)
    ctx.fillStyle = `rgba(${pal.indigo},1)`
    ctx.fillText(String(scoreRef.current), W - 12, 14)
  })

  // ── Real pointer interaction: click / tap a bubble to pop it ────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const cell = 26
    const toGrid = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const W = rect.width
      const cols = colsRef.current
      const rows = rowsRef.current
      const gridW = cols * cell
      const offsetX = (W - gridW) / 2
      const topY = 34
      const gx = Math.floor((clientX - rect.left - offsetX) / cell)
      const gy = Math.floor((clientY - rect.top - topY) / cell)
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return null
      return gy * cols + gx
    }

    const pop = (clientX: number, clientY: number) => {
      const idx = toGrid(clientX, clientY)
      if (idx === null) return
      const b = bubblesRef.current[idx]
      if (!b || b.popT < 1) return
      b.popT = 0
      if (b.value === targetRef.current) {
        scoreRef.current += 10
        const rect = canvas.getBoundingClientRect()
        popupsRef.current.push({ x: clientX - rect.left, y: clientY - rect.top, t: performance.now() / 1000 })
      }
    }

    const onDown = (e: PointerEvent) => pop(e.clientX, e.clientY)
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
    }
    const onLeave = () => {
      pointerRef.current = { x: -999, y: -999, active: false }
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [canvasRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer"
      style={{ touchAction: 'pan-y' }}
      role="img"
      aria-label="Interactive Bubble Game preview. Tap bubbles matching the hit number to score."
    />
  )
}
