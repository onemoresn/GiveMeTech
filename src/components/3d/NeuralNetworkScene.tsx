import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useIsMobile } from '../../hooks/useMediaQuery'

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })

  const { nodes, connections } = useMemo(() => {
    const nodeCount = 30
    const nodes: THREE.Vector3[] = []
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4
        )
      )
    }
    const connections: [THREE.Vector3, THREE.Vector3][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 3) {
          connections.push([nodes[i], nodes[j]])
        }
      }
    }
    return { nodes, connections }
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1 + mouse.current.x * 0.5
      groupRef.current.rotation.x = mouse.current.y * 0.3
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerMove={(e) => {
        mouse.current.x = (e.point.x / 4)
        mouse.current.y = (e.point.y / 3)
      }}
    >
      {connections.map(([a, b], i) => (
        <Line
          key={i}
          points={[a, b]}
          color="#8b5cf6"
          transparent
          opacity={0.2}
          lineWidth={0.5}
        />
      ))}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.8 + Math.sin(i) * 0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

export function NeuralNetworkScene() {
  const isMobile = useIsMobile()

  return (
    <div className="absolute inset-0 opacity-60" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{ antialias: false, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} color="#8b5cf6" intensity={1} />
          <NeuralNetwork />
        </Suspense>
      </Canvas>
    </div>
  )
}
