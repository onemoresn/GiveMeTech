import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import { useIsMobile } from '../../hooks/useMediaQuery'

function Planet({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  )
}

function Satellite() {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * 0.5
      ref.current.position.x = Math.cos(t) * 4
      ref.current.position.z = Math.sin(t) * 4
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#cccccc" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function CosmosGroup() {
  return (
    <group>
      <Planet position={[0, 0, 0]} color="#4fc3f7" size={1.5} />
      <Planet position={[3.5, 0.5, -2]} color="#8b5cf6" size={0.6} />
      <Planet position={[-3, -0.3, 1]} color="#ffd700" size={0.4} />
      <Satellite />
    </group>
  )
}

export function CosmosScene() {
  const isMobile = useIsMobile()

  return (
    <div className="absolute inset-0 opacity-60" aria-hidden="true">
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }} dpr={isMobile ? 1 : 1.5} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={80} count={2000} factor={3} fade />
          <CosmosGroup />
        </Suspense>
      </Canvas>
    </div>
  )
}
