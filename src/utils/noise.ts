let cached: string | null = null

/** One 128px noise tile, generated once and shared as a CSS background. */
export function noiseDataUrl(): string {
  if (cached) return cached
  if (typeof document === 'undefined') return ''
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.floor(Math.random() * 120)
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = Math.floor(Math.random() * 140)
  }
  ctx.putImageData(img, 0, 0)
  cached = `url(${canvas.toDataURL('image/png')})`
  return cached
}