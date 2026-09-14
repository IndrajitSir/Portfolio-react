import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/models/avatar-model.glb')

function Model() {
  const { scene } = useGLTF('/models/avatar-model.glb')
  const model = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ pointer, clock }, delta) => {
    if (!model.current) return
    const t = clock.getElapsedTime()

    // Idle rotation disabled — model stays facing forward
    // (remove this line to re-enable smooth 360° idle rotation)
    // model.current.rotation.y += delta * 0.14

    // Floating / breathing motion
    const floatY = Math.sin(t * 0.8) * 0.05

    // Damped pointer tilt
    model.current.rotation.x = THREE.MathUtils.damp(
      model.current.rotation.x,
      pointer.y * 0.12,
      3,
      delta,
    )
    model.current.position.y = THREE.MathUtils.damp(
      model.current.position.y,
      floatY + pointer.y * 0.04,
      3,
      delta,
    )
    model.current.position.x = THREE.MathUtils.damp(
      model.current.position.x,
      pointer.x * 0.06,
      3,
      delta,
    )

    // Hover scale
    const targetScale = hovered ? 1.03 : 1
    model.current.scale.setScalar(
      THREE.MathUtils.damp(model.current.scale.x, targetScale, 4, delta),
    )
  })

  return (
    <group
      ref={model}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Auto-fits the model into the canvas view */}
      <Bounds fit clip observe margin={0.5}>
        <primitive object={scene} />
      </Bounds>
    </group>
  )
}

function GlowRing({ color, radius }: { color: string; radius: number }) {
  const ring = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ring.current) return
    const t = clock.getElapsedTime()
    ring.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04)
    const mat = ring.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.12 + Math.sin(t * 1.5 + 1) * 0.05
  })

  return (
    <mesh ref={ring} position={[0, -0.1, -0.4]} rotation={[Math.PI / 2.1, 0, 0]}>
      <ringGeometry args={[radius - 0.015, radius, 72]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function GlbAvatarScene() {
  return (
    <div
      className="w-full h-full"
      style={{ cursor: 'grab' }}
      aria-label="Interactive 3D model of Indrajit Mandal"
      role="img"
    >
      <Canvas
        camera={{ position: [0, 0.25, 3.45], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.1} color="#e2e0f0" />
        <pointLight position={[3.5, 4, 4]} intensity={2.4} color="#fff4e7" />
        <pointLight position={[-3.5, 2, 2.5]} intensity={1.6} color="#6366f1" />
        <pointLight position={[0, 2.5, -3]} intensity={1.3} color="#ec4899" />
        <pointLight position={[0, -2, 2]} intensity={0.7} color="#5eead4" />

        <GlowRing color="#6366f1" radius={1.45} />
        <GlowRing color="#5eead4" radius={1.75} />

        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
