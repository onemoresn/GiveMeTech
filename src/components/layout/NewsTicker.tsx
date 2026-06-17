import { useBreakingNews } from '../../data/articleHooks'
import { useFeed } from '../../context/FeedContext'

export function NewsTicker() {
  const breakingNews = useBreakingNews()
  const { isLive, usingFallback } = useFeed()
  const items = [...breakingNews, ...breakingNews]

  return (
    <div
      className="relative z-40 w-full overflow-hidden border-b border-neon-cyan/20 bg-void-light/80 backdrop-blur-md"
      role="marquee"
      aria-label="Breaking tech news ticker"
    >
      <div className="flex items-center">
        <div
          className={`flex-shrink-0 px-4 py-2 border-r ${
            usingFallback
              ? 'bg-neon-orange/15 border-neon-orange/30'
              : 'bg-neon-magenta/20 border-neon-magenta/30'
          }`}
        >
          <span
            className={`font-display text-xs font-bold uppercase tracking-widest ${
              usingFallback ? 'text-neon-orange' : 'text-neon-magenta animate-pulse'
            }`}
          >
            {usingFallback ? 'Demo' : isLive ? 'Live' : '…'}
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex animate-[ticker-scroll_40s_linear_infinite] whitespace-nowrap">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center px-8 py-2 text-sm text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan mr-3 animate-pulse" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
