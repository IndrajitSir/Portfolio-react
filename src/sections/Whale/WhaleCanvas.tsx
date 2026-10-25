import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { clamp } from '@/utils'
import { createLabelTexture } from '@/components/three/labelTexture'
import {
  ASSEMBLY_END,
  CONTAINER_SIZE,
  INSIDE_IN,
  INSIDE_OUT,
  containerPositions,
  tourState,
  whaleChapters,
} from './whaleChapters'

export interface WhaleCanvasProps {
  progressRef: MutableRefObject<number>
  hovered: number | null
  /** The carrier is fully assembled — its annotations belong on screen. */
  assembled: boolean
  /** The camera sits past a container's doorway; the chapter panel is showing. */
  inside: boolean
  reduceMotion: boolean
  compact: boolean
  inView: boolean
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}

const BODY_COLOR = '#2563eb'
const EDGE_COLOR = '#9bc9ff'
const CONTAINER_COLORS = ['#1d5fe0', '#2a70f0', '#174fb8', '#2f7bf7', '#1f66e6', '#2563eb']

const smoothstep = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / (to - from), 0, 1)
  return x * x * (3 - 2 * x)
}

const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value, 0, 1), 3)
const easeInOutCubic = (value: number) => {
  const x = clamp(value, 0, 1)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** The whale's side profile, extruded into a solid with rounded bevels. */
function createBodyGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(-3.55, 0.02)
  shape.bezierCurveTo(-3.52, 0.62, -2.98, 0.96, -2.3, 1.03)
  shape.bezierCurveTo(-1.5, 1.11, -0.35, 1.08, 0.72, 0.99)
  shape.bezierCurveTo(1.56, 0.91, 2.22, 0.78, 2.66, 0.55)
  shape.bezierCurveTo(2.93, 0.41, 3.06, 0.26, 3.1, 0.12)
  shape.bezierCurveTo(3.0, 0.0, 2.9, -0.12, 2.7, -0.22)
  shape.bezierCurveTo(2.25, -0.44, 1.82, -0.62, 1.26, -0.82)
  shape.bezierCurveTo(0.42, -1.08, -0.7, -1.14, -1.62, -0.96)
  shape.bezierCurveTo(-2.52, -0.8, -3.3, -0.48, -3.55, 0.02)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.7,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.14,
    bevelSegments: 4,
    curveSegments: 30,
    steps: 1,
  })
  geometry.translate(0, 0, -0.85)
  return geometry
}

/** Two flukes with the notch between them, extruded and centred on the tail. */
function createTailGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.2, 0.35, 0.55, 0.62, 0.62, 0.92)
  shape.bezierCurveTo(0.66, 1.08, 0.46, 1.15, 0.32, 1.02)
  shape.bezierCurveTo(0.16, 0.82, 0.02, 0.48, -0.06, 0.18)
  shape.lineTo(-0.06, -0.18)
  shape.bezierCurveTo(0.02, -0.48, 0.16, -0.82, 0.32, -1.02)
  shape.bezierCurveTo(0.46, -1.15, 0.66, -1.08, 0.62, -0.92)
  shape.bezierCurveTo(0.55, -0.62, 0.2, -0.35, 0, 0)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 3,
    curveSegments: 20,
    steps: 1,
  })
  geometry.translate(0, 0, -0.21)
  return geometry
}

