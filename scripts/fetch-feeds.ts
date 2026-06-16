#!/usr/bin/env npx tsx
/**
 * Fetches latest tech stories from RSS feeds, categorizes them,
 * resolves topic-appropriate images/videos, and writes public/data/feed.json.
 */
import 'dotenv/config'
import { writeFile, mkdir } from 'node:fs/promises'
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

const parser = new Parser({
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
  const articles: FeedArticle[] = []

  for (const story of stories) {
    const id = makeArticleId(story.url, story.title)
    console.log(`  📷 [${story.section}] ${story.title.slice(0, 55)}…`)

    const image = await resolveArticleImage(story.item, story.section, id, story.title)

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
      image,
      source: story.source,
      isLive: true,
    })
  }

  return articles
}

async function attachArticleVideos(articles: FeedArticle[]): Promise<void> {
  if (!hasPexelsKey()) return

  const sectionVideoAdded = new Set<SectionId>()

  for (const article of articles) {
    const isFeatured = article.featured === true
    const isSectionLead =
      ARTICLE_VIDEO_SECTIONS.has(article.section) && !sectionVideoAdded.has(article.section)

    if (!isFeatured && !isSectionLead) continue

    if (isSectionLead) sectionVideoAdded.add(article.section)

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

async function main() {
  console.log('📡 Fetching tech RSS feeds…\n')

  const allStories: RawStory[] = []
  for (const source of RSS_SOURCES) {
    const stories = await fetchSource(source)
    allStories.push(...stories)
  }

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
    console.log('\n🎬 Fetching section hero videos…')
    sectionVideos = await fetchSectionVideos()
    console.log('\n🎬 Fetching article preview videos…')
    await attachArticleVideos(articles)
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

main().catch((err) => {
  console.error('Feed fetch failed:', err)
  process.exit(1)
})
