import type { SectionId } from './sections'
import { useFeed } from '../context/FeedContext'

export type { Article } from './articles'
export { articles, breakingNews } from './articles'

export function useArticlesBySection(section: SectionId) {
  const { articles } = useFeed()
  return articles.filter((a) => a.section === section)
}

export function useFeaturedArticles() {
  const { articles } = useFeed()
  const featured = articles.filter((a) => a.featured)
  return featured.length > 0 ? featured : articles.slice(0, 6)
}

export function useArticle(id: string | undefined) {
  const { articles } = useFeed()
  return id ? articles.find((a) => a.id === id) : undefined
}

export function useBreakingNews() {
  const { breakingNews } = useFeed()
  return breakingNews
}
