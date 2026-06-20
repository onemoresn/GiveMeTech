import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// three.js is heavy — load the 3D hero as a separate chunk so page text paints first.
const GlobeScene = lazy(() =>
  import('../components/3d/GlobeScene').then((m) => ({ default: m.GlobeScene })),
)
import { useFeaturedArticles } from '../data/articleHooks'
import { useFeed } from '../context/FeedContext'
import { sections } from '../data/sections'
import { sectionImages, sectionImageAlt } from '../data/sectionImages'
import { ArticleCard } from '../components/ui/ArticleCard'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const featured = useFeaturedArticles()
  const { isLive, lastUpdated, usingFallback, refreshFeed } = useFeed()

  const formatFeedTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  return (
    <div className="relative">
      {/* Hero with 3D Globe */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
        <Suspense fallback={null}>
          <GlobeScene
            articles={featured}
            onHotspotClick={(article) => {
              window.location.href = `/${article.section}?article=${article.id}`
            }}
          />
        </Suspense>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-neon-cyan text-sm uppercase tracking-[0.3em] mb-4 animate-[hologram-flicker_4s_infinite]">
              // initializing future.tech
            </p>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="holo-gradient">GIVE ME</span>
              <br />
              <span className="text-text-primary">TECH</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
              Professional tech news and analysis — AI, security, gadgets, and the stories shaping the industry.
            </p>
            {usingFallback && (
              <p className="text-neon-orange/90 text-xs font-mono mb-4 max-w-xl mx-auto">
                Showing demo stories — live feed unavailable. Check your connection or{' '}
                <button
                  type="button"
                  onClick={() => refreshFeed()}
                  className="text-neon-cyan hover:underline"
                >
                  retry
                </button>
                .
              </p>
            )}
            {isLive && lastUpdated && (
              <p className="text-neon-cyan/80 text-xs font-mono mb-8">
                Live feed updated {formatFeedTime(lastUpdated)} · refreshes every 15 min
              </p>
            )}
            {!isLive && !usingFallback && <div className="mb-8" />}
            {usingFallback && <div className="mb-4" />}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/ai">
                <Button size="lg" glow>
                  Enter the Matrix
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Button variant="secondary" size="lg" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                Explore Sections
              </Button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 text-text-muted text-xs font-mono"
          >
            Hover hotspots on the globe to preview trending articles
          </motion.p>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-neon-cyan/50 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-neon-cyan animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Section Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold holo-gradient mb-4">
            Explore Dimensions
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Each section covers in-depth reporting with professional insights and expert analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={section.path} className="block group">
                  <div className="glass-panel overflow-hidden h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={sectionImages[section.id]}
                        alt={sectionImageAlt[section.id]}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                    </div>
                    <div className="p-6">
                    <span className="text-2xl mb-3 block">{section.icon}</span>
                    <h3 className="font-display text-lg font-bold mb-1 text-text-primary">
                      {section.title}
                    </h3>
                    <p className="font-mono text-xs uppercase tracking-wider mb-3 text-text-secondary">
                      {section.subtitle}
                    </p>
                    <p className="text-text-secondary text-sm leading-relaxed">{section.description}</p>
                    <span className="inline-flex items-center gap-1 mt-4 text-xs font-mono text-neon-cyan group-hover:gap-2 transition-all">
                      Read more <ArrowRight size={12} />
                    </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-8 text-center">
          Trending <span className="neon-text-cyan">Transmissions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.slice(0, 6).map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={i}
              onClick={() => { window.location.href = `/${article.section}?article=${article.id}` }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
