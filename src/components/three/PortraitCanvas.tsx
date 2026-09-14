import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const damp = THREE.MathUtils.damp

function PortraitHalo() {
  const points = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const count = 90
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const teal = new THREE.Color('#5eead4')
    const indigo = new THREE.Color('#818cf8')

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 1.78 + (Math.random() - 0.5) * 0.4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = Math.sin(angle) * radius
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      const c = teal.clone().lerp(indigo, Math.random())
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return { positions: pos, colors: col }
  }, [])

  useFrame(({ clock }, delta) => {
    if (!points.current) return
    points.current.rotation.z += delta * 0.12
    const mat = points.current.material as THREE.PointsMaterial
    mat.opacity = 0.32 + Math.sin(clock.getElapsedTime() * 1.6) * 0.1
  })

  return (
    <points ref={points} position={[0, 0, -0.6]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.024}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function GlowRing({ color, radius, speed }: { color: string; radius: number; speed: number }) {
  const ring = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = clock.getElapsedTime()
    ring.current.scale.setScalar(1 + Math.sin(t * speed) * 0.04)
    const mat = ring.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.08 + Math.sin(t * (speed * 1.25) + 1) * 0.04
  })

  return (
    <mesh ref={ring} position={[0, 0, -0.5]}>
      <ringGeometry args={[radius - 0.015, radius, 72]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PortraitCard() {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useTexture('/indrajit-portrait.png')

  useFrame(({ pointer, clock }, delta) => {
    if (!group.current) return
    const t = clock.getElapsedTime()

    // Idle "breathing" motion
    const idleY = Math.sin(t * 0.9) * 0.1
    const idleRotX = Math.cos(t * 0.55) * 0.045
    const idleRotY = Math.sin(t * 0.45) * 0.085

    // Pointer tilt + idle motion, smoothly damped
    group.current.rotation.x = damp(group.current.rotation.x, idleRotX + pointer.y * 0.16, 4, delta)
    group.current.rotation.y = damp(group.current.rotation.y, idleRotY + pointer.x * 0.24, 4, delta)
    group.current.position.y = damp(group.current.position.y, idleY + pointer.y * 0.08, 3, delta)

    // Gentle scale-up on hover
    const targetScale = hovered ? 1.055 : 1
    group.current.scale.setScalar(damp(group.current.scale.x, targetScale, 5, delta))
  })

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Depth layers behind the portrait */}
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
    <div
      className="w-full h-full"
      style={{ cursor: 'grab' }}
      aria-label="Interactive portrait of Indrajit Mandal"
      role="img"
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.4} />
        <pointLight position={[3, 3, 4]} intensity={2} color="#5eead4" />
        <pointLight position={[-3, -2, 2]} intensity={1.2} color="#818cf8" />
        <pointLight position={[0, 4, -3]} intensity={1} color="#5eead4" />

        <GlowRing color="#5eead4" radius={1.28} speed={1.6} />
        <GlowRing color="#818cf8" radius={1.52} speed={2.1} />
        <PortraitHalo />
        <PortraitCard />
      </Canvas>
    </div>
  )
}