/** A container is a real chapter: hover lifts it, select opens its door. */
function Container({
  index,
  position,
  progressRef,
  hovered,
  reduceMotion,
  compact,
  onHover,
  onSelect,
}: {
  index: number
  position: [number, number, number]
  progressRef: MutableRefObject<number>
  hovered: number | null
  reduceMotion: boolean
  compact: boolean
  onHover: (index: number | null) => void
  onSelect: (index: number) => void
}) {
  const group = useRef<THREE.Group>(null)
  const door = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const lift = useRef(0)
  const { width, height, depth } = CONTAINER_SIZE

  const label = useMemo(
    () => createLabelTexture(whaleChapters[index].code, '#e2f0ff'),
    [index],
  )
  useEffect(() => () => label.dispose(), [label])

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  useFrame((_, delta) => {
    const groupObject = group.current
    if (!groupObject) return

    // Reduced motion skips the assembly, but the tour still follows the scroll.
    const progress = reduceMotion ? Math.max(progressRef.current, ASSEMBLY_END) : progressRef.current
    const assembly = clamp(progress / ASSEMBLY_END, 0, 1)
    const tour = tourState(progress)
    const isActive = tour.index === index
    const opened = tour.inside && isActive
    const highlighted = hovered === index || opened
    const land = easeOutCubic(clamp((assembly - index * 0.045) / 0.62, 0, 1))

    // Each block rises from below the whale into its slot in the stack.
    groupObject.position.set(
      lerp(position[0] + (index - 2.5) * 0.55, position[0], land),
      lerp(-3.6 - index * 0.12, position[1], land),
      lerp(index % 2 === 0 ? 2.4 : -2.4, position[2], land),
    )
    groupObject.rotation.y = lerp(index % 2 === 0 ? -0.55 : 0.55, 0, land)
    groupObject.scale.setScalar(0.55 + 0.45 * land)

    lift.current += ((highlighted ? 0.12 : 0) - lift.current) * Math.min(1, delta * 12)
    groupObject.position.y += lift.current

    if (material.current) {
      material.current.emissiveIntensity = highlighted ? 0.55 : isActive ? 0.16 : 0.04
    }
    if (door.current) {
      door.current.rotation.y +=
        ((opened ? -1.95 : 0) - door.current.rotation.y) * Math.min(1, delta * 6)
    }
  })

  return (
    <group ref={group}>
      <RoundedBox
        args={[width, height, depth]}
        radius={0.06}
        smoothness={compact ? 2 : 4}
        castShadow={false}
        receiveShadow={false}
      >
        <meshStandardMaterial
          ref={material}
          color={CONTAINER_COLORS[index]}
          metalness={0.4}
          roughness={0.38}
          emissive="#4f8fff"
          emissiveIntensity={0.04}
        />
        <Edges threshold={28} color={EDGE_COLOR} />
      </RoundedBox>

      {/* The dark opening behind the front door. */}
      <mesh position={[0, 0, depth / 2 + 0.006]}>
        <planeGeometry args={[width - 0.12, height - 0.1]} />
        <meshBasicMaterial color="#04101f" />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.01]}>
        <planeGeometry args={[0.34, 0.012]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.7} />
      </mesh>

      {/* Door, hinged on its left edge. */}
      <group ref={door} position={[-width / 2 + 0.05, 0, depth / 2 + 0.018]}>
        <mesh position={[width / 2 - 0.05, 0, 0]}>
          <boxGeometry args={[width - 0.1, height - 0.08, 0.022]} />
          <meshStandardMaterial
            color={CONTAINER_COLORS[index]}
            metalness={0.45}
            roughness={0.32}
            emissive="#4f8fff"
            emissiveIntensity={hovered === index ? 0.28 : 0.08}
          />
        </mesh>
        <mesh position={[width / 2 - 0.05, 0.02, 0.04]}>
          <planeGeometry args={[0.64, 0.08]} />
          <meshBasicMaterial map={label} transparent toneMapped={false} />
        </mesh>
      </group>

      {/* Generous invisible hit area, so the detailed geometry stays easy to hit. */}
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          onSelect(index)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(index)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = ''
        }}
      >
        <boxGeometry args={[width + 0.04, height + 0.12, depth + 0.1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Spout() {
  const drops = useRef<Array<THREE.Mesh | null>>([])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    drops.current.forEach((drop, index) => {
      if (!drop) return
      const rise = (time * 0.34 + index * 0.17) % 1
      drop.position.set(
        -0.14 + Math.sin((rise + index) * Math.PI) * 0.18,
        0.28 + rise * 0.92,
        Math.cos(index * 1.7) * 0.14,
      )
      drop.scale.setScalar(0.075 * (1 - rise * 0.55))
    })
  })

  return (
    <group position={[-2.58, 1.0, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.055, 0.11, 0.22, 12]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.20, 0.03, 0.95, 12, 1, true]} />
        <meshBasicMaterial
          color="#a7dcff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <mesh
          key={index}
          ref={(element) => {
            drops.current[index] = element
          }}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#a7dcff" transparent opacity={0.52} />
        </mesh>
      ))}
    </group>
  )
}

