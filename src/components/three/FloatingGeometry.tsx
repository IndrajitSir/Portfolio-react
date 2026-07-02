import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useMouse } from '@/hooks/useMouse'

export default function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null)
  const mouse   = useMouse()

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()

    meshRef.current.rotation.x = t * 0.15 + mouse.normalizedY * 0.3
    meshRef.current.rotation.y = t * 0.20 + mouse.normalizedX * 0.3
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.15
  })

  return (
    <mesh ref={meshRef} scale={1}>
      <torusKnotGeometry args={[0.9, 0.28, 180, 32]} />
      <MeshDistortMaterial
        color="#5eead4"
        attach="material"
        distort={0.25}
        speed={2}
        roughness={0.1}
        metalness={0.6}
        wireframe={false}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}
