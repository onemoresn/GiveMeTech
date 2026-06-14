import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import type { Article } from '../data/articles'
import { articles as staticArticles, breakingNews as staticBreakingNews } from '../data/articles'
import { assetPath } from '../utils/assetPath'

export interface FeedData {
  fetchedAt: string
  articles: Article[]
  breakingNews: string[]
}

interface FeedContextType {
  articles: Article[]
  breakingNews: string[]
  lastUpdated: string | null
  isLive: boolean
  loading: boolean
  error: string | null
  refreshFeed: () => Promise<void>
}

const FeedContext = createContext<FeedContextType | null>(null)

async function loadFeed(): Promise<FeedData | null> {
  const res = await fetch(`${assetPath('data/feed.json')}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = (await res.json()) as FeedData
  return {
    ...data,
    articles: data.articles.map((a) => ({
      ...a,
      image: a.image?.startsWith('http') ? a.image : a.image ? assetPath(a.image) : undefined,
    })),
  }
}

export function FeedProvider({ children }: { children: ReactNode }) {
  const [feedData, setFeedData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshFeed = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loadFeed()
      setFeedData(data)
    } catch {
      setError('Could not load live feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshFeed()
  }, [])

  const isLive = (feedData?.articles.length ?? 0) > 0

  const articles = useMemo(
    () => (isLive ? feedData!.articles : staticArticles),
    [isLive, feedData]
  )

  const breakingNews = useMemo(
    () => (isLive && feedData!.breakingNews.length > 0 ? feedData!.breakingNews : staticBreakingNews),
    [isLive, feedData]
  )

  return (
    <FeedContext.Provider
      value={{
        articles,
        breakingNews,
        lastUpdated: feedData?.fetchedAt ?? null,
        isLive,
        loading,
        error,
        refreshFeed,
      }}
    >
      {children}
    </FeedContext.Provider>
  )
}

export function useFeed() {
  const ctx = useContext(FeedContext)
  if (!ctx) throw new Error('useFeed must be used within FeedProvider')
  return ctx
}

export function useArticlesBySection(section: Article['section']) {
  const { articles } = useFeed()
  return useMemo(() => articles.filter((a) => a.section === section), [articles, section])
}

export function useFeaturedArticles() {
  const { articles } = useFeed()
  return useMemo(() => {
    const featured = articles.filter((a) => a.featured)
    return featured.length > 0 ? featured : articles.slice(0, 6)
  }, [articles])
}

export function useArticle(id: string | null) {
  const { articles } = useFeed()
  return useMemo(() => (id ? articles.find((a) => a.id === id) : undefined), [articles, id])
}
