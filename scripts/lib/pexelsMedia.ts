import type { SectionId } from '../../src/data/sections'
import { SECTION_IMAGE_QUERIES } from '../feed-config'

export interface PexelsVideoResult {
  url: string
  poster: string
}

interface PexelsVideoFile {
  id?: number
  quality?: string
  file_type?: string
  width?: number
  height?: number
  link?: string
}

function getApiKey(): string | undefined {
  return process.env.PEXELS_API_KEY?.trim() || undefined
}

function pexelsHeaders(): HeadersInit | null {
  const key = getApiKey()
  if (!key) return null
  return { Authorization: key }
}

export function hasPexelsKey(): boolean {
  return Boolean(getApiKey())
}

export async function searchPexelsPhoto(query: string, pickIndex = 0): Promise<string | null> {
  const headers = pexelsHeaders()
  if (!headers) return null

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
      { headers, signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return null
    const data = (await res.json()) as { photos?: { src?: { large?: string; large2x?: string } }[] }
    const photos = data.photos ?? []
    if (!photos.length) return null
    const photo = photos[pickIndex % photos.length]?.src
    return photo?.large2x ?? photo?.large ?? null
  } catch {
    return null
  }
}

function pickVideoUrl(files: PexelsVideoFile[], maxWidth = 1920): string | null {
  const mp4s = files
    .filter((f) => f.file_type === 'video/mp4' && f.link)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))

  const suitable = mp4s.find((f) => (f.width ?? 0) <= maxWidth)
  return suitable?.link ?? mp4s[0]?.link ?? null
}

export async function searchPexelsVideo(query: string, maxWidth = 1920): Promise<PexelsVideoResult | null> {
  const headers = pexelsHeaders()
  if (!headers) return null

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers, signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return null

    const data = (await res.json()) as {
      videos?: { image?: string; video_files?: PexelsVideoFile[] }[]
    }

    const video = data.videos?.[0]
    if (!video?.video_files?.length) return null

    const url = pickVideoUrl(video.video_files, maxWidth)
    if (!url) return null

    return { url, poster: video.image ?? '' }
  } catch {
    return null
  }
}

/**
 * Section hero videos are generic topic footage that rarely needs to change, so we
 * reuse whatever the previous feed already had and only search Pexels for sections
 * that are missing (or all of them when `forceRefresh` is set).
 */
export async function fetchSectionVideos(
  cached: Partial<Record<SectionId, PexelsVideoResult>> = {},
  forceRefresh = false,
): Promise<Partial<Record<SectionId, PexelsVideoResult>>> {
  const sections = Object.keys(SECTION_VIDEO_QUERIES) as SectionId[]
  const result: Partial<Record<SectionId, PexelsVideoResult>> = {}

  for (const section of sections) {
    if (!forceRefresh && cached[section]?.url) {
      result[section] = cached[section]!
      console.log(`  ♻️  Section video (cached): ${section}`)
      continue
    }
    console.log(`  🎬 Section video: ${section}`)
    const video = await searchPexelsVideo(SECTION_VIDEO_QUERIES[section], 1920)
    if (video) result[section] = video
    await delay(350)
  }

  return result
}

export async function fetchArticleVideo(
  section: SectionId,
  title: string
): Promise<PexelsVideoResult | null> {
  const titleWords = title.split(/\s+/).slice(0, 5).join(' ')
  const query = `${SECTION_VIDEO_QUERIES[section]} ${titleWords}`.trim()
  return searchPexelsVideo(query, 1280)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Topic-specific video search queries (professional stock footage) */
export const SECTION_VIDEO_QUERIES: Record<SectionId, string> = {
  ai: 'artificial intelligence technology data center',
  cybersecurity: 'cybersecurity network server room',
  gadgets: 'smartphone laptop technology devices',
  software: 'software developer coding computer screen',
  space: 'space earth orbit satellite nasa',
  gaming: 'video gaming esports virtual reality',
  cars: 'electric vehicle charging automotive technology',
}

export function buildPhotoQuery(section: SectionId, title: string): { query: string; pickIndex: number } {
  const titleWords = title.split(/\s+/).slice(0, 4).join(' ')
  const query = `${SECTION_IMAGE_QUERIES[section]} ${titleWords}`.trim()
  // Deterministic pick index from title so every article consistently gets a different photo
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0
  return { query, pickIndex: hash % 15 }
}

/** Sections where article cards get video previews when possible */
export const ARTICLE_VIDEO_SECTIONS = new Set<SectionId>([
  'ai', 'gaming', 'space', 'gadgets', 'cybersecurity', 'software', 'cars',
])
