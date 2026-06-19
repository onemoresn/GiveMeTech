import type { SectionId } from '../src/data/sections'

export interface RssSource {
  name: string
  url: string
  /** Applied when keyword scores are low or tied */
  defaultSection?: SectionId
  /** Strong section hint (+5 score) for topic-specific feeds */
  sectionBoost?: SectionId
  /** Skip items whose title matches any of these patterns */
  skipTitlePatterns?: RegExp[]
}

/** Tech RSS feeds — free, public, updated frequently */
export const RSS_SOURCES: RssSource[] = [
  // ── General tech (keyword categorization) ──
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'CNET', url: 'https://www.cnet.com/rss/news/' },
  { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml' },

  // ── AI & Machine Learning ──
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    sectionBoost: 'ai',
    defaultSection: 'ai',
  },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    sectionBoost: 'ai',
    defaultSection: 'ai',
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    sectionBoost: 'ai',
    defaultSection: 'ai',
  },

  // ── Cybersecurity ──
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    sectionBoost: 'cybersecurity',
    defaultSection: 'cybersecurity',
  },
  {
    name: 'BleepingComputer',
    url: 'https://www.bleepingcomputer.com/feed/',
    sectionBoost: 'cybersecurity',
    defaultSection: 'cybersecurity',
  },
  {
    name: 'The Hacker News',
    url: 'https://feeds.feedburner.com/TheHackersNews',
    sectionBoost: 'cybersecurity',
    defaultSection: 'cybersecurity',
  },

  // ── Gadgets & Hardware ──
  {
    name: 'Engadget',
    url: 'https://www.engadget.com/rss.xml',
    sectionBoost: 'gadgets',
    defaultSection: 'gadgets',
  },
  {
    name: '9to5Mac',
    url: 'https://9to5mac.com/feed/',
    sectionBoost: 'gadgets',
    defaultSection: 'gadgets',
  },
  {
    name: 'Android Authority',
    url: 'https://www.androidauthority.com/feed/',
    sectionBoost: 'gadgets',
    defaultSection: 'gadgets',
  },

  // ── Software & Development ──
  {
    name: 'GitHub Blog',
    url: 'https://github.blog/feed/',
    sectionBoost: 'software',
    defaultSection: 'software',
  },
  {
    name: 'InfoQ',
    url: 'https://feed.infoq.com/',
    sectionBoost: 'software',
    defaultSection: 'software',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    sectionBoost: 'software',
    defaultSection: 'software',
    skipTitlePatterns: [/^#\w+/], // skip tag-only noise
  },
  {
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    defaultSection: 'software',
    skipTitlePatterns: [
      /^show hn:/i,
      /^ask hn:/i,
      /^tell hn:/i,
      /^launch hn:/i,
    ],
  },

  // ── Space & Future Tech ──
  {
    name: 'NASA Breaking News',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    sectionBoost: 'space',
    defaultSection: 'space',
  },
  {
    name: 'Space.com',
    url: 'https://www.space.com/feeds/all',
    sectionBoost: 'space',
    defaultSection: 'space',
  },
  {
    name: 'SpaceNews',
    url: 'https://spacenews.com/feed/',
    sectionBoost: 'space',
    defaultSection: 'space',
  },

  // ── Gaming & VR/AR ──
  {
    name: 'IGN',
    url: 'https://feeds.feedburner.com/ign/all',
    sectionBoost: 'gaming',
    defaultSection: 'gaming',
  },
  {
    name: 'Polygon',
    url: 'https://www.polygon.com/rss/index.xml',
    sectionBoost: 'gaming',
    defaultSection: 'gaming',
  },
  {
    name: 'Kotaku',
    url: 'https://kotaku.com/rss',
    sectionBoost: 'gaming',
    defaultSection: 'gaming',
  },

  // ── Cars & Auto Tech (EV, hybrid, in-car technology) ──
  {
    name: 'Electrek',
    url: 'https://electrek.co/feed/',
    sectionBoost: 'cars',
    defaultSection: 'cars',
  },
  {
    name: 'InsideEVs',
    url: 'https://insideevs.com/feed/',
    sectionBoost: 'cars',
    defaultSection: 'cars',
  },
  {
    name: 'CleanTechnica',
    url: 'https://cleantechnica.com/feed/',
    sectionBoost: 'cars',
    defaultSection: 'cars',
  },
]

/**
 * Keyword weights: higher = stronger signal.
 * Multi-word phrases score higher than single tokens.
 */
