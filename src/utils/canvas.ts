// ─── Shared canvas scene helpers ────────────────────────────────────────────
// Every animated showcase canvas reads its palette from here so the whole
// portfolio shares one theme mapping (dark / light aware).

export interface ScenePalette {
  teal: string
  indigo: string
  orange: string
  green: string
  gold: string
  violet: string
  text: string
  isLight: boolean
}

const DARK: Omit<ScenePalette, 'isLight'> = {
  teal: '94,234,212',
  indigo: '129,140,248',
  orange: '251,146,60',
  green: '37,211,102',
  gold: '251,191,36',
  violet: '167,139,250',
  text: '232,234,240',
}

const LIGHT: Omit<ScenePalette, 'isLight'> = {
  teal: '8,145,178',
  indigo: '99,102,241',
  orange: '234,88,12',
  green: '16,145,87',
  gold: '202,138,4',
  violet: '124,58,237',
  text: '15,17,23',
}

export const canvasPalette = (isLight: boolean): ScenePalette =>
  isLight ? { ...LIGHT, isLight: true } : { ...DARK, isLight: false }

/** Rounded rectangle path (caller decides fill / stroke). */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

/** A soft radial glow disc, useful for grounding a hub or active node. */
export function glowDisc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgb: string,
  alpha: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  g.addColorStop(0, `rgba(${rgb},${alpha})`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

/** Faint full-bleed technical grid, drawn in the current strokeStyle. */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  step: number,
  strokeStyle: string,
) {
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = step; x < W; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = step; y < H; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()
}

/** Text in a small pill, e.g. a status chip. Returns the drawn width. */
export function chip(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: {
    rgb: string
    color: string
    font: string
    padX?: number
    height?: number
    align?: 'left' | 'center' | 'right'
    bgAlpha?: number
  },
): number {
  const padX = opts.padX ?? 6
  const height = opts.height ?? 15
  ctx.font = opts.font
  const w = ctx.measureText(text).width + padX * 2
  const bx = opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x
  ctx.fillStyle = `rgba(${opts.color},${opts.bgAlpha ?? 0.1})`
  ctx.strokeStyle = `rgba(${opts.color},0.45)`
  ctx.lineWidth = 1
  roundRect(ctx, bx, y - height / 2, w, height, height / 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = `rgba(${opts.color},0.92)`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, bx + w / 2, y + 0.5)
  return w
}

/** Point along a quadratic bezier — used for travelling packets. */
export function quadPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  u: number,
) {
  const inv = 1 - u
  return {
    x: inv * inv * p0.x + 2 * inv * u * p1.x + u * u * p2.x,
    y: inv * inv * p0.y + 2 * inv * u * p1.y + u * u * p2.y,
  }
}
