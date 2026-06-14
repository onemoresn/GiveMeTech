import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useIsMobile } from '../../hooks/useMediaQuery'

function PortalRing({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      ref.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1, 0.08, 16, 64]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.8} />
    </mesh>
  )
}

function PortalWorld() {
  return (
    <group>
      <PortalRing position={[0, 0, 0]} color="#ff00aa" />
      <PortalRing position={[0, 0, 0]} color="#8b5cf6" />
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#050510" emissive="#ff00aa" emissiveIntensity={0.5} />
      </mesh>
      <PortalRing position={[-3, 1, -2]} color="#00f0ff" />
      <PortalRing position={[3, -1, -1]} color="#ffd700" />
    </group>
  )
}

export function PortalScene() {
  const isMobile = useIsMobile()

  return (
    <div className="absolute inset-0 opacity-50" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} dpr={isMobile ? 1 : 1.5} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 5]} color="#ff00aa" intensity={1} />
          <PortalWorld />
        </Suspense>
      </Canvas>
    </div>
  )
}
