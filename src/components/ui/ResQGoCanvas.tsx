import { roundRect, glowDisc, drawGrid, chip } from '@/utils/canvas'
import { useCanvasScene, type SceneFrame } from '@/hooks'

// ResQ-Go showcase: the real booking lifecycle. A patient request is raised,
// dispatch matches it against the eligible-ambulance queue, the crew travels the
// route, and the shared status timeline advances (requested → assigned → en
// route → arrived → on board → in transit → completed).
const CYCLE = 8
const CARE = ['BLS', 'ALS', 'ICU']

const STEPS: { at: number; label: string }[] = [
  { at: 0.0, label: 'REQUESTED' },
  { at: 0.14, label: 'ASSIGNED' },
  { at: 0.24, label: 'EN ROUTE' },
  { at: 0.5, label: 'ARRIVED' },
  { at: 0.6, label: 'ON BOARD' },
  { at: 0.72, label: 'IN TRANSIT' },
  { at: 0.96, label: 'COMPLETED' },
]

export default function ResQGoCanvas() {
  const canvasRef = useCanvasScene(({ ctx, W, H, t, pal }: SceneFrame) => {
    drawGrid(ctx, W, H, 28, `rgba(${pal.orange},${pal.isLight ? 0.05 : 0.05})`)

    const u = (t % CYCLE) / CYCLE
    const assigned = u >= 0.14

    const padX = Math.max(10, W * 0.05)
    const routeY = H * 0.28
    const x0 = padX + 6
    const x1 = W - padX - 6

    // ── Route line ──────────────────────────────────────────
    ctx.strokeStyle = `rgba(${pal.orange},0.35)`
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(x0, routeY)
    ctx.lineTo(x1, routeY)
    ctx.stroke()
    // travelled portion
    ctx.strokeStyle = `rgba(${pal.green},0.85)`
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(x0, routeY)
    ctx.lineTo(x0 + (x1 - x0) * u, routeY)
    ctx.stroke()

    // Patient marker (pickup)
    glowDisc(ctx, x0, routeY, 16, pal.indigo, 0.4)
    ctx.fillStyle = `rgba(${pal.indigo},1)`
    ctx.beginPath()
    ctx.arc(x0, routeY, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.font = "600 7px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = `rgba(${pal.indigo},0.9)`
    ctx.fillText('PICKUP', x0 - 2, routeY - 10)

    // Hospital marker (destination)
    const pulse = 0.5 + Math.sin(t * 3) * 0.5
    glowDisc(ctx, x1, routeY, 16 + pulse * 6, pal.teal, 0.35)
    ctx.fillStyle = `rgba(${pal.teal},1)`
    ctx.fillRect(x1 - 5, routeY - 1.6, 10, 3.2)
    ctx.fillRect(x1 - 1.6, routeY - 5, 3.2, 10)
    ctx.textAlign = 'right'
    ctx.fillStyle = `rgba(${pal.teal},0.9)`
    ctx.fillText('HOSPITAL', x1 + 2, routeY - 12)

    // Ambulance travelling the route
    const ax = x0 + (x1 - x0) * u
    glowDisc(ctx, ax, routeY, 14, pal.orange, 0.45)
    ctx.fillStyle = `rgba(${pal.orange},1)`
    roundRect(ctx, ax - 7, routeY - 4, 14, 8, 2.5)
    ctx.fill()
    ctx.fillStyle = 'rgba(8,9,13,0.85)'
    ctx.fillRect(ax - 2.4, routeY - 2.4, 4.8, 2.2)

    // ── Three role panels ───────────────────────────────────
    const topY = H * 0.44
    const colW = (W - padX * 2 - 16) / 3
    const colH = H * 0.42

    // Panel 1 — patient request
    panel(ctx, padX, topY, colW, colH, 'PATIENT · REQUEST', pal.indigo)
    ctx.font = "500 7px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = `rgba(${pal.text},0.55)`
    ctx.fillText('sector 4 → city care', padX + 8, topY + 22)
    ctx.fillText('urgency: high', padX + 8, topY + 33)
    CARE.forEach((c, i) => {
      chip(ctx, c, padX + 14 + i * 30, topY + colH - 16, {
        rgb: pal.indigo,
        color: pal.indigo,
        font: `600 7px 'JetBrains Mono', monospace`,
        align: 'left',
        bgAlpha: i === 1 ? 0.3 : 0.08,
        height: 13,
        padX: 5,
      })
    })

    // Panel 2 — dispatch queue
    const cx2 = padX + colW + 8
    panel(ctx, cx2, topY, colW, colH, 'DISPATCH · QUEUE', pal.orange)
    const rows = ['high · ICU', 'normal · BLS', 'high · ALS']
    rows.forEach((r, i) => {
      const matched = assigned && i === 0
      const ry = topY + 20 + i * 15
      ctx.fillStyle = matched ? `rgba(${pal.orange},0.25)` : 'rgba(255,255,255,0.04)'
      ctx.strokeStyle = matched ? `rgba(${pal.orange},0.85)` : `rgba(${pal.text},0.15)`
      ctx.lineWidth = 1
      roundRect(ctx, cx2 + 7, ry, colW - 14, 12, 3)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = matched ? `rgba(${pal.orange},0.95)` : `rgba(${pal.text},0.45)`
      ctx.fillText(matched ? `✓ matched · ${r}` : r, cx2 + 12, ry + 6)
    })

    // Panel 3 — driver status timeline
    const cx3 = padX + (colW + 8) * 2
    panel(ctx, cx3, topY, colW, colH, 'DRIVER · STATUS', pal.green)
    const stepGap = (colH - 24) / STEPS.length
    STEPS.forEach((s, i) => {
      const sy = topY + 20 + i * stepGap
      const done = u >= s.at
      const current = done && (i === STEPS.length - 1 || u < STEPS[i + 1].at)
      ctx.fillStyle = done ? `rgba(${pal.green},${current ? 1 : 0.7})` : `rgba(${pal.text},0.2)`
      ctx.beginPath()
      ctx.arc(cx3 + 12, sy, current ? 3.2 : 2.2, 0, Math.PI * 2)
      ctx.fill()
      if (i < STEPS.length - 1) {
        ctx.strokeStyle = `rgba(${pal.green},${u >= STEPS[i + 1].at ? 0.6 : 0.16})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx3 + 12, sy + 3)
        ctx.lineTo(cx3 + 12, sy + stepGap - 3)
        ctx.stroke()
      }
      ctx.font = `${current ? 700 : 500} 7px 'JetBrains Mono', monospace`
      ctx.fillStyle = done ? `rgba(${pal.green},${current ? 1 : 0.75})` : `rgba(${pal.text},0.32)`
      ctx.fillText(s.label, cx3 + 20, sy)
    })

    // ── HUD ─────────────────────────────────────────────────
    chip(ctx, 'shared booking state machine', W * 0.05, H - 12, {
      rgb: pal.teal,
      color: pal.teal,
      font: "500 7px 'JetBrains Mono', monospace",
      align: 'left',
    })
    chip(ctx, `ETA 04:2${Math.min(9, Math.floor(u * 10))} · ${Math.round(u * 100)}%`, W - W * 0.05, H - 12, {
      rgb: pal.orange,
      color: pal.orange,
      font: "500 7px 'JetBrains Mono', monospace",
      align: 'right',
    })
  })

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, rgb: string) {
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.strokeStyle = `rgba(${rgb},0.4)`
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 8)
  ctx.fill()
  ctx.stroke()
  ctx.font = "600 7px 'JetBrains Mono', monospace"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = `rgba(${rgb},0.8)`
  ctx.fillText(title, x + 8, y + 7)
}
