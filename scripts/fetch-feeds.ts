#!/usr/bin/env npx tsx
/**
 * Fetches latest tech stories from RSS feeds, categorizes them,
 * resolves topic-appropriate images/videos, and writes public/data/feed.json.
 */
import 'dotenv/config'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import Parser from 'rss-parser'
import type { SectionId } from '../src/data/sections'
import type { RssSource } from './feed-config'
import {
  RSS_SOURCES,
  MAX_ARTICLES,
  MAX_PER_SECTION,
  MAX_AGE_DAYS,
} from './feed-config'
import type { FeedArticle, FeedData } from './feed-types'
import { FEED_DATA_PATH } from './feed-types'
import {
  categorizeStory,
  shouldSkipStory,
  extractTags,
  estimateReadTime,
  slugify,
} from './lib/categorize'
import { cleanExcerpt, makeArticleId, resolveArticleImage, cleanBody, expandBody } from './lib/imageResolver'
import { generateSummary, hasGeminiKey, isGeminiActive, getGeminiUsage } from './lib/gemini'
import {
  fetchSectionVideos,
  fetchArticleVideo,
  hasPexelsKey,
  ARTICLE_VIDEO_SECTIONS,
} from './lib/pexelsMedia'

/** Cap a slow/hanging RSS feed so it can't stall the whole run. */
const RSS_TIMEOUT_MS = 15000
/** How many RSS sources to fetch in parallel. */
const RSS_CONCURRENCY = 8
/** How many article images to download in parallel (network-bound). */
const IMAGE_CONCURRENCY = 6

