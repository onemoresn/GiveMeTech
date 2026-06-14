import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Group } from 'three'
import { useIsMobile } from '../../hooks/useMediaQuery'

function Device({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1, 1.7]} />
        <meshStandardMaterial color="#001a33" emissive="#00f0ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function DevicesGroup() {
  return (
    <group>
      <Device position={[-2, 0, 0]} color="#ff6b00" scale={0.8} />
      <Device position={[0, 0, 0]} color="#ffd700" scale={1} />
      <Device position={[2, 0, 0]} color="#00f0ff" scale={0.7} />
    </group>
  )
}

export function DevicesScene() {
  const isMobile = useIsMobile()

  return (
    <div className="absolute inset-0 opacity-50" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={isMobile ? 1 : 1.5} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <DevicesGroup />
          <OrbitControls enableZoom enableRotate autoRotate autoRotateSpeed={1} />
        </Suspense>
      </Canvas>
    </div>
  )
}