export const SECTION_KEYWORDS: Record<SectionId, Record<string, number>> = {
  ai: {
    'artificial intelligence': 4,
    'machine learning': 4,
    'deep learning': 4,
    'large language model': 4,
    'generative ai': 4,
    'computer vision': 3,
    'openai': 3,
    'anthropic': 3,
    'chatgpt': 3,
    'copilot': 3,
    'gemini': 3,
    'claude': 3,
    'llm': 2,
    'gpt': 2,
    'neural': 2,
    'transformer': 2,
    'nlp': 2,
    'automation': 1,
  },
  cybersecurity: {
    'zero-day': 4,
    'zero day': 4,
    'ransomware': 4,
    'malware': 4,
    'phishing': 4,
    'data breach': 4,
    'cyber attack': 4,
    'cybersecurity': 3,
    'vulnerability': 3,
    'encryption': 2,
    'firewall': 2,
    'exploit': 2,
    'threat actor': 3,
    'patch tuesday': 3,
    'cve-': 3,
    'authentication': 2,
    'identity theft': 3,
    'security': 1,
    'hacker': 2,
    'breach': 2,
  },
  gadgets: {
    'smartphone': 3,
    'iphone': 3,
    'android phone': 3,
    'macbook': 3,
    'laptop': 2,
    'smartwatch': 3,
    'apple watch': 3,
    'headphones': 2,
    'earbuds': 2,
    'foldable': 3,
    'wearable': 2,
    'processor': 2,
    'snapdragon': 3,
    'qualcomm': 2,
    'pixel phone': 3,
    'galaxy s': 3,
    'vision pro': 3,
    'tablet': 2,
    'hardware review': 3,
    'hands-on': 2,
    'gadget': 2,
    'device': 1,
  },
  software: {
    'open source': 3,
    'programming language': 3,
    'developer tools': 3,
    'pull request': 3,
    'devops': 3,
    'kubernetes': 3,
    'typescript': 2,
    'javascript': 2,
    'python': 2,
    'rust lang': 3,
    'framework': 2,
    'github': 2,
    'api': 1,
    'linux kernel': 3,
    'database': 2,
    'cloud computing':  2,
    'programming': 2,
    'software': 1,
    'developer': 1,
    'startup': 1,
  },
  space: {
    'spacex': 4,
    'artemis': 3,
    'mars mission': 4,
    'rocket launch': 4,
    'space station': 3,
    'satellite': 2,
    'nasa': 3,
    'astronaut': 3,
    'orbit': 2,
    'telescope': 2,
    'james webb': 3,
    'quantum computing': 3,
    'space exploration': 4,
    'spacecraft': 3,
    'moon landing': 3,
    'starship': 3,
    'space': 1,
  },
  gaming: {
    'video game': 4,
    'game release': 3,
    'playstation': 3,
    'xbox': 3,
    'nintendo switch': 3,
    'nintendo': 2,
    'steam deck': 3,
    'esports': 3,
    'virtual reality': 3,
    'meta quest': 3,
    'game engine': 3,
    'unreal engine': 3,
    'fortnite': 2,
    'multiplayer': 2,
    'gameplay': 2,
    'gaming': 2,
    'vr headset': 3,
    'metaverse': 2,
    'game': 1,
  },
  cars: {
    'electric vehicle': 4,
    'electric car': 4,
    'plug-in hybrid': 4,
    'hybrid vehicle': 4,
    'battery pack': 3,
    'fast charging': 3,
    'charging station': 3,
    'ev charging': 4,
    'autonomous driving': 4,
    'self-driving': 4,
    'driver assist': 3,
    'adas': 3,
    'over-the-air': 3,
    'infotainment': 3,
    'cybertruck': 3,
    'rivian': 3,
    'lucid motors': 3,
    'tesla': 2,
    'ev range': 3,
    'solid-state battery': 4,
    'electric motor': 3,
    'hybrid': 2,
    'automotive': 2,
    'car software': 3,
    'vehicle': 1,
    'ev': 2,
  },
}

/** Demote miscategorization from broad keyword matches */
export const CROSS_SECTION_PENALTIES: { keyword: string; penalize: SectionId; amount: number }[] = [
  { keyword: 'spacex ipo', penalize: 'software', amount: 4 },
  { keyword: 'social media', penalize: 'software', amount: 2 },
  { keyword: 'gift guide', penalize: 'gadgets', amount: 3 },
  { keyword: 'gift guide', penalize: 'gaming', amount: 3 },
  { keyword: 'security camera', penalize: 'cybersecurity', amount: 3 },
  { keyword: 'floodlight', penalize: 'cybersecurity', amount: 3 },
  { keyword: 'kindle', penalize: 'software', amount: 2 },
  { keyword: 'world cup', penalize: 'software', amount: 3 },
  { keyword: 'world cup', penalize: 'gaming', amount: 2 },
  { keyword: 'racing game', penalize: 'cars', amount: 4 },
  { keyword: 'forza', penalize: 'cars', amount: 3 },
  { keyword: 'gran turismo', penalize: 'cars', amount: 3 },
]

export const MIN_CATEGORIZATION_SCORE = 2

export const SECTION_IMAGE_QUERIES: Record<SectionId, string> = {
  ai: 'artificial intelligence technology office professional',
  cybersecurity: 'cybersecurity data center professional',
  gadgets: 'modern technology devices desk professional',
  software: 'software developer workspace professional',
  space: 'space technology satellite earth professional',
  gaming: 'video game technology virtual reality professional',
  cars: 'electric vehicle car technology charging professional',
}

export const SECTION_FALLBACK_IMAGES: Record<SectionId, string> = {
  ai: '/images/topics/topic-ai-ml.png',
  cybersecurity: '/images/topics/topic-cybersecurity.png',
  gadgets: '/images/topics/topic-gadgets.png',
  software: '/images/topics/topic-software.png',
  space: '/images/topics/topic-space.png',
  gaming: '/images/topics/topic-gaming.png',
  cars: '/images/topics/topic-cars.png',
}

export const MAX_ARTICLES = 49
export const MAX_PER_SECTION = 7
export const MAX_AGE_DAYS = 7
