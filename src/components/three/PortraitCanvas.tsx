import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function PortraitCard() {
  const group = useRef<THREE.Group>(null)
  const texture = useTexture('/indrajit-portrait.png')

  useFrame(({ pointer }, delta) => {
    if (!group.current) return

    const targetX = pointer.y * 0.12
    const targetY = pointer.x * 0.18
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta)
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      pointer.y * 0.08,
      3,
      delta,
    )
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.16]} scale={[2.72, 2.72, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, 0, -0.08]} scale={[2.58, 2.58, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#818cf8" transparent opacity={0.2} />
      </mesh>
      <mesh scale={[2.5, 2.5, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function PortraitCanvas() {
  return (
    <div className="w-full h-full" aria-label="Interactive portrait of Indrajit Mandal" role="img">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.4} />
        <pointLight position={[3, 3, 4]} intensity={2} color="#5eead4" />
        <pointLight position={[-3, -2, 2]} intensity={1.2} color="#818cf8" />
        <PortraitCard />
      </Canvas>
    </div>
  )
}