const parser = new Parser({
  timeout: RSS_TIMEOUT_MS,
  requestOptions: {
    headers: {
      'User-Agent': 'GiveMeTech/1.0 (RSS feed reader; +https://github.com/onemoresn/GiveMeTech)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

interface RawStory {
  title: string
  excerpt: string
  author: string
  date: Date
  url: string
  source: string
  section: SectionId
  categoryScore: number
  item: Record<string, unknown>
}

function isRecent(date: Date): boolean {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  return date.getTime() >= cutoff
}

/** Run an async mapper over items with a fixed concurrency, preserving input order. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  async function worker() {
    while (true) {
      const index = cursor++
      if (index >= items.length) return
      results[index] = await fn(items[index], index)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker)
  await Promise.all(workers)
  return results
}

async function fetchSource(source: RssSource): Promise<RawStory[]> {
  try {
    console.log(`  → ${source.name}`)
    const feed = await parser.parseURL(source.url)
    const stories: RawStory[] = []

    for (const item of feed.items) {
      if (!item.title || !item.link) continue
      if (shouldSkipStory(item.title, source)) continue

      const date = item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : new Date()
      if (!isRecent(date)) continue

      const excerpt = cleanExcerpt(
        (item.contentSnippet || item.content || item.summary || item.title) as string
      )

      const { section, score } = categorizeStory({
        title: item.title,
        excerpt,
        source,
      })

      const author = (item.creator || item.author || source.name) as string

      stories.push({
        title: item.title.trim(),
        excerpt,
        author: typeof author === 'string' ? author.replace(/<[^>]+>/g, '') : source.name,
        date,
        url: item.link,
        source: source.name,
        section,
        categoryScore: score,
        item: item as unknown as Record<string, unknown>,
      })
    }

    return stories
  } catch (err) {
    console.warn(`  ✗ Failed ${source.name}:`, err instanceof Error ? err.message : err)
    return []
  }
}

function dedupeAndLimit(stories: RawStory[]): RawStory[] {
  const seen = new Set<string>()
  const sectionCounts: Record<SectionId, number> = {
    ai: 0, cybersecurity: 0, gadgets: 0, software: 0, space: 0, gaming: 0, cars: 0,
  }
  const result: RawStory[] = []

  const sorted = [...stories].sort((a, b) => {
    const dateDiff = b.date.getTime() - a.date.getTime()
    if (dateDiff !== 0) return dateDiff
    return b.categoryScore - a.categoryScore
  })

  for (const story of sorted) {
    const key = slugify(story.title)
    if (seen.has(key)) continue
    if (sectionCounts[story.section] >= MAX_PER_SECTION) continue

    seen.add(key)
    sectionCounts[story.section]++
    result.push(story)

    if (result.length >= MAX_ARTICLES) break
  }

  return result
}

async function buildFeedArticles(stories: RawStory[]): Promise<FeedArticle[]> {
  // Phase 1 — resolve images in parallel (network-bound, the main bottleneck).
  console.log(`  📷 Resolving ${stories.length} images (×${IMAGE_CONCURRENCY} parallel)…`)
  const images = await mapWithConcurrency(stories, IMAGE_CONCURRENCY, (story) => {
    const id = makeArticleId(story.url, story.title)
    return resolveArticleImage(story.item, story.section, id, story.title, story.url)
  })

  // Phase 2 — build bodies. Gemini stays sequential so we respect its rate limit.
  const articles: FeedArticle[] = []
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i]
    const id = makeArticleId(story.url, story.title)

    const rawBody = (story.item['content:encoded'] || story.item.content || story.item.contentSnippet || '') as string
    const cleanedBody = cleanBody(rawBody)
    const tags = extractTags(story.title, story.section)

    // If RSS gave us substantially more than the excerpt, use it; otherwise ask Gemini or expand from metadata
    let body: string
    if (cleanedBody.length > story.excerpt.length + 80) {
      body = cleanedBody
    } else {
      const geminiBody = await generateSummary(story.title, story.excerpt, story.section, story.source)
      body = geminiBody ?? expandBody(story.title, story.excerpt, story.section, story.source, tags)
    }

    articles.push({
      id,
      title: story.title,
      excerpt: story.excerpt,
      body,
      author: story.author,
      date: story.date.toISOString().split('T')[0],
      readTime: estimateReadTime(body),
      section: story.section,
      tags,
      featured: articles.length < 6,
      xpReward: 30 + Math.floor(Math.random() * 25),
      url: story.url,
      image: images[i],
      source: story.source,
      isLive: true,
    })
  }

  return articles
}

type CachedVideo = { video?: string; videoPoster?: string }

async function attachArticleVideos(
  articles: FeedArticle[],
  cachedById: Map<string, CachedVideo>,
): Promise<void> {
  if (!hasPexelsKey()) return

  const sectionVideoAdded = new Set<SectionId>()

  for (const article of articles) {
    const isFeatured = article.featured === true
    const isSectionLead =
      ARTICLE_VIDEO_SECTIONS.has(article.section) && !sectionVideoAdded.has(article.section)

    if (!isFeatured && !isSectionLead) continue

    if (isSectionLead) sectionVideoAdded.add(article.section)

    // Reuse the previous run's video for articles we've already seen — no Pexels call.
    const cached = cachedById.get(article.id)
    if (cached?.video) {
      article.video = cached.video
      article.videoPoster = cached.videoPoster
      continue
    }

    console.log(`  🎬 Article video: ${article.title.slice(0, 50)}…`)
    const video = await fetchArticleVideo(article.section, article.title)
    if (video) {
      article.video = video.url
      article.videoPoster = video.poster || undefined
    }

    await new Promise((r) => setTimeout(r, 400))
  }
}

function buildBreakingNews(articles: FeedArticle[]): string[] {
  return articles.slice(0, 10).map((a) => `${a.source.toUpperCase()}: ${a.title}`)
}

function printSectionBreakdown(stories: RawStory[]) {
  const counts: Record<SectionId, number> = {
    ai: 0, cybersecurity: 0, gadgets: 0, software: 0, space: 0, gaming: 0, cars: 0,
  }
  for (const s of stories) counts[s.section]++
  console.log('\n📊 Section breakdown:')
  for (const [section, count] of Object.entries(counts)) {
    console.log(`   ${section.padEnd(14)} ${count}`)
  }
}

/** Load the existing feed.json so we can reuse cached videos and avoid re-hitting Pexels. */
async function loadPreviousFeed(): Promise<FeedData | null> {
  try {
    const raw = await readFile(FEED_DATA_PATH, 'utf8')
    return JSON.parse(raw) as FeedData
  } catch {
    return null
  }
}

async function main() {
  console.log('📡 Fetching tech RSS feeds…\n')

  const storyLists = await mapWithConcurrency(RSS_SOURCES, RSS_CONCURRENCY, fetchSource)
  const allStories: RawStory[] = storyLists.flat()

  console.log(`\n📰 ${allStories.length} raw stories → filtering…`)

  const selected = dedupeAndLimit(allStories)
  console.log(`✓ ${selected.length} stories selected`)
  printSectionBreakdown(selected)

  if (hasGeminiKey() && isGeminiActive()) {
    const { maxCalls } = getGeminiUsage()
    console.log(`\n✨ Gemini enabled — up to ${maxCalls} summaries per run`)
  } else if (hasGeminiKey()) {
    console.log('\n⚠  GEMINI_API_KEY set but GEMINI_ENABLED is not true — using template summaries')
  } else {
    console.log('\n⚠  No GEMINI_API_KEY — using template summaries for short excerpts')
  }

  console.log('\n🖼  Resolving images…')
  const articles = await buildFeedArticles(selected)

  let sectionVideos = {}
  if (hasPexelsKey()) {
    // Video enrichment is best-effort — never let it abort the run and lose the feed.
    try {
      const previousFeed = await loadPreviousFeed()
      const cachedArticleVideos = new Map<string, CachedVideo>()
      if (previousFeed) {
        for (const a of previousFeed.articles) {
          if (a.video) cachedArticleVideos.set(a.id, { video: a.video, videoPoster: a.videoPoster })
        }
      }
      const forceRefreshVideos = process.env.REFRESH_VIDEOS?.trim().toLowerCase() === 'true'

      console.log('\n🎬 Resolving section hero videos…')
      sectionVideos = await fetchSectionVideos(previousFeed?.sectionVideos ?? {}, forceRefreshVideos)
      console.log('\n🎬 Resolving article preview videos…')
      await attachArticleVideos(articles, forceRefreshVideos ? new Map() : cachedArticleVideos)
    } catch (err) {
      console.warn('  ⚠ Video enrichment failed — continuing without videos:', err instanceof Error ? err.message : err)
    }
  } else {
    console.log('\n⚠  No PEXELS_API_KEY — skipping Pexels images/videos beyond RSS')
  }

  const feed: FeedData = {
    fetchedAt: new Date().toISOString(),
    articles,
    breakingNews: buildBreakingNews(articles),
    sectionVideos,
  }

  await mkdir('public/data', { recursive: true })
  await writeFile(FEED_DATA_PATH, JSON.stringify(feed, null, 2))

  console.log(`\n✅ Wrote ${articles.length} articles to ${FEED_DATA_PATH}`)
  console.log(`   Last updated: ${feed.fetchedAt}`)

  const gemini = getGeminiUsage()
  if (gemini.enabled && gemini.calls > 0) {
    console.log(`   Gemini: ${gemini.calls}/${gemini.maxCalls} summaries generated this run`)
  } else if (gemini.enabled) {
    console.log('   Gemini: enabled but 0 summaries generated (API errors or no short excerpts)')
  }
}

main()
  .then(() => {
    // Force exit — lingering keep-alive sockets / AbortSignal timers from fetch can
    // otherwise hold the event loop open and hang the CI step until it times out.
    process.exit(0)
  })
  .catch((err) => {
    console.error('Feed fetch failed:', err)
    process.exit(1)
  })
