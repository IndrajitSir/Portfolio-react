import { roundRect, glowDisc, drawGrid, chip } from '@/utils/canvas'
import { useCanvasScene, type SceneFrame } from '@/hooks'

// OmniScript showcase: a registry-driven Domain → Template → Tool walk-through.
// A selector travels the three columns, the chosen domain resolves into its
// templates, a template resolves into a tool workspace, and the bottom HUD shows
// the global search palette driving all of it from one registry.
const DOMAINS = [
  { name: 'Network', icon: '◈', templates: ['Diagnostics', 'Scanning'], tools: 11 },
  { name: 'System', icon: '▤', templates: ['Monitoring', 'Metrics'], tools: 10 },
  { name: 'Backup', icon: '⟳', templates: ['Snapshots', 'Restore'], tools: 8 },
  { name: 'Security', icon: '⛨', templates: ['Hardening', 'Audit'], tools: 8 },
]

const CYCLE = 9 // seconds for a full domain → template → tool walk

function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  rgb: string,
  alpha: number,
) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  ctx.strokeStyle = `rgba(${rgb},0.42)`
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 8)
  ctx.fill()
  ctx.stroke()
  ctx.font = "600 7px 'JetBrains Mono', monospace"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = `rgba(${rgb},0.75)`
  ctx.fillText(title, x + 8, y + 7)
  ctx.globalAlpha = 1
}

function row(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  rgb: string,
  active: boolean,
  alpha: number,
) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = active ? `rgba(${rgb},0.22)` : 'rgba(255,255,255,0.04)'
  ctx.strokeStyle = `rgba(${rgb},${active ? 0.85 : 0.2})`
  ctx.lineWidth = active ? 1.3 : 1
  roundRect(ctx, x, y, w, h, 4)
  ctx.fill()
  ctx.stroke()
  ctx.font = "500 8px 'JetBrains Mono', monospace"
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = `rgba(${rgb},${active ? 0.98 : 0.55})`
  ctx.fillText(label, x + 8, y + h / 2)
  ctx.globalAlpha = 1
}

