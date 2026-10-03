import { roundRect, glowDisc, drawGrid, chip } from '@/utils/canvas'
import { useCanvasScene, type SceneFrame } from '@/hooks'

// TryOnix showcase: the real upload → generate → result journey, drawn as an
// illustrative pipeline. It deliberately does not present a fabricated output
// image as a genuine AI result — the result frame stays abstract.
const CYCLE = 9
const STAGES = ['UPLOAD', 'PREPROCESS', 'GENERATE', 'RESULT']

function slot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  rgb: string,
  filled: number,
) {
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.strokeStyle = `rgba(${rgb},0.4)`
  ctx.lineWidth = 1
  ctx.setLineDash(filled >= 1 ? [] : [3, 4])
  roundRect(ctx, x, y, w, h, 8)
  ctx.fill()
  ctx.stroke()
  ctx.setLineDash([])
  ctx.font = "600 7px 'JetBrains Mono', monospace"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = `rgba(${rgb},0.8)`
  ctx.fillText(title, x + 7, y + 6)

  const cx = x + w / 2
  const cy = y + h * 0.56
  if (filled <= 0) {
    // upload affordance
    const t = Math.sin(performance.now() / 400) * 0.5 + 0.5
    ctx.strokeStyle = `rgba(${rgb},${0.3 + t * 0.5})`
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(cx, cy + 6)
    ctx.lineTo(cx, cy - 5)
    ctx.moveTo(cx - 4, cy - 1)
    ctx.lineTo(cx, cy - 5)
    ctx.lineTo(cx + 4, cy - 1)
    ctx.stroke()
  } else {
    // abstract silhouette (no real photo is implied)
    ctx.globalAlpha = filled
    ctx.fillStyle = `rgba(${rgb},0.35)`
    ctx.beginPath()
    ctx.arc(cx, cy - 8, 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx - 9, cy + 10)
    ctx.quadraticCurveTo(cx, cy - 6, cx + 9, cy + 10)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

export default function TryOnixCanvas() {
  const canvasRef = useCanvasScene(({ ctx, W, H, t, pal }: SceneFrame) => {
    drawGrid(ctx, W, H, 26, `rgba(${pal.violet},${pal.isLight ? 0.05 : 0.06})`)

    const cycle = t % CYCLE
    const stageIdx = Math.min(STAGES.length - 1, Math.floor(cycle / (CYCLE / STAGES.length)))
    const stageLocal = (cycle / (CYCLE / STAGES.length)) % 1

    const padX = Math.max(10, W * 0.05)
    const topY = H * 0.22
    const cardH = H * 0.46
    const colW = (W - padX * 2 - 16) / 3

    const personFill = Math.min(1, cycle / 1.2)
    const garmentFill = Math.min(1, Math.max(0, (cycle - 1.4) / 1.2))

    slot(ctx, padX, topY, colW, cardH, 'PERSON', pal.violet, personFill)
    const cx2 = padX + colW + 8
    slot(ctx, cx2, topY, colW, cardH, 'GARMENT', pal.indigo, garmentFill)

    // ── Result frame ────────────────────────────────────────
    const cx3 = padX + (colW + 8) * 2
    const rx = cx3
    const ry = topY
    const rw = colW
    const rh = cardH
    const generating = cycle > 3.2
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.strokeStyle = `rgba(${pal.teal},0.45)`
    ctx.lineWidth = 1
    roundRect(ctx, rx, ry, rw, rh, 8)
    ctx.fill()
    ctx.stroke()
    ctx.font = "600 7px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = `rgba(${pal.teal},0.85)`
    ctx.fillText('RESULT', rx + 7, ry + 6)

    const icx = rx + rw / 2
    const icy = ry + rh * 0.56
    if (!generating) {
      ctx.strokeStyle = `rgba(${pal.text},0.2)`
      ctx.lineWidth = 1
      roundRect(ctx, icx - rw * 0.3, icy - rh * 0.22, rw * 0.6, rh * 0.44, 6)
      ctx.stroke()
      ctx.font = "500 7px 'JetBrains Mono', monospace"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = `rgba(${pal.text},0.4)`
      ctx.fillText('awaiting input', icx, icy)
    } else {
      // abstract result with a scan sweep (belongs to no real photo)
      const prog = Math.min(1, (cycle - 3.2) / 2.4)
      ctx.globalAlpha = 0.35 + prog * 0.4
      ctx.fillStyle = `rgba(${pal.teal},0.5)`
      ctx.beginPath()
      ctx.arc(icx, icy - 9, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(icx - 11, icy + 12)
      ctx.quadraticCurveTo(icx, icy - 8, icx + 11, icy + 12)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
      // scan line sweep
      const sx = rx + 4 + ((cycle * 0.55) % 1) * (rw - 8)
      ctx.strokeStyle = `rgba(${pal.teal},0.85)`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(sx, ry + 12)
      ctx.lineTo(sx, ry + rh - 6)
      ctx.stroke()
    }

    // honest label inside the result frame
    chip(ctx, 'illustrative pipeline', rx + rw / 2, ry + rh - 12, {
      rgb: pal.text,
      color: pal.text,
      font: "500 6px 'JetBrains Mono', monospace",
      align: 'center',
      height: 12,
      bgAlpha: 0.08,
    })

    // ── Inputs flowing into the generator ───────────────────
    const flowY = topY + cardH / 2
    ;[
      { from: padX + colW, to: rx, rgb: pal.violet, on: personFill >= 1 },
      { from: cx2 + colW, to: rx, rgb: pal.indigo, on: garmentFill >= 1 },
    ].forEach((f, i) => {
      ctx.strokeStyle = f.on ? `rgba(${f.rgb},0.6)` : `rgba(${pal.text},0.12)`
      ctx.lineWidth = 1.3
      ctx.beginPath()
      ctx.moveTo(f.from, flowY)
      ctx.lineTo(f.to, flowY)
      ctx.stroke()
      if (f.on) {
        const u = (t * 1.2 + i * 0.5) % 1
        ctx.fillStyle = `rgba(${f.rgb},0.95)`
        ctx.beginPath()
        ctx.arc(f.from + (f.to - f.from) * u, flowY, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // ── Pipeline stage strip ────────────────────────────────
    const stripY = H - 26
    const stripW = W - padX * 2
    const segW = stripW / STAGES.length
    STAGES.forEach((s, i) => {
      const done = i < stageIdx || (i === stageIdx && stageLocal > 0.7)
      const active = i === stageIdx
      const sx = padX + i * segW
      ctx.strokeStyle = done ? `rgba(${pal.teal},0.8)` : active ? `rgba(${pal.violet},0.7)` : `rgba(${pal.text},0.15)`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sx + 4, stripY)
      ctx.lineTo(sx + segW - 4, stripY)
      ctx.stroke()
      ctx.font = `${active ? 700 : 500} 7px 'JetBrains Mono', monospace`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = done ? `rgba(${pal.teal},0.9)` : active ? `rgba(${pal.violet},0.95)` : `rgba(${pal.text},0.35)`
      ctx.fillText(`${i + 1} ${s}`, sx + 4, stripY - 4)
    })

    // progress head
    const headX = padX + (stageIdx + stageLocal) * segW
    glowDisc(ctx, headX, stripY, 10, pal.teal, 0.4)
    ctx.fillStyle = `rgba(${pal.teal},1)`
    ctx.beginPath()
    ctx.arc(headX, stripY, 2, 0, Math.PI * 2)
    ctx.fill()
  })

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}
