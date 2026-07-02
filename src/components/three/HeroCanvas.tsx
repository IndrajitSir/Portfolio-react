import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload } from '@react-three/drei'
import ParticleField     from './ParticleField'
import FloatingGeometry  from './FloatingGeometry'

export default function HeroCanvas() {
  return (
    <div className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]}   intensity={1.2} color="#5eead4" />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#818cf8" />
        <spotLight
          position={[0, 8, 3]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          color="#5eead4"
        />

        <Suspense fallback={null}>
          <ParticleField count={320} radius={2.2} />
          <FloatingGeometry />
          <Preload all />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
