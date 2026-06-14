import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useVideoArticles } from '../../context/FeedContext'
import { sections } from '../../data/sections'
import type { Article } from '../../data/articles'

export function FeaturedVideos() {
  const videoArticles = useVideoArticles().slice(0, 4)

  if (videoArticles.length === 0) return null

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-2">
          Video <span className="text-neon-purple">Spotlight</span>
        </h2>
        <p className="text-text-secondary text-sm">
          Topic-matched previews from today&apos;s top stories — hover cards with video badges to watch.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {videoArticles.map((article: Article, i: number) => {
          const section = sections.find((s) => s.id === article.section)
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/${article.section}?article=${article.id}`}
                className="block glass-panel overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative h-36 bg-void-elevated">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={article.videoPoster ?? article.image}
                    className="w-full h-full object-cover"
                  >
                    <source src={article.video} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                    <Play size={10} fill="currentColor" />
                    {section?.icon} {section?.title.split(' ')[0]}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display text-sm font-bold text-text-primary line-clamp-2 group-hover:text-neon-cyan transition-colors">
                    {article.title}
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
