import * as THREE from 'three'

/**
 * labelTexture
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a single line of engraved plate text into a `CanvasTexture`.
 *
 * Why not `<Text>` from drei: troika loads its default font over the network the
 * first time it draws, which would either delay the plate labels or fail
 * silently offline. A canvas texture is generated synchronously, costs one
 * upload per label (five in the whole site), and can be disposed with the rest
 * of the scene.
 *
 * The texture is transparent apart from the glyphs, so it composites over the
 * plate like machined lettering rather than a pasted card.
 */
export function createLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const width = 1024
  const height = 128
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.clearRect(0, 0, width, height)
    // The canvas is mapped onto a 0.3-unit-tall plane, so the glyphs need to
    // fill most of its height to stay legible at the stage's scale.
    ctx.font = '600 92px ui-monospace, SFMono-Regular, Menlo, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // A faint dark pass underneath keeps the lettering readable on the brighter
    // metal of a selected plate without dimming the accent colour.
    ctx.fillStyle = 'rgba(8, 9, 13, 0.6)'
    ctx.fillText(text.toUpperCase(), width / 2 + 3, height / 2 + 3)
    ctx.fillStyle = color
    ctx.fillText(text.toUpperCase(), width / 2, height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}
