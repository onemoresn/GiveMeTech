import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { useIsMobile } from '../../hooks/useMediaQuery'

function VaultShield() {
  const shieldRef = useRef<Group>(null)
  const ringRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (shieldRef.current) shieldRef.current.rotation.y = state.clock.elapsedTime * 0.3
    if (ringRef.current) ringRef.current.rotation.z = -state.clock.elapsedTime * 0.5
  })

  return (
    <group ref={shieldRef}>
      <mesh>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[2.5, 0.05, 8, 64]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.03, 8, 64]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export function VaultScene() {
  const isMobile = useIsMobile()

  return (
    <div className="absolute inset-0 opacity-50" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} dpr={isMobile ? 1 : 1.5} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 5, 5]} color="#00ff88" intensity={1} />
          <VaultShield />
        </Suspense>
      </Canvas>
    </div>
  )
}