export default function OmniScriptCanvas() {
  const canvasRef = useCanvasScene(({ ctx, W, H, t, pal }: SceneFrame) => {
    drawGrid(ctx, W, H, 26, `rgba(${pal.teal},${pal.isLight ? 0.05 : 0.055})`)

    const domIdx = Math.floor(t / CYCLE) % DOMAINS.length
    const domain = DOMAINS[domIdx]
    const cyclePos = t % CYCLE

    // Reveal progress for each column (domain → template → tool).
    const reveal = (start: number) => Math.max(0, Math.min(1, (cyclePos - start) / 0.9))
    const rDomain = reveal(0)
    const rTemplate = reveal(2.6)
    const rTool = reveal(5.2)
    const stage = cyclePos < 2.6 ? 0 : cyclePos < 5.2 ? 1 : 2

    const padX = Math.max(10, W * 0.05)
    const colW = (W - padX * 2 - 18) / 3
    const topY = H * 0.32
    const colH = H * 0.46

    // ── Search palette spanning the top ─────────────────────
    ctx.globalAlpha = 0.9
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.strokeStyle = `rgba(${pal.indigo},0.4)`
    ctx.lineWidth = 1
    const searchY = H * 0.2
    roundRect(ctx, padX, searchY, W - padX * 2, 18, 9)
    ctx.fill()
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.font = "500 8px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const query = `search: ${domain.name.toLowerCase()}`
    const typed = query.slice(0, Math.max(7, Math.floor(query.length * Math.min(1, cyclePos / 1.4))))
    ctx.fillStyle = `rgba(${pal.indigo},0.9)`
    ctx.fillText(typed, padX + 12, searchY + 9)
    // blinking caret
    if (Math.sin(t * 6) > 0) {
      const tw = ctx.measureText(typed).width
      ctx.fillStyle = `rgba(${pal.teal},0.9)`
      ctx.fillRect(padX + 14 + tw, searchY + 4, 1.4, 10)
    }

    // ── Column 1: DOMAIN ────────────────────────────────────
    panel(ctx, padX, topY, colW, colH, 'DOMAIN', pal.teal, rDomain)
    const rowH = Math.min(16, (colH - 26) / DOMAINS.length - 3)
    DOMAINS.forEach((dm, i) => {
      const ry = topY + 20 + i * (rowH + 4)
      row(
        ctx,
        padX + 7,
        ry,
        colW - 14,
        rowH,
        `${dm.icon}  ${dm.name}`,
        pal.teal,
        i === domIdx,
        rDomain * (i === domIdx ? 1 : 0.72),
      )
    })

    // ── Column 2: TEMPLATE ──────────────────────────────────
    const cx2 = padX + colW + 9
    panel(ctx, cx2, topY, colW, colH, 'TEMPLATE', pal.indigo, rTemplate)
    domain.templates.forEach((tpl, i) => {
      row(ctx, cx2 + 7, topY + 20 + i * (rowH + 4), colW - 14, rowH, `› ${tpl}`, pal.indigo, i === 0, rTemplate)
    })
    ctx.globalAlpha = rTemplate
    ctx.font = "400 7px 'JetBrains Mono', monospace"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = `rgba(${pal.text},0.4)`
    ctx.fillText(`${domain.tools} tools in this domain`, cx2 + 8, topY + colH - 16)
    ctx.globalAlpha = 1

    // ── Column 3: TOOL workspace ────────────────────────────
    const cx3 = padX + (colW + 9) * 2
    panel(ctx, cx3, topY, colW, colH, 'TOOL · WORKSPACE', pal.violet, rTool)
    ctx.globalAlpha = rTool
    // fake code / config lines resolving inside the workspace
    for (let i = 0; i < 5; i++) {
      const ly = topY + 24 + i * 10
      const w = (colW - 22) * (0.4 + ((i * 7) % 5) / 10)
      ctx.fillStyle = i % 2 === 0 ? `rgba(${pal.violet},0.5)` : `rgba(${pal.teal},0.35)`
      ctx.fillRect(cx3 + 8, ly, w, 3)
    }
    // action strip: copy + download
    ctx.fillStyle = `rgba(${pal.violet},0.16)`
    ctx.strokeStyle = `rgba(${pal.violet},0.6)`
    roundRect(ctx, cx3 + 8, topY + colH - 24, colW - 16, 15, 4)
    ctx.fill()
    ctx.stroke()
    ctx.font = "600 7px 'JetBrains Mono', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = `rgba(${pal.violet},0.95)`
    ctx.fillText('Download Executable (.sh)', cx3 + colW / 2, topY + colH - 16)
    ctx.globalAlpha = 1

    // ── Registry beams + travelling packets ─────────────────
    const y = topY + colH / 2
    const beams: [number, number][] = [
      [padX + colW, cx2],
      [cx2 + colW, cx3],
    ]
    beams.forEach(([x1, x2], bi) => {
      const lit = stage > bi
      ctx.strokeStyle = lit ? `rgba(${pal.teal},0.6)` : `rgba(${pal.text},0.12)`
      ctx.lineWidth = lit ? 1.4 : 1
      ctx.setLineDash(lit ? [4, 5] : [])
      ctx.lineDashOffset = lit ? -t * 22 : 0
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()
      ctx.setLineDash([])
      if (lit) {
        const u = (t * 1.4 + bi * 0.5) % 1
        ctx.fillStyle = `rgba(${pal.teal},0.95)`
        ctx.beginPath()
        ctx.arc(x1 + (x2 - x1) * u, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // ── Selector cursor tracking the active column ─────────
    const cursorTarget = [padX + 16, cx2 + 16, cx3 + 16][stage]
    const cursorY = [topY + 22 + rowH / 2, topY + 28, topY + colH - 16][stage]
    glowDisc(ctx, cursorTarget, cursorY, 16, pal.teal, 0.35)
    ctx.fillStyle = `rgba(${pal.teal},1)`
    ctx.beginPath()
    ctx.moveTo(cursorTarget - 4, cursorY - 6)
    ctx.lineTo(cursorTarget + 5, cursorY + 1)
    ctx.lineTo(cursorTarget, cursorY + 2)
    ctx.lineTo(cursorTarget + 1, cursorY + 7)
    ctx.closePath()
    ctx.fill()

    // ── HUD ─────────────────────────────────────────────────
    const hudY = H - 12
    chip(ctx, '⌘K  registry search', W * 0.05, hudY, {
      rgb: pal.indigo,
      color: pal.indigo,
      font: "500 7px 'JetBrains Mono', monospace",
      align: 'left',
    })
    chip(ctx, `${DOMAINS.length} domains · ${DOMAINS.reduce((n, d) => n + d.tools, 0)} tools`, W - W * 0.05, hudY, {
      rgb: pal.teal,
      color: pal.teal,
      font: "500 7px 'JetBrains Mono', monospace",
      align: 'right',
    })
  })

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}
