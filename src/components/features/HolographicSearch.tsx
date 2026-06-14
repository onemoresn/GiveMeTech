import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFeed } from '../../context/FeedContext'
import { useApp } from '../../context/AppContext'

interface HolographicSearchProps {
  open: boolean
  onClose: () => void
}

export function HolographicSearch({ open, onClose }: HolographicSearchProps) {
  const [query, setQuery] = useState('')
  const [displayText, setDisplayText] = useState('')
  const navigate = useNavigate()
  const { setSearchQuery } = useApp()

  const { articles } = useFeed()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [query, articles])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setDisplayText('')
      return
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    let i = 0
    setDisplayText('')
    const interval = setInterval(() => {
      if (i <= query.length) {
        setDisplayText(query.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [query])

  const handleSelect = (articleId: string, section: string) => {
    setSearchQuery(query)
    navigate(`/${section}?article=${articleId}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-void/80 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-label="Search articles"
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-panel border-neon-cyan/30 p-6 scanline relative"
            style={{ animation: 'hologram-flicker 4s infinite' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="text-neon-cyan" size={24} />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the tech matrix..."
                  className="w-full bg-transparent border-none outline-none font-mono text-lg text-neon-cyan placeholder:text-text-muted"
                  autoFocus
                  aria-label="Search query"
                />
                <span className="absolute right-0 top-0 font-mono text-lg text-neon-cyan/50 pointer-events-none animate-[type-cursor_1s_infinite] border-r-2 border-neon-cyan h-full" />
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-neon-magenta" aria-label="Close search">
                <X size={20} />
              </button>
            </div>

            {displayText && (
              <p className="text-xs font-mono text-neon-cyan/40 mb-4">
                {'>'} scanning: {displayText}
                <span className="animate-pulse">_</span>
              </p>
            )}

            <div className="max-h-80 overflow-y-auto space-y-2">
              {results.length === 0 && query && (
                <p className="text-text-muted text-sm font-mono text-center py-8">No signals found in the matrix...</p>
              )}
              {results.map((article, i) => (
                <motion.button
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelect(article.id, article.section)}
                  className="w-full text-left p-3 rounded-lg hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30 transition-all group"
                >
                  <span className="font-display text-sm text-text-primary group-hover:text-neon-cyan transition-colors">
                    {article.title}
                  </span>
                  <span className="block text-xs text-text-muted mt-1">{article.excerpt}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