function WhaleModel({
  progressRef,
  hovered,
  reduceMotion,
  compact,
  onHover,
  onSelect,
}: Pick<
  WhaleCanvasProps,
  | 'progressRef'
  | 'hovered'
  | 'reduceMotion'
  | 'compact'
  | 'onHover'
  | 'onSelect'
>) {
  const whaleRoot = useRef<THREE.Group>(null)
  const bodyGroup = useRef<THREE.Group>(null)
  const bodyMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const finMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const tailMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const eyeMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const smileMaterial = useRef<THREE.LineBasicMaterial>(null)

  const bodyGeometry = useMemo(createBodyGeometry, [])
  const tailGeometry = useMemo(createTailGeometry, [])
  const bodyEdges = useMemo(() => new THREE.EdgesGeometry(bodyGeometry, 42), [bodyGeometry])

  const smile = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.46, -0.06, 1.14),
      new THREE.Vector3(-3.02, -0.24, 1.16),
      new THREE.Vector3(-2.44, -0.28, 1.12),
    ])
    const points = curve.getPoints(24)
    const segments: THREE.Vector3[] = []
    for (let index = 0; index < points.length - 1; index += 1) {
      segments.push(points[index], points[index + 1])
    }
    return new THREE.BufferGeometry().setFromPoints(segments)
  }, [])

  useFrame(() => {
    const group = bodyGroup.current
    if (!group) return

    const progress = reduceMotion ? Math.max(progressRef.current, ASSEMBLY_END) : progressRef.current
    const assembly = clamp(progress / ASSEMBLY_END, 0, 1)
    const reveal = smoothstep(0.2, 0.78, assembly)

    group.position.y = -0.9 * (1 - reveal)
    const scale = 0.94 + 0.06 * reveal
    group.scale.setScalar(scale)
    group.visible = reveal > 0.01

    for (const material of [
      bodyMaterial.current,
      finMaterial.current,
      tailMaterial.current,
      eyeMaterial.current,
    ]) {
      if (!material) continue
      material.transparent = reveal < 0.999
      material.opacity = reveal
    }
    if (smileMaterial.current) {
      smileMaterial.current.transparent = true
      smileMaterial.current.opacity = reveal * 0.9
    }

    // A breath of idle motion moves the body, stack and all. It is skipped
    // entirely under reduced motion.
    if (whaleRoot.current && !reduceMotion) {
      const time = performance.now() / 1000
      whaleRoot.current.position.y = Math.sin(time * 0.7) * 0.025
      whaleRoot.current.rotation.z = Math.sin(time * 0.5) * 0.006
    }
  })

  return (
    <group ref={whaleRoot}>
      <group ref={bodyGroup}>
        <mesh geometry={bodyGeometry}>
          <meshStandardMaterial
            ref={bodyMaterial}
            color={BODY_COLOR}
            metalness={0.42}
            roughness={0.36}
          />
        </mesh>
        <lineSegments geometry={bodyEdges}>
          <lineBasicMaterial color={EDGE_COLOR} transparent opacity={0.16} />
        </lineSegments>

        <mesh geometry={tailGeometry} position={[3.02, 0.12, 0.03]} scale={0.95} rotation={[0, 0.12, 0]}>
          <meshStandardMaterial
            ref={tailMaterial}
            color="#1f5ad4"
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>

        {/* Pectoral fins, one on each side. The near fin breaks the belly line,
            which is what makes the silhouette read as an animal rather than a hull. */}
        <mesh position={[-1.8, -0.82, 0.96]} rotation={[0.18, 0.22, -0.62]} scale={[1.02, 0.15, 0.46]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial
            ref={finMaterial}
            color="#2a6df0"
            metalness={0.42}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[-1.72, -0.68, -0.92]} rotation={[-0.16, -0.22, -0.5]} scale={[0.86, 0.13, 0.38]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#1a4bb4" metalness={0.4} roughness={0.45} />
        </mesh>

        {/* Eye and blowhole sit proud of the bevel, so the face survives the lighting. */}
        <mesh position={[-2.7, 0.3, 1.13]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial ref={eyeMaterial} color="#04101f" roughness={0.2} />
        </mesh>
        <mesh position={[-2.67, 0.33, 1.205]}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshBasicMaterial color="#e5f5ff" />
        </mesh>
        <mesh position={[-2.5, 1.04, 0]} rotation={[-Math.PI / 2, 0, 0.18]}>
          <circleGeometry args={[0.075, 16]} />
          <meshBasicMaterial color="#0a2a5e" />
        </mesh>

        <lineSegments geometry={smile}>
          <lineBasicMaterial ref={smileMaterial} color="#08224d" transparent opacity={0.9} />
        </lineSegments>

        <Spout />
      </group>

      {containerPositions.map((position, index) => (
        <Container
          key={whaleChapters[index].id}
          index={index}
          position={position}
          progressRef={progressRef}
          hovered={hovered}
          reduceMotion={reduceMotion}
          compact={compact}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}

      {hovered !== null && (
        <Html
          position={[
            containerPositions[hovered][0],
            containerPositions[hovered][1] + 0.58,
            containerPositions[hovered][2],
          ]}
          center
          zIndexRange={[30, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="whitespace-nowrap rounded-md border border-[rgba(94,234,212,0.35)] bg-[rgba(5,11,22,0.88)] px-2.5 py-1 text-center font-mono-code backdrop-blur-md">
            <span className="block text-[9px] uppercase tracking-[0.22em] text-[var(--accent-teal)]">
              {whaleChapters[hovered].code}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.14em] text-[#dbeafe]">
              {whaleChapters[hovered].label}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}

interface CameraKey {
  x: number
  y: number
  z: number
  lookX: number
  lookY: number
  lookZ: number
}

/**
 * Where the camera belongs for a given scroll progress.
 *
 * The tour is a pure function of the scroll, not an animation that runs beside
 * it: every scroll position has exactly one camera pose, so scrolling backwards
 * rewinds the dive and a click is just a jump to another position.
 */
const blend = (from: CameraKey, to: CameraKey, amount: number): CameraKey => ({
  x: lerp(from.x, to.x, amount),
  y: lerp(from.y, to.y, amount),
  z: lerp(from.z, to.z, amount),
  lookX: lerp(from.lookX, to.lookX, amount),
  lookY: lerp(from.lookY, to.lookY, amount),
  lookZ: lerp(from.lookZ, to.lookZ, amount),
})

/** Fraction of a container's screen spent crossing the deck to its door. */
const DOOR_AT = 0.26

function cameraFrame(progress: number, aspect: number, compact: boolean): CameraKey {
  const assembly = clamp(progress / ASSEMBLY_END, 0, 1)
  const { index, t } = tourState(progress)

  const fit = aspect < 0.85 ? 24 : aspect < 1.2 ? 15.2 : 13.1
  const zoom = fit * (0.52 + 0.48 * assembly)
  const target = containerPositions[index]
  const pan = target[0] * 0.07

  // Wide: the complete whale, with the stack slightly favoured.
  const wide: CameraKey = {
    x: 0.75 + pan,
    y: 1.0 + 2.15 * assembly + (compact ? 0.35 : 0),
    z: zoom,
    lookX: pan * 1.1,
    lookY: 0.1 + 0.55 * assembly,
    lookZ: 0,
  }
  // Doorway: the selected container fills the frame and its door swings open.
  const doorway: CameraKey = {
    x: target[0],
    y: target[1] + 0.09,
    z: 2.05,
    lookX: target[0],
    lookY: target[1] + 0.02,
    lookZ: target[2],
  }
  // Threshold: the open door fills the screen, which is the chapter interior.
  const threshold: CameraKey = {
    x: target[0],
    y: target[1] + 0.04,
    z: 1.25,
    lookX: target[0],
    lookY: target[1] - 0.02,
    lookZ: target[2] - 1.5,
  }

  const leg = clamp(t / DOOR_AT, 0, 1)
  // Swing across the front of the stack first, then dolly in: travelling
  // straight at the doorway would drag the camera through the containers in
  // between, and they would fill the frame before the target does.
  const slide = easeOutCubic(leg)
  const dolly = smoothstep(0.4, 1, leg)
  const near: CameraKey = {
    x: lerp(wide.x, doorway.x, slide),
    y: lerp(wide.y, doorway.y, slide),
    z: lerp(wide.z, doorway.z, dolly),
    lookX: lerp(wide.lookX, doorway.lookX, slide),
    lookY: lerp(wide.lookY, doorway.lookY, slide),
    lookZ: lerp(wide.lookZ, doorway.lookZ, slide),
  }
  const push = easeOutCubic(clamp((t - DOOR_AT) / (INSIDE_IN + 0.06 - DOOR_AT), 0, 1))
  const leave = easeInOutCubic(clamp((t - INSIDE_OUT) / (1 - INSIDE_OUT), 0, 1))

  return blend(blend(near, threshold, push), wide, leave)
}

function CameraRig({
  progressRef,
  reduceMotion,
  compact,
}: Pick<WhaleCanvasProps, 'progressRef' | 'reduceMotion' | 'compact'>) {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(0, 0.7, 0), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    const frame = cameraFrame(progressRef.current, size.width / size.height, compact)
    target.set(frame.x, frame.y, frame.z)
    lookTarget.set(frame.lookX, frame.lookY, frame.lookZ)

    if (reduceMotion) {
      camera.position.copy(target)
      look.copy(lookTarget)
    } else {
      const damping = 1 - Math.pow(0.0015, delta)
      camera.position.lerp(target, damping)
      look.lerp(lookTarget, damping)
    }
    camera.lookAt(look)
  })

  return null
}

function Blueprint({ compact }: { compact: boolean }) {
  const lines = useMemo(() => {
    const points = [
      // Dimension rule above the stack.
      -3.7, 3.2, 0, 3.7, 3.2, 0,
      -3.7, 3.08, 0, -3.7, 3.32, 0,
      3.7, 3.08, 0, 3.7, 3.32, 0,
      // Centre line running behind the whale.
      -4.25, 0.55, -1.5, 4.25, 0.55, -1.5,
      // The composition frame.
      -4.4, -1.95, -1.5, 4.4, -1.95, -1.5,
      4.4, -1.95, -1.5, 4.4, 3.45, -1.5,
      4.4, 3.45, -1.5, -4.4, 3.45, -1.5,
      -4.4, 3.45, -1.5, -4.4, -1.95, -1.5,
    ]
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return geometry
  }, [])

  return (
    <group>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#2f6fed" transparent opacity={0.26} />
      </lineSegments>
      <gridHelper
        args={[compact ? 16 : 24, compact ? 16 : 24, '#173f73', '#0a1727']}
        position={[0, -1.94, 0]}
      />
      <mesh position={[0, -1.93, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[5, 1.9, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color="#041021" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Annotations({ compact }: { compact: boolean }) {
  if (compact) return null
  const label = 'whitespace-nowrap font-mono-code text-[8px] uppercase tracking-[0.2em] text-[#8fc4ff]'
  return (
    <>
      <Html position={[-3.35, 1.35, 0.4]} center style={{ pointerEvents: 'none' }}>
        <span className={label}>Head</span>
      </Html>
      <Html position={[-2.62, 2.45, 0]} center style={{ pointerEvents: 'none' }}>
        <span className={label}>Spout</span>
      </Html>
      <Html position={[3.5, 1.0, 0]} center style={{ pointerEvents: 'none' }}>
        <span className={label}>Flukes</span>
      </Html>
      <Html position={[0, 2.55, 0]} center style={{ pointerEvents: 'none' }}>
        <span className={label}>Stack · 06</span>
      </Html>
    </>
  )
}

export default function WhaleCanvas({
  progressRef,
  hovered,
  assembled,
  inside,
  reduceMotion,
  compact,
  inView,
  onHover,
  onSelect,
}: WhaleCanvasProps) {
  return (
    <Canvas
      dpr={compact ? [1, 1.3] : [1, 1.8]}
      frameloop={inView ? 'always' : 'never'}
      camera={{ fov: 40, near: 0.1, far: 60, position: [0.75, 1, 6.1] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onHover(null)}
      aria-hidden="true"
    >
      <fog attach="fog" args={['#070b14', 16, 34]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4.5, 7, 8]} intensity={2.1} color="#e2efff" />
      <directionalLight position={[-5, 3, 4]} intensity={1.1} color="#4f8fff" />
      <pointLight position={[-6, -1, 4]} intensity={7} distance={18} color="#1d63ed" />
      <pointLight position={[5, -2, 3]} intensity={3} distance={14} color="#5eead4" />

      <WhaleModel
        progressRef={progressRef}
        hovered={hovered}
        reduceMotion={reduceMotion}
        compact={compact}
        onHover={onHover}
        onSelect={onSelect}
      />
      <Blueprint compact={compact} />
      {assembled && !inside && <Annotations compact={compact} />}
      <CameraRig progressRef={progressRef} reduceMotion={reduceMotion} compact={compact} />
    </Canvas>
  )
}
