import type { SectionId } from '../../src/data/sections'
import type { RssSource } from '../feed-config'
import {
  SECTION_KEYWORDS,
  CROSS_SECTION_PENALTIES,
  MIN_CATEGORIZATION_SCORE,
} from '../feed-config'

/** Single-letter or ambiguous tokens require word-boundary matching */
const BOUNDARY_KEYWORDS = new Set([
  'ai', 'ar', 'vr', 'os', 'go', 'r', 'c', 'api', 'game', 'space', 'security', 'device',
])

export interface CategorizeResult {
  section: SectionId
  score: number
  confident: boolean
}

export interface CategorizeInput {
  title: string
  excerpt: string
  source?: RssSource
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function keywordMatches(text: string, keyword: string): boolean {
  const lower = text.toLowerCase()
  const kw = keyword.toLowerCase()

  if (kw.includes(' ')) {
    return lower.includes(kw)
  }

  if (kw.length <= 3 || BOUNDARY_KEYWORDS.has(kw)) {
    return new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(text)
  }

  return lower.includes(kw)
}

export function categorizeStory(input: CategorizeInput): CategorizeResult {
  const { title, excerpt, source } = input
  const text = `${title} ${excerpt}`
  const scores: Record<SectionId, number> = {
    ai: 0,
    cybersecurity: 0,
    gadgets: 0,
    software: 0,
    space: 0,
    gaming: 0,
  }

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS) as [SectionId, Record<string, number>][]) {
    for (const [keyword, weight] of Object.entries(keywords)) {
      if (keywordMatches(text, keyword)) {
        scores[section] += weight
      }
    }
  }

  for (const { keyword, penalize, amount } of CROSS_SECTION_PENALTIES) {
    if (keywordMatches(text, keyword)) {
      scores[penalize] = Math.max(0, scores[penalize] - amount)
    }
  }

  if (source?.sectionBoost) {
    scores[source.sectionBoost] += 5
  }
  if (source?.defaultSection) {
    scores[source.defaultSection] += 2
  }

  let best: SectionId = source?.defaultSection ?? source?.sectionBoost ?? 'software'
  let bestScore = 0

  for (const [section, score] of Object.entries(scores) as [SectionId, number][]) {
    if (score > bestScore) {
      bestScore = score
      best = section
    }
  }

  const confident = bestScore >= MIN_CATEGORIZATION_SCORE

  if (!confident && source?.sectionBoost) {
    return { section: source.sectionBoost, score: bestScore, confident: true }
  }

  if (!confident && source?.defaultSection) {
    return { section: source.defaultSection, score: bestScore, confident: false }
  }

  return { section: best, score: bestScore, confident }
}

export function shouldSkipStory(title: string, source?: RssSource): boolean {
  if (!source?.skipTitlePatterns) return false
  return source.skipTitlePatterns.some((pattern) => pattern.test(title))
}

export function extractTags(title: string, section: SectionId): string[] {
  const keywords = SECTION_KEYWORDS[section]
  const matched = Object.entries(keywords)
    .filter(([keyword]) => keywordMatches(title, keyword))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([keyword]) =>
      keyword
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    )

  return matched.length > 0 ? matched : [section.replace(/^./, (c) => c.toUpperCase())]
}

export function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length
  const minutes = Math.max(2, Math.min(12, Math.ceil(words / 200)))
  return `${minutes} min`
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}
