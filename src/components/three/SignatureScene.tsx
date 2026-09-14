import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const damp = THREE.MathUtils.damp

/* Procedural studio environment (no external HDR downloads) so metallic
   and glass materials get realistic reflections. */
function SceneEnvironment() {
  const { scene, gl } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture
    return () => {
      envTexture.dispose()
      pmrem.dispose()
    }
  }, [scene, gl])

  return null
}

/* Emissive metallic heart of the sculpture */
function DigitalCore() {
  const core = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, delta) => {
    if (!core.current) return
    const t = clock.getElapsedTime()

    core.current.rotation.y += delta * 0.22
    core.current.rotation.x = Math.sin(t * 0.35) * 0.12

    const mat = core.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.25 + Math.sin(t * 1.4) * 0.15
  })

  return (
    <mesh ref={core}>
      <icosahedronGeometry args={[0.85, 1]} />
      <meshStandardMaterial
        color="#12141f"
        metalness={0.9}
        roughness={0.25}
        emissive="#5eead4"
        emissiveIntensity={0.3}
        flatShading
      />
    </mesh>
  )
}

/* Glass shell + faint tech wireframe wrapping the core */
function GlassShell() {
  const shell = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (shell.current) shell.current.rotation.y -= delta * 0.08
    if (wire.current) {
      wire.current.rotation.y += delta * 0.12
      wire.current.rotation.z += delta * 0.05
    }
  })

  return (
    <group>
      <mesh ref={shell}>
        <sphereGeometry args={[1.18, 48, 48]} />
        <meshPhysicalMaterial
          color="#818cf8"
          transparent
          opacity={0.14}
          roughness={0.05}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={wire} scale={1.32}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

/* Gyroscope-style tilted metallic rings, each on its own axis */
function OrbitRings() {
  const rings = useRef<THREE.Group>(null)

  const config = useMemo(
    () => [
      { radius: 1.62, tube: 0.014, color: '#e8eaf0', tilt: [Math.PI / 2.4, 0.2, 0] as const, speed: 0.35 },
      { radius: 1.88, tube: 0.012, color: '#5eead4', tilt: [Math.PI / 1.9, -0.45, 0.3] as const, speed: -0.25 },
      { radius: 2.14, tube: 0.01, color: '#818cf8', tilt: [Math.PI / 3.1, 0.8, -0.2] as const, speed: 0.18 },
    ],
    [],
  )

  useFrame((_, delta) => {
    if (!rings.current) return
    rings.current.children.forEach((ring, i) => {
      ring.rotation.z += delta * config[i].speed
    })
  })

  return (
    <group ref={rings}>
      {config.map((ring, i) => (
        <mesh key={i} rotation={[ring.tilt[0], ring.tilt[1], ring.tilt[2]]}>
          <torusGeometry args={[ring.radius, ring.tube, 16, 128]} />
          <meshStandardMaterial
            color={ring.color}
            metalness={0.95}
            roughness={0.2}
            emissive={ring.color}
            emissiveIntensity={i === 0 ? 0 : 0.25}
          />
        </mesh>
      ))}
    </group>
  )
}

/* Small emissive "data satellites" on inclined orbital paths */
function Satellites() {
  const group = useRef<THREE.Group>(null)

  const satellites = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        orbitRadius: 1.6 + (i % 3) * 0.26,
        speed: 0.5 + i * 0.14,
        inclination: (i / 5) * Math.PI,
        phase: (i / 5) * Math.PI * 2,
        color: i % 2 === 0 ? '#5eead4' : '#818cf8',
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()

    group.current.children.forEach((sat, i) => {
      const s = satellites[i]
      const angle = t * s.speed + s.phase
      const x = Math.cos(angle) * s.orbitRadius
      const z = Math.sin(angle) * s.orbitRadius
      const y = Math.sin(angle) * s.orbitRadius * Math.sin(s.inclination) * 0.35
      sat.position.set(x, y, z)
      sat.rotation.x += 0.02
      sat.rotation.y += 0.03
    })
  })

  return (
    <group ref={group}>
      {satellites.map((s, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.9}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

/* Subtle teal-to-indigo particle halo */
function ParticleHalo() {
  const points = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const count = 220
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const teal = new THREE.Color('#5eead4')
    const indigo = new THREE.Color('#818cf8')

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const theta = Math.acos(1 - (2 * (i + 0.5)) / count)
      const phi = Math.PI * (1 + Math.sqrt(5)) * i
      const radius = 2.5 + (Math.random() - 0.5) * 0.7

      pos[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = radius * Math.cos(theta)

      const c = teal.clone().lerp(indigo, Math.random())
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return { positions: pos, colors: col }
  }, [])

  useFrame(({ clock, pointer }, delta) => {
    if (!points.current) return
    points.current.rotation.y += delta * 0.05
    const mat = points.current.material as THREE.PointsMaterial
    mat.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 1.2) * 0.08
    points.current.rotation.x = damp(points.current.rotation.x, pointer.y * 0.15, 3, delta)
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/* Whole sculpture: 360° rotation, floating, pointer tilt, hover scale */
function Sculpture() {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ pointer, clock }, delta) => {
    if (!group.current) return
    const t = clock.getElapsedTime()

    // Continuous slow 360° rotation
    group.current.rotation.y += delta * 0.15

    // Floating / breathing motion
    const floatY = Math.sin(t * 0.8) * 0.12
    const breathe = 1 + Math.sin(t * 1.1) * 0.012

    // Damped pointer tilt
    group.current.rotation.x = damp(group.current.rotation.x, pointer.y * 0.18, 3, delta)
    group.current.position.y = damp(group.current.position.y, floatY + pointer.y * 0.06, 3, delta)
    group.current.position.x = damp(group.current.position.x, pointer.x * 0.1, 3, delta)

    // Hover scale
    const targetScale = (hovered ? 1.05 : 1) * breathe
    group.current.scale.setScalar(damp(group.current.scale.x, targetScale, 4, delta))
  })

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <DigitalCore />
      <GlassShell />
      <OrbitRings />
      <Satellites />
    </group>
  )
}

export default function SignatureScene() {
  return (
    <div
      className="w-full h-full"
      style={{ cursor: 'grab' }}
      aria-label="Interactive 3D digital core sculpture representing software development"
      role="img"
    >
      <Canvas
        camera={{ position: [0, 0.4, 5.4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <SceneEnvironment />

        <ambientLight intensity={0.35} />
        <pointLight position={[4, 4, 4]} intensity={1.6} color="#5eead4" />
        <pointLight position={[-4, -2, 3]} intensity={1} color="#818cf8" />
        <pointLight position={[0, 5, -4]} intensity={0.8} color="#5eead4" />

        <Sculpture />
        <ParticleHalo />
      </Canvas>
    </div>
  )
}
