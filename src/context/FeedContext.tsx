import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Article } from '../data/articles'
import type { SectionId } from '../data/sections'
import { articles as staticArticles, breakingNews as staticBreakingNews } from '../data/articles'
import { assetPath } from '../utils/assetPath'

export interface SectionVideo {
  url: string
  poster: string
}

export interface FeedData {
  fetchedAt: string
  articles: Article[]
  breakingNews: string[]
  sectionVideos?: Partial<Record<SectionId, SectionVideo>>
}

interface FeedContextType {
  articles: Article[]
  breakingNews: string[]
  sectionVideos: Partial<Record<SectionId, SectionVideo>>
  lastUpdated: string | null
  isLive: boolean
  /** True when live feed.json could not be loaded — showing bundled demo articles */
  usingFallback: boolean
  loading: boolean
  error: string | null
  refreshFeed: (options?: { silent?: boolean }) => Promise<void>
}

const FeedContext = createContext<FeedContextType | null>(null)

/** Poll for newer feed.json while the tab is open (matches hourly CI cadence). */
const FEED_REFRESH_MS = 15 * 60 * 1000

function normalizeAssetUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  return assetPath(url.replace(/^\//, ''))
}

async function loadFeed(): Promise<FeedData | null> {
  const res = await fetch(`${assetPath('data/feed.json')}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = (await res.json()) as FeedData

  const sectionVideos: Partial<Record<SectionId, SectionVideo>> = {}
  if (data.sectionVideos) {
    for (const [key, value] of Object.entries(data.sectionVideos)) {
      if (value) {
        sectionVideos[key as SectionId] = {
          url: value.url,
          poster: normalizeAssetUrl(value.poster) ?? value.poster,
        }
      }
    }
  }

  return {
    ...data,
    sectionVideos,
    articles: data.articles.map((a) => ({
      ...a,
      image: normalizeAssetUrl(a.image),
      video: a.video,
      videoPoster: normalizeAssetUrl(a.videoPoster),
    })),
  }
}

export function FeedProvider({ children }: { children: ReactNode }) {
  const [feedData, setFeedData] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const feedDataRef = useRef<FeedData | null>(null)

  useEffect(() => {
    feedDataRef.current = feedData
  }, [feedData])

  const refreshFeed = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent && feedDataRef.current !== null
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const data = await loadFeed()
      if (data?.articles?.length) {
        setFeedData(data)
        setError(null)
      } else if (!silent) {
        setFeedData(null)
        setError('Could not load live feed')
      }
    } catch {
      if (!silent) {
        setFeedData(null)
        setError('Could not load live feed')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshFeed()
  }, [refreshFeed])

  useEffect(() => {
    const onFocus = () => refreshFeed({ silent: true })
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    const interval = window.setInterval(() => refreshFeed({ silent: true }), FEED_REFRESH_MS)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(interval)
    }
  }, [refreshFeed])

  const isLive = (feedData?.articles.length ?? 0) > 0
  const usingFallback = !loading && !isLive

  const articles = useMemo(
    () => (isLive ? feedData!.articles : staticArticles),
    [isLive, feedData],
  )

  const breakingNews = useMemo(
    () => (isLive && feedData!.breakingNews.length > 0 ? feedData!.breakingNews : staticBreakingNews),
    [isLive, feedData],
  )

  const sectionVideos = useMemo(() => feedData?.sectionVideos ?? {}, [feedData])

  return (
    <FeedContext.Provider
      value={{
        articles,
        breakingNews,
        sectionVideos,
        lastUpdated: feedData?.fetchedAt ?? null,
        isLive,
        usingFallback,
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

export function useSectionVideo(sectionId: SectionId): SectionVideo | undefined {
  const { sectionVideos } = useFeed()
  return sectionVideos[sectionId]
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
