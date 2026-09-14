import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Avatar() {
  const root = useRef<THREE.Group>(null)

  useFrame(({ pointer, clock }, delta) => {
    if (!root.current) return
    const t = clock.getElapsedTime()
    root.current.rotation.y += delta * 0.12
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, pointer.y * 0.08, 3, delta)
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, pointer.x * 0.08, 3, delta)
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, Math.sin(t * 0.8) * 0.035, 3, delta)
  })

  return (
    <group ref={root} position={[0, -0.25, 0]}>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.52, 28, 22]} />
        <meshStandardMaterial color="#b87856" roughness={0.62} metalness={0.03} />
      </mesh>
      <mesh position={[0, 1.16, -0.03]} scale={[1.02, 0.55, 0.94]}>
        <sphereGeometry args={[0.55, 24, 16]} />
        <meshStandardMaterial color="#111217" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0.18, 0.96, 0.48]} scale={[0.9, 0.09, 0.06]}>
        <sphereGeometry args={[0.12, 16, 10]} />
        <meshStandardMaterial color="#2d1711" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.83, 0.5]} scale={[0.55, 0.07, 0.05]}>
        <sphereGeometry args={[0.12, 16, 10]} />
        <meshStandardMaterial color="#9e5a4b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.38, 0.58, 1.25, 24]} />
        <meshStandardMaterial color="#25272f" roughness={0.48} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.2, 0.34]} scale={[0.55, 0.8, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#111217" roughness={0.72} />
      </mesh>
      <mesh position={[0.27, 0.25, 0.38]} rotation={[0, 0, -0.16]}>
        <boxGeometry args={[0.06, 1.05, 0.04]} />
        <meshStandardMaterial color="#8f94a8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.27, 0.25, 0.38]} rotation={[0, 0, 0.16]}>
        <boxGeometry args={[0.06, 1.05, 0.04]} />
        <meshStandardMaterial color="#8f94a8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.64, 0.05, 0]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.13, 0.72, 8, 16]} />
        <meshStandardMaterial color="#25272f" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[-0.64, 0.05, 0]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.13, 0.72, 8, 16]} />
        <meshStandardMaterial color="#25272f" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  )
}

function AccentEnvironment() {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.getElapsedTime() * 0.18
  })
  return (
    <>
      <mesh ref={ring} position={[0, 0.4, -0.45]} rotation={[Math.PI / 2.8, 0.2, 0]}>
        <torusGeometry args={[1.45, 0.012, 12, 96]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.6, 0.78, 0.12, 32]} />
        <meshStandardMaterial color="#121319" metalness={0.75} roughness={0.25} />
      </mesh>
    </>
  )
}

export default function AvatarScene() {
  return (
    <div className="w-full h-full" aria-label="Interactive stylized 3D avatar of Indrajit Mandal" role="img">
      <Canvas camera={{ position: [0, 0.3, 4.2], fov: 38 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.2} color="#d9d5e8" />
        <pointLight position={[3, 4, 4]} intensity={2.2} color="#fff4e7" />
        <pointLight position={[-3, 2, 2]} intensity={1.4} color="#6366f1" />
        <pointLight position={[0, 2, -3]} intensity={1.2} color="#ec4899" />
        <AccentEnvironment />
        <Avatar />
      </Canvas>
    </div>
  )
}