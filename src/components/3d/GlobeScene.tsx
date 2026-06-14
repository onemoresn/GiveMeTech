import { Suspense, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useIsMobile, useReducedMotion } from '../../hooks/useMediaQuery'
import type { Article } from '../../data/articles'

interface GlobeSceneProps {
  articles: Article[]
  onHotspotClick?: (article: Article) => void
}

function CircuitGlobe({ onHotspotClick, articles }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.15
    }
  })

  const hotspots = useMemo(() => {
    return articles.slice(0, 6).map((article, i) => {
      const phi = Math.acos(-1 + (2 * i) / 6)
      const theta = Math.sqrt(6 * Math.PI) * phi
      const r = 2.2
      return {
        article,
        position: [
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi),
        ] as [number, number, number],
      }
    })
  }, [articles])

  return (
    <group ref={globeRef}>
      <mesh>
        <icosahedronGeometry args={[2, 2]} />
        <meshBasicMaterial color="#0a1628" wireframe transparent opacity={0.3} />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.95, 32, 32]} />
        <meshStandardMaterial
          color="#050510"
          emissive="#001a33"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {Array.from({ length: 20 }).map((_, i) => {
        const lat = (i / 20) * Math.PI
        const lng = (i * 2.4) % (Math.PI * 2)
        const r = 2
        const x = r * Math.sin(lat) * Math.cos(lng)
        const y = r * Math.cos(lat)
        const z = r * Math.sin(lat) * Math.sin(lng)
        return (
          <Line
            key={i}
            points={[
              [x * 0.95, y * 0.95, z * 0.95],
              [x * 1.05, y * 1.05, z * 1.05],
            ]}
            color="#00f0ff"
            transparent
            opacity={0.3}
            lineWidth={1}
          />
        )
      })}

      {hotspots.map(({ article, position }) => (
        <group key={article.id} position={position}>
          <mesh
            onPointerOver={() => setHovered(article.id)}
            onPointerOut={() => setHovered(null)}
            onClick={() => onHotspotClick?.(article)}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={hovered === article.id ? '#ff00aa' : '#00f0ff'}
              emissive={hovered === article.id ? '#ff00aa' : '#00f0ff'}
              emissiveIntensity={hovered === article.id ? 2 : 1}
            />
          </mesh>
          {hovered === article.id && (
            <Html distanceFactor={8} center>
              <div className="glass-panel p-3 w-48 pointer-events-none border-neon-cyan/30">
                <p className="font-display text-[10px] font-bold text-neon-cyan">{article.title}</p>
                <p className="text-[8px] text-text-secondary mt-1">{article.excerpt.slice(0, 60)}...</p>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}

function SceneContent(props: GlobeSceneProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#8b5cf6" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <CircuitGlobe {...props} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  )
}

export function GlobeScene(props: GlobeSceneProps) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, isMobile ? 6 : 5], fov: 60 }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
      {reducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center bg-void/50">
          <p className="text-text-muted text-sm">3D animations reduced for accessibility</p>
        </div>
      )}
    </div>
  )
}
