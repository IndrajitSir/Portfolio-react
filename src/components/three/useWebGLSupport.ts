import { useEffect, useState } from 'react'

/**
 * One-time WebGL capability probe.
 *
 * The 3D chapters mount a canvas only when this returns true, so devices with
 * WebGL disabled get the DOM blueprint instead of a crashed or blank stage. The
 * probe's own context is released immediately — it exists to answer a question,
 * not to hold a GPU resource for the life of the page.
 */
export function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    let ok = false
    try {
      const probe = document.createElement('canvas')
      const gl =
        probe.getContext('webgl2') ??
        probe.getContext('webgl') ??
        probe.getContext('experimental-webgl')
      if (gl) {
        ok = true
        const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
        lose?.loseContext()
      }
    } catch {
      ok = false
    }
    setSupported(ok)
  }, [])

  return supported
}
