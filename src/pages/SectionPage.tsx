import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { SectionId } from '../data/sections'
import { getSection } from '../data/sections'
import { useArticlesBySection, useArticle } from '../data/articleHooks'
import { sectionImages, sectionImageAlt } from '../data/sectionImages'
import { SectionHero } from '../components/layout/SectionHero'
import { ArticleCard } from '../components/ui/ArticleCard'
import { CommentBubbles } from '../components/features/CommentBubbles'
import { useApp } from '../context/AppContext'
import { useFeed } from '../context/FeedContext'
import { sectionThemes } from '../styles/tokens'
import { X, ExternalLink } from 'lucide-react'

const cardVariants: Record<SectionId, 'node' | 'encrypted' | 'default' | 'terminal' | 'mission' | 'portal'> = {
  ai: 'node',
  cybersecurity: 'encrypted',
  gadgets: 'default',
  software: 'terminal',
  space: 'mission',
  gaming: 'portal',
}

interface SectionPageProps {
  sectionId: SectionId
}

export function SectionPage({ sectionId }: SectionPageProps) {
  const section = getSection(sectionId)!
  const articles = useArticlesBySection(sectionId)
  const theme = sectionThemes[sectionId]
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('article')
  const selectedArticle = useArticle(selectedId ?? undefined)
  const { addXP } = useApp()
  const { isLive } = useFeed()
  const [xpFlash, setXpFlash] = useState(false)

  const openArticle = (id: string) => {
    setSearchParams({ article: id })
    const article = articles.find((a) => a.id === id)
    if (article) {
      addXP(article.xpReward, id)
      setXpFlash(true)
      setTimeout(() => setXpFlash(false), 2000)
    }
  }

  const closeArticle = () => setSearchParams({})

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 h-[420px] md:h-[480px]">
        <SectionHero image={sectionImages[sectionId]} alt={sectionImageAlt[sectionId]} />
      </div>

      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <span className="text-4xl mb-4 block">{section.icon}</span>
            <p className="font-mono text-sm uppercase tracking-[0.2em] mb-2 text-text-secondary">
              {section.subtitle}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-black mb-4 text-text-primary">
              {section.title}
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl">{section.description}</p>
            {isLive && (
              <p className="text-neon-cyan text-xs font-mono mt-3">
                ● Live stories from RSS — updated daily
              </p>
            )}
          </motion.div>

          {xpFlash && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed top-24 right-6 z-50 glass-panel px-4 py-2 border-neon-green/50 text-neon-green font-mono text-sm"
            >
              +XP acquired!
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant={cardVariants[sectionId]}
                index={i}
                onClick={() => openArticle(article.id)}
              />
            ))}
          </div>
        </div>

        <CommentBubbles />
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-void/85 backdrop-blur-xl"
            onClick={closeArticle}
            role="dialog"
            aria-label={`Article: ${selectedArticle.title}`}
          >
            <motion.article
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-panel overflow-hidden max-h-[85vh] flex flex-col border-glass-border"
              style={{ borderColor: `${theme.primary}40` }}
            >
              {(selectedArticle.image ?? sectionImages[selectedArticle.section]) && (
                <div className="relative h-48 shrink-0">
                  <img
                    src={selectedArticle.image ?? sectionImages[selectedArticle.section]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
                </div>
              )}

              <div className="p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-mono text-xs text-text-muted mb-2">
                      {selectedArticle.date} · {selectedArticle.readTime} · +{selectedArticle.xpReward} XP
                      {selectedArticle.source && ` · ${selectedArticle.source}`}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-text-primary">
                      {selectedArticle.title}
                    </h2>
                    <p className="text-text-muted text-sm mt-1">By {selectedArticle.author}</p>
                  </div>
                  <button onClick={closeArticle} className="text-text-muted hover:text-neon-magenta p-1 shrink-0" aria-label="Close article">
                    <X size={20} />
                  </button>
                </div>

                <p className="text-text-secondary text-lg leading-relaxed mb-6">{selectedArticle.excerpt}</p>

                {selectedArticle.isLive && selectedArticle.url ? (
                  <div className="space-y-4">
                    <p className="text-text-secondary text-sm">
                      This story is sourced from {selectedArticle.source}. Read the full report for complete coverage.
                    </p>
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-mono text-sm hover:bg-neon-cyan/20 transition-colors"
                    >
                      Read full story on {selectedArticle.source}
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ) : (
                  <p className="text-text-secondary leading-relaxed">
                    Stay tuned to GiveMeTech for continued coverage of this story and its impact on the tech ecosystem.
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-glass-border">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-glass text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
