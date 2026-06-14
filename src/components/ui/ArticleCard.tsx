import { motion } from 'framer-motion'
import type { Article } from '../../data/articles'
import { sectionImages } from '../../data/sectionImages'
import { Badge } from './Badge'
import { ExternalLink } from 'lucide-react'

type CardVariant = 'node' | 'encrypted' | 'terminal' | 'mission' | 'portal' | 'default'

interface ArticleCardProps {
  article: Article
  variant?: CardVariant
  index?: number
  onClick?: () => void
}

export function ArticleCard({ article, variant = 'default', index = 0, onClick }: ArticleCardProps) {
  const imageSrc = article.image ?? sectionImages[article.section]

  const variantStyles: Record<CardVariant, string> = {
    node: 'border-neon-purple/30 hover:border-neon-purple',
    encrypted: 'font-mono border-neon-green/30 hover:border-neon-green',
    terminal: 'font-mono border-neon-cyan/30 hover:border-neon-cyan rounded-none',
    mission: 'border-holo-blue/30 hover:border-holo-blue',
    portal: 'border-neon-magenta/30 hover:border-neon-magenta',
    default: 'border-glass-border hover:border-neon-cyan/50',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`
        glass-panel group relative cursor-pointer overflow-hidden transition-all duration-300
        ${variantStyles[variant]}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`Read article: ${article.title}`}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={imageSrc}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        {article.isLive && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">
            Live
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {article.featured && <Badge label="Featured" variant="magenta" pulse />}
          <Badge label={`+${article.xpReward} XP`} variant="green" />
        </div>

        <h3 className="font-display text-lg font-bold mb-2 text-text-primary line-clamp-2 group-hover:text-neon-cyan transition-colors">
          {variant === 'encrypted' ? (
            <span className="group-hover:blur-0 blur-[1px] transition-all duration-500">
              {article.title}
            </span>
          ) : (
            article.title
          )}
        </h3>

        <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-2">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-text-muted font-mono">
          <span>{article.source ?? article.author}</span>
          <span>{article.readTime}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-glass text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function ArticleCardLink({ article }: { article: Article }) {
  if (article.url) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-mono text-neon-cyan hover:underline"
      >
        Read full story <ExternalLink size={14} />
      </a>
    )
  }
  return null
}
