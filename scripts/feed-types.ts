import type { SectionId } from '../../src/data/sections'

export interface SectionVideo {
  url: string
  poster: string
}

export interface FeedArticle {
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
  url: string
  image: string
  source: string
  isLive: true
  video?: string
  videoPoster?: string
}

export interface FeedData {
  fetchedAt: string
  articles: FeedArticle[]
  breakingNews: string[]
  sectionVideos?: Partial<Record<SectionId, SectionVideo>>
}

export const FEED_DATA_PATH = 'public/data/feed.json'
export const FEED_IMAGES_DIR = 'public/images/feed'
