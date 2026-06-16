import { Suspense } from 'react'
import type { SectionId } from '../../data/sections'
import { NeuralNetworkScene } from './NeuralNetworkScene'
import { VaultScene } from './VaultScene'
import { DevicesScene } from './DevicesScene'
import { TerminalScene } from './TerminalScene'
import { CosmosScene } from './CosmosScene'
import { PortalScene } from './PortalScene'

const sceneMap: Record<SectionId, React.ComponentType> = {
  ai: NeuralNetworkScene,
  cybersecurity: VaultScene,
  gadgets: DevicesScene,
  software: TerminalScene,
  space: CosmosScene,
  gaming: PortalScene,
  cars: DevicesScene,
}

interface SectionSceneProps {
  sectionId: SectionId
}

export function SectionScene({ sectionId }: SectionSceneProps) {
  const Scene = sceneMap[sectionId]
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  )
}
