import { createHash } from 'node:crypto'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { SectionId } from '../../src/data/sections'
import { SECTION_FALLBACK_IMAGES } from '../feed-config'
import { FEED_IMAGES_DIR } from '../feed-types'
import { buildPhotoQuery, searchPexelsPhoto } from './pexelsMedia'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function cleanText(raw: string): string {
  return stripHtml(raw)
    .replace(/Article URL:\s*\S+/gi, '')
    .replace(/Comments URL:\s*\S+/gi, '')
    .replace(/Points:\s*\d+/gi, '')
    .replace(/#\s*Comments:\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Clean Hacker News / aggregator boilerplate from excerpts */
export function cleanExcerpt(raw: string, maxLength = 200): string {
  const text = cleanText(raw)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

/** Longer version of cleanExcerpt for the article body, broken at sentence boundaries */
export function cleanBody(raw: string, maxLength = 800): string {
  const text = cleanText(raw)
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastBreak = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
  )
  if (lastBreak > maxLength * 0.5) return truncated.slice(0, lastBreak + 1).trim()
  return `${truncated.trim()}…`
}

const SECTION_CONTEXT: Record<SectionId, string> = {
  ai: 'artificial intelligence and machine learning',
  cybersecurity: 'cybersecurity and digital privacy',
  gadgets: 'consumer technology and devices',
  software: 'software development and engineering',
  space: 'space exploration and astronomy',
  gaming: 'gaming and interactive entertainment',
  cars: 'electric vehicles, hybrids, and automotive technology',
}

/**
 * When an RSS feed only supplies a short one-liner excerpt (no full content),
 * build a structured 3-paragraph summary from the available metadata so the
 * modal has something meaningful to show.
 */
export function expandBody(
  title: string,
  excerpt: string,
  section: SectionId,
  source: string,
  tags: string[],
): string {
  const sectionCtx = SECTION_CONTEXT[section]
  const tagLine = tags.length > 0 ? `Key areas highlighted include ${tags.join(', ')}.` : ''

  const p1 = excerpt.endsWith('…') || excerpt.endsWith('...')
    ? `${excerpt.replace(/[.…]+$/, '')} — a development drawing significant attention in the ${sectionCtx} space.`
    : excerpt

  const p2 = `This report, published by ${source}, touches on a topic that has been gaining momentum across the industry. ${tagLine} As the situation continues to evolve, professionals and enthusiasts in the ${sectionCtx} field are closely watching for downstream effects.`

  const p3 = `For the full breakdown, analysis, and expert commentary, head to ${source} using the link below. GiveMeTech will continue tracking this story as more details emerge.`

  return [p1, p2, p3].filter(Boolean).join('\n\n')
}

export function extractImageFromItem(item: Record<string, unknown>): string | null {
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined
  if (enclosure?.url && enclosure.type?.startsWith('image')) return enclosure.url

  const mediaContent = item['media:content'] as { $?: { url?: string } } | undefined
  if (mediaContent?.$?.url) return mediaContent.$.url

  const mediaThumbnail = item['media:thumbnail'] as { $?: { url?: string } } | undefined
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url

  const content = (item.content || item['content:encoded'] || item.summary || '') as string
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch?.[1]) return imgMatch[1]

  return null
}

/** Skip storing images larger than this — they bloat the repo and slow the bot push. */
const MAX_IMAGE_BYTES = 4_000_000
const IMAGE_FETCH_TIMEOUT_MS = 15000

async function downloadImage(url: string, id: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image')) return null
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(await res.arrayBuffer())

    if (buffer.length < 1000) return null
    // Too heavy to commit — let the caller fall back to the remote URL.
    if (buffer.length > MAX_IMAGE_BYTES) return null

    await mkdir(FEED_IMAGES_DIR, { recursive: true })
    const filename = `${id}.${ext}`
    const filepath = path.join(FEED_IMAGES_DIR, filename)
    await writeFile(filepath, buffer)

    return `/images/feed/${filename}`
  } catch {
    return null
  }
}

export async function resolveArticleImage(
  item: Record<string, unknown>,
  section: SectionId,
  articleId: string,
  title: string
): Promise<string> {
  const rssImage = extractImageFromItem(item)
  if (rssImage) {
    const local = await downloadImage(rssImage, articleId)
    if (local) return local
    if (rssImage.startsWith('http')) return rssImage
  }

  const { query, pickIndex } = buildPhotoQuery(section, title)
  const pexelsUrl = await searchPexelsPhoto(query, pickIndex)
  if (pexelsUrl) {
    const local = await downloadImage(pexelsUrl, articleId)
    if (local) return local
    return pexelsUrl
  }

  return SECTION_FALLBACK_IMAGES[section]
}

export function makeArticleId(url: string, title: string): string {
  const hash = createHash('md5').update(url || title).digest('hex').slice(0, 12)
  return `feed-${hash}`
}
