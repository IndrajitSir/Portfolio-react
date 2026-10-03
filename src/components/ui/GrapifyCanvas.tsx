import { useEffect, useRef } from 'react'
import { glowDisc, drawGrid } from '@/utils/canvas'
import { useCanvasScene, type SceneFrame } from '@/hooks'

// GrapiFy showcase: genuinely interactive, exactly like the app — click empty
// space to add a node, click a node to delete it. Nodes drift gently so the
// canvas stays alive when the visitor does not touch it.
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

interface Node {
  x: number
  y: number
  label: string
  born: number
  bob: number
}

const NODE_R = 10

export default function GrapifyCanvas() {
  const nodesRef = useRef<Node[]>([])
  const burstsRef = useRef<{ x: number; y: number; t: number }[]>([])
  const hoverRef = useRef<number | null>(null)
  const seededRef = useRef(false)

  const canvasRef = useCanvasScene(({ ctx, W, H, t, pal }: SceneFrame) => {
    drawGrid(ctx, W, H, 24, `rgba(${pal.indigo},${pal.isLight ? 0.06 : 0.07})`)

    // Seed a starter graph once the canvas has a real size.
    if (!seededRef.current && W > 60 && H > 40) {
      seededRef.current = true
      const seed: [number, number][] = [
        [0.22, 0.34],
        [0.44, 0.66],
        [0.64, 0.32],
        [0.82, 0.62],
        [0.5, 0.22],
      ]
      nodesRef.current = seed.map(([sx, sy], i) => ({
        x: sx * W,
        y: sy * H,
        label: LETTERS[i],
        born: -1,
        bob: Math.random() * Math.PI * 2,
      }))
    }

    // ── Nodes ───────────────────────────────────────────────
    nodesRef.current.forEach((n, i) => {
      const y = n.y + Math.sin(t * 1.3 + n.bob) * 2
      const age = n.born < 0 ? 10 : t - n.born
      const grow = Math.min(1, age / 0.35)
      const r = NODE_R * grow
      const hovered = hoverRef.current === i

      glowDisc(ctx, n.x, y, r * 3.2, pal.indigo, hovered ? 0.35 : 0.2)
      ctx.fillStyle = pal.isLight ? 'rgba(255,255,255,0.92)' : 'rgba(12,14,22,0.92)'
      ctx.strokeStyle = hovered ? `rgba(${pal.orange},1)` : `rgba(${pal.indigo},0.75)`
      ctx.lineWidth = hovered ? 1.8 : 1.3
      ctx.beginPath()
      ctx.arc(n.x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.font = `700 ${Math.max(7, r)}px 'JetBrains Mono', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = hovered ? `rgba(${pal.orange},1)` : `rgba(${pal.text},0.92)`
      ctx.fillText(n.label, n.x, y + 0.5)

      // spawn ripple
      if (age >= 0 && age < 0.6) {
        ctx.strokeStyle = `rgba(${pal.teal},${(1 - age / 0.6) * 0.7})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(n.x, y, r + (age / 0.6) * 16, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // ── Delete bursts ───────────────────────────────────────
    burstsRef.current = burstsRef.current.filter((b) => t - b.t < 0.5)
    burstsRef.current.forEach((b) => {
      const age = (t - b.t) / 0.5
      ctx.strokeStyle = `rgba(${pal.orange},${(1 - age) * 0.85})`
      ctx.lineWidth = 1.3
      ctx.beginPath()
      ctx.arc(b.x, b.y, NODE_R + age * 20, 0, Math.PI * 2)
      ctx.stroke()
    })

    // ── HUD ─────────────────────────────────────────────────
    ctx.font = "600 8px 'JetBrains Mono', monospace"
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = `rgba(${pal.teal},0.9)`
    ctx.fillText(`${nodesRef.current.length} nodes`, W - 12, 14)
    ctx.fillStyle = `rgba(${pal.text},0.45)`
    ctx.fillText('+ add · − remove', W - 12, 26)
  })

  // ── Pointer interaction: add on empty space, delete on a node ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const hit = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      const px = clientX - rect.left
      const py = clientY - rect.top
      for (let i = nodesRef.current.length - 1; i >= 0; i--) {
        const n = nodesRef.current[i]
        if (Math.hypot(n.x - px, n.y - py) <= NODE_R + 4) return { i, px, py }
      }
      return { i: -1, px, py }
    }

    const onClick = (e: PointerEvent) => {
      const { i, px, py } = hit(e.clientX, e.clientY)
      if (i >= 0) {
        burstsRef.current.push({ x: nodesRef.current[i].x, y: nodesRef.current[i].y, t: performance.now() / 1000 })
        nodesRef.current.splice(i, 1)
      } else if (nodesRef.current.length < 12) {
        nodesRef.current.push({
          x: px,
          y: py,
          label: LETTERS[nodesRef.current.length % LETTERS.length],
          born: performance.now() / 1000,
          bob: Math.random() * Math.PI * 2,
        })
      }
    }

    const onMove = (e: PointerEvent) => {
      const { i } = hit(e.clientX, e.clientY)
      hoverRef.current = i >= 0 ? i : null
      canvas.style.cursor = i >= 0 ? 'pointer' : 'crosshair'
    }

    canvas.addEventListener('pointerdown', onClick)
    canvas.addEventListener('pointermove', onMove)
    return () => {
      canvas.removeEventListener('pointerdown', onClick)
      canvas.removeEventListener('pointermove', onMove)
    }
  }, [canvasRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'pan-y' }}
      role="img"
      aria-label="Interactive GrapiFy preview. Click empty space to add a node, click a node to remove it."
    />
  )
}
