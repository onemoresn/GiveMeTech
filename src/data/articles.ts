import type { SectionId } from './sections'

export interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  section: SectionId
  tags: string[]
  featured?: boolean
  xpReward: number
  /** Live feed fields */
  url?: string
  image?: string
  video?: string
  videoPoster?: string
  source?: string
  isLive?: boolean
}

export const articles: Article[] = [
  {
    id: 'gpt-next-gen',
    title: 'Next-Gen LLMs: Reasoning at the Edge of Possibility',
    excerpt: 'How multimodal foundation models are redefining human-AI collaboration across industries.',
    author: 'Dr. Elena Vasquez',
    date: '2026-06-12',
    readTime: '8 min',
    section: 'ai',
    tags: ['LLM', 'Multimodal', 'AGI'],
    featured: true,
    xpReward: 50,
  },
  {
    id: 'neural-arch-search',
    title: 'Neural Architecture Search Goes Mainstream',
    excerpt: 'AutoML pipelines now design models that outperform hand-crafted architectures.',
    author: 'Marcus Chen',
    date: '2026-06-11',
    readTime: '6 min',
    section: 'ai',
    tags: ['AutoML', 'NAS', 'Deep Learning'],
    xpReward: 35,
  },
  {
    id: 'quantum-ml',
    title: 'Quantum Machine Learning: Hype vs Reality in 2026',
    excerpt: 'A pragmatic look at where quantum advantage actually materializes for ML workloads.',
    author: 'Dr. Elena Vasquez',
    date: '2026-06-10',
    readTime: '10 min',
    section: 'ai',
    tags: ['Quantum', 'ML', 'Research'],
    xpReward: 45,
  },
  {
    id: 'zero-trust-2026',
    title: 'Zero Trust 2.0: Identity-First Security Architecture',
    excerpt: 'The evolution beyond perimeter defense into continuous verification ecosystems.',
    author: 'Sarah Okonkwo',
    date: '2026-06-12',
    readTime: '7 min',
    section: 'cybersecurity',
    tags: ['Zero Trust', 'Identity', 'Enterprise'],
    featured: true,
    xpReward: 40,
  },
  {
    id: 'ai-threat-detection',
    title: 'AI-Powered Threat Detection at Scale',
    excerpt: 'Machine learning models now identify zero-day exploits in real-time across global networks.',
    author: 'Sarah Okonkwo',
    date: '2026-06-09',
    readTime: '9 min',
    section: 'cybersecurity',
    tags: ['AI Security', 'Threat Intel', 'SOC'],
    xpReward: 40,
  },
  {
    id: 'post-quantum-crypto',
    title: 'Post-Quantum Cryptography: Migration Roadmap',
    excerpt: 'NIST-approved algorithms and the enterprise timeline for quantum-safe encryption.',
    author: 'James Park',
    date: '2026-06-08',
    readTime: '11 min',
    section: 'cybersecurity',
    tags: ['PQC', 'Encryption', 'NIST'],
    xpReward: 50,
  },
  {
    id: 'foldable-revolution',
    title: 'The Foldable Revolution: Beyond the Hype',
    excerpt: 'How hinge technology and display durability finally deliver on the promise.',
    author: 'Alex Rivera',
    date: '2026-06-11',
    readTime: '5 min',
    section: 'gadgets',
    tags: ['Foldables', 'Mobile', 'Display'],
    featured: true,
    xpReward: 30,
  },
  {
    id: 'neural-chip-wearables',
    title: 'Neural Chips in Wearables: On-Device AI Everywhere',
    excerpt: 'Dedicated NPUs in smartwatches and earbuds enable real-time health diagnostics.',
    author: 'Alex Rivera',
    date: '2026-06-07',
    readTime: '7 min',
    section: 'gadgets',
    tags: ['NPU', 'Wearables', 'Edge AI'],
    xpReward: 35,
  },
  {
    id: 'rust-systems',
    title: 'Rust Dominates Systems Programming in 2026',
    excerpt: 'Memory safety without garbage collection — why every major OS is rewriting critical paths.',
    author: 'Dev Patel',
    date: '2026-06-12',
    readTime: '8 min',
    section: 'software',
    tags: ['Rust', 'Systems', 'Memory Safety'],
    featured: true,
    xpReward: 45,
  },
  {
    id: 'webgpu-future',
    title: 'WebGPU: The Graphics API That Changes Everything',
    excerpt: 'Native GPU compute in the browser unlocks a new generation of web applications.',
    author: 'Dev Patel',
    date: '2026-06-10',
    readTime: '6 min',
    section: 'software',
    tags: ['WebGPU', 'Graphics', 'Web'],
    xpReward: 35,
  },
  {
    id: 'starship-mars',
    title: 'Starship Mission Update: Mars Timeline Accelerates',
    excerpt: 'Latest test flights bring humanity closer to becoming a multi-planetary species.',
    author: 'Dr. Maya Singh',
    date: '2026-06-11',
    readTime: '9 min',
    section: 'space',
    tags: ['SpaceX', 'Mars', 'Exploration'],
    featured: true,
    xpReward: 50,
  },
  {
    id: 'quantum-computing-breakthrough',
    title: '1000-Qubit Processors: The Quantum Inflection Point',
    excerpt: 'Error correction milestones bring practical quantum computing within reach.',
    author: 'Dr. Maya Singh',
    date: '2026-06-06',
    readTime: '12 min',
    section: 'space',
    tags: ['Quantum', 'Computing', 'Breakthrough'],
    xpReward: 55,
  },
  {
    id: 'vr-metaverse-2026',
    title: 'VR Metaverse 2026: Spatial Computing Goes Mainstream',
    excerpt: 'Mixed reality headsets blur the line between physical and digital workspaces.',
    author: 'Jordan Lee',
    date: '2026-06-12',
    readTime: '7 min',
    section: 'gaming',
    tags: ['VR', 'Metaverse', 'Spatial'],
    featured: true,
    xpReward: 40,
  },
  {
    id: 'unreal-engine-6',
    title: 'Unreal Engine 6: Photorealism in Real-Time',
    excerpt: 'Nanite and Lumen evolve to deliver cinematic quality at 120fps on consumer hardware.',
    author: 'Jordan Lee',
    date: '2026-06-09',
    readTime: '8 min',
    section: 'gaming',
    tags: ['Unreal', 'Game Engine', 'Graphics'],
    xpReward: 40,
  },
]

export const breakingNews = [
  'BREAKING: OpenAI announces real-time reasoning model with 10x latency reduction',
  'ALERT: Critical zero-day patched in major cloud infrastructure — details inside',
  'NEW: Apple Vision Pro 2 leaks reveal 8K per-eye displays',
  'UPDATE: NASA confirms Artemis IV launch window for Q3 2026',
  'TRENDING: WebGPU adoption hits 85% across modern browsers',
  'EXCLUSIVE: Quantum computer achieves first commercially viable error correction',
]

export function getArticlesBySection(section: SectionId): Article[] {
  return articles.filter((a) => a.section === section)
}

export function getFeaturedArticles(): Article[] {
  return articles.filter((a) => a.featured)
}

export function getArticle(id: string): Article | undefined {
  return articles.find((a) => a.id === id)
}
