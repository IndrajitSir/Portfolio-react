import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMouse } from '@/hooks/useMouse'

interface ParticleFieldProps {
  count?: number
  radius?: number
}

export default function ParticleField({ count = 350, radius = 2.2 }: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null)
  const mouse = useMouse()

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const tealColor = new THREE.Color('#5eead4')
    const indigoColor = new THREE.Color('#818cf8')

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const theta = Math.acos(1 - (2 * (i + 0.5)) / count)
      const phi = Math.PI * (1 + Math.sqrt(5)) * i

      pos[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = radius * Math.cos(theta)

      // Gradient colour based on vertical position
      const t = (pos[i * 3 + 1] / radius + 1) / 2
      const c = tealColor.clone().lerp(indigoColor, t)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return { positions: pos, colors: col }
  }, [count, radius])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()

    // Base rotation
    const baseRotY = t * 0.15

    // Target rotation based on mouse
    const targetRotX = -mouse.normalizedY * 0.8
    const targetRotY = mouse.normalizedX * 1.2

    // Lerp towards target
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.05
    meshRef.current.rotation.y += (targetRotY + baseRotY - meshRef.current.rotation.y) * 0.05
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
