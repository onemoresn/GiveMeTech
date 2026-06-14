import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Group } from 'three'
import { useIsMobile } from '../../hooks/useMediaQuery'

function CodeStream() {
  const groupRef = useRef<Group>(null)
  const snippets = useMemo(
    () => ['const future = await tech()', 'import { AI } from "@future"', 'async function innovate() {', '  return breakthrough;', '}'],
    []
  )

  useFrame((state) => {
    if (groupRef.current) groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
  })

  return (
    <group ref={groupRef}>
      {snippets.map((text, i) => (
        <Text
          key={i}
          position={[-3, 1.5 - i * 0.8, 0]}
          fontSize={0.25}
          color="#00f0ff"
          anchorX="left"
        >
          {text}
        </Text>
      ))}
      <mesh position={[2, 0, -1]}>
        <boxGeometry args={[3, 2.5, 0.05]} />
        <meshStandardMaterial color="#0a1628" emissive="#00f0ff" emissiveIntensity={0.1} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export function TerminalScene() {
  const isMobile = useIsMobile()

  return (
    <div className="absolute inset-0 opacity-40" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} dpr={isMobile ? 1 : 1.5} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 5]} color="#00f0ff" intensity={0.8} />
          <CodeStream />
        </Suspense>
      </Canvas>
    </div>
  )
}
