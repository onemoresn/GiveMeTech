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

/** Clean Hacker News / aggregator boilerplate from excerpts */
export function cleanExcerpt(raw: string, maxLength = 200): string {
  let text = stripHtml(raw)

  text = text
    .replace(/Article URL:\s*\S+/gi, '')
    .replace(/Comments URL:\s*\S+/gi, '')
    .replace(/Points:\s*\d+/gi, '')
    .replace(/#\s*Comments:\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
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

async function downloadImage(url: string, id: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const buffer = Buffer.from(await res.arrayBuffer())

    if (buffer.length < 1000) return null

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

  const pexelsUrl = await searchPexelsPhoto(buildPhotoQuery(section, title))
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
