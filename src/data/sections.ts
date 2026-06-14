export type SectionId =
  | 'ai'
  | 'cybersecurity'
  | 'gadgets'
  | 'software'
  | 'space'
  | 'gaming'

export interface Section {
  id: SectionId
  title: string
  subtitle: string
  description: string
  icon: string
  path: string
  theme: 'neural' | 'vault' | 'devices' | 'terminal' | 'cosmos' | 'portal'
}

export const sections: Section[] = [
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    subtitle: 'Neural Frontiers',
    description: 'Explore breakthroughs in artificial intelligence, deep learning, and autonomous systems.',
    icon: '🧠',
    path: '/ai',
    theme: 'neural',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    subtitle: 'Digital Fortress',
    description: 'Threat intelligence, zero-trust architecture, and the evolving security landscape.',
    icon: '🛡️',
    path: '/cybersecurity',
    theme: 'vault',
  },
  {
    id: 'gadgets',
    title: 'Gadgets & Hardware',
    subtitle: 'Tech Arsenal',
    description: 'Hands-on reviews of cutting-edge devices, wearables, and next-gen hardware.',
    icon: '📱',
    path: '/gadgets',
    theme: 'devices',
  },
  {
    id: 'software',
    title: 'Software & Development',
    subtitle: 'Code Matrix',
    description: 'Frameworks, languages, DevOps, and the craft of building the future.',
    icon: '💻',
    path: '/software',
    theme: 'terminal',
  },
  {
    id: 'space',
    title: 'Space & Future Tech',
    subtitle: 'Orbital Horizon',
    description: 'Space exploration, quantum computing, and technologies reshaping tomorrow.',
    icon: '🚀',
    path: '/space',
    theme: 'cosmos',
  },
  {
    id: 'gaming',
    title: 'Gaming & VR/AR',
    subtitle: 'Immersive Realms',
    description: 'Virtual worlds, game engines, and the metaverse revolution.',
    icon: '🎮',
    path: '/gaming',
    theme: 'portal',
  },
]

export function getSection(id: SectionId): Section | undefined {
  return sections.find((s) => s.id === id)
}
