import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Square,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { useSubscriber } from '../../context/SubscriberContext'
import { useFeed } from '../../context/FeedContext'
import { sections } from '../../data/sections'
import { useTtsPlayer } from '../../hooks/useTtsPlayer'
import { Button } from '../ui/Button'

interface SubscriberPlaylistProps {
  /** Compact layout for profile panel */
  embedded?: boolean
}

export function SubscriberPlaylist({ embedded = false }: SubscriberPlaylistProps) {
  const {
    subscriber,
    toggleTopic,
    addToPlaylist,
    removeFromPlaylist,
    movePlaylistItem,
    setPlaylist,
    setVoicePresetId,
    clearSubscription,
  } = useSubscriber()
  const { articles } = useFeed()

  const voicePresetId = subscriber?.voicePresetId ?? 'orion'
  const {
    playing,
    currentIndex,
    playQueue,
    stop,
    presets,
    voicesReady,
    useGoogle,
    ttsError,
    ttsUsage,
    ttsRemaining,
    ttsLimit,
  } = useTtsPlayer(voicePresetId)

  const selectedTopics = subscriber?.topics ?? []
  const playlistIds = subscriber?.playlist ?? []

  const pool = useMemo(
    () =>
      articles.filter(
        (a) => selectedTopics.includes(a.section) && !playlistIds.includes(a.id),
      ),
    [articles, selectedTopics, playlistIds],
  )

  const queue = useMemo(
    () =>
      playlistIds
        .map((id) => articles.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a)),
    [playlistIds, articles],
  )

  const fillFromTopics = () => {
    const ids = articles
      .filter((a) => selectedTopics.includes(a.section))
      .slice(0, 12)
      .map((a) => a.id)
    setPlaylist(ids)
  }

  if (!subscriber) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: embedded ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        embedded
          ? 'text-left'
          : 'mt-8 pt-8 border-t border-glass-border text-left'
      }
    >
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles size={18} className="text-neon-cyan" />
              Your Signal Playlist
            </h3>
            <p className="text-text-muted text-xs font-mono mt-1">
              {subscriber.email} · build a queue, pick a voice, press play
            </p>
          </div>
          <button
            type="button"
            onClick={clearSubscription}
            className="text-text-muted hover:text-neon-magenta text-xs font-mono"
          >
            Sign out of perks
          </button>
        </div>
      )}

      {/* Topics */}
      <div className={embedded ? 'mb-4' : 'mb-6'}>
        <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3">
          Topics
        </p>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => {
            const active = selectedTopics.includes(section.id)
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleTopic(section.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
                  active
                    ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                    : 'border-glass-border text-text-muted hover:border-text-muted'
                }`}
              >
                {section.icon} {section.subtitle}
              </button>
            )
          })}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${embedded ? '' : 'lg:grid-cols-2'} gap-4`}>
        {/* Available stories */}
        <div className="glass-panel p-4 border-glass-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Add to playlist
            </p>
            <button
              type="button"
              onClick={fillFromTopics}
              className="text-neon-cyan text-xs font-mono hover:underline"
            >
              Auto-fill from topics
            </button>
          </div>
          <ul className={`space-y-2 overflow-y-auto pr-1 ${embedded ? 'max-h-40' : 'max-h-64'}`}>
            {pool.length === 0 ? (
              <li className="text-text-muted text-sm py-4 text-center">
                No stories left — change topics or clear your queue.
              </li>
            ) : (
              pool.slice(0, 20).map((article) => (
                <li
                  key={article.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-glass/50 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary line-clamp-2 leading-snug">
                      {article.title}
                    </p>
                    <p className="text-[10px] font-mono text-text-muted mt-0.5">
                      {article.source ?? article.section}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToPlaylist(article.id)}
                    className="shrink-0 p-1.5 rounded-md text-neon-cyan opacity-70 group-hover:opacity-100 hover:bg-neon-cyan/10"
                    aria-label="Add to playlist"
                  >
                    <Plus size={16} />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Queue + player */}
        <div className="glass-panel p-4 border-neon-purple/20">
          <p className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3">
            Your queue ({queue.length})
          </p>

          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] font-mono uppercase text-text-muted block mb-1">
                <Volume2 size={12} className="inline mr-1" />
                Voice {useGoogle ? '(Google Neural2)' : '(browser)'}
              </label>
              <select
                value={voicePresetId}
                onChange={(e) => setVoicePresetId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-void-elevated border border-glass-border text-text-primary text-sm font-mono outline-none focus:border-neon-purple"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — {p.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {playing ? (
                <Button variant="secondary" size="sm" onClick={stop}>
                  <Square size={14} /> Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  glow
                  disabled={!queue.length || !voicesReady}
                  onClick={() => playQueue(queue)}
                >
                  <Play size={14} /> Play all
                </Button>
              )}
            </div>
          </div>

          {!voicesReady && (
            <p className="text-text-muted text-xs font-mono mb-3">
              Loading voices…
            </p>
          )}

          {useGoogle && (
            <p className="text-text-muted text-[10px] font-mono mb-3">
              TTS this month: {(ttsUsage / 1000).toFixed(1)}k / {(ttsLimit / 1000).toFixed(0)}k chars
              · {(ttsRemaining / 1000).toFixed(0)}k remaining
            </p>
          )}

          {ttsError && (
            <p className="text-neon-magenta text-xs font-mono mb-3">{ttsError}</p>
          )}

          <ul className={`space-y-2 overflow-y-auto ${embedded ? 'max-h-36' : 'max-h-52'}`}>
            {queue.length === 0 ? (
              <li className="text-text-muted text-sm py-6 text-center border border-dashed border-glass-border rounded-lg">
                Your playlist is empty. Add stories from the left.
              </li>
            ) : (
              queue.map((article, i) => (
                <li
                  key={article.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    playing && currentIndex === i
                      ? 'border-neon-cyan/40 bg-neon-cyan/5'
                      : 'border-transparent hover:bg-glass/40'
                  }`}
                >
                  <span className="text-neon-cyan font-mono text-xs w-5 shrink-0">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-text-primary line-clamp-2 min-w-0">
                    {article.title}
                  </p>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => movePlaylistItem(i, i - 1)}
                      className="p-1 text-text-muted hover:text-neon-cyan disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={i === queue.length - 1}
                      onClick={() => movePlaylistItem(i, i + 1)}
                      className="p-1 text-text-muted hover:text-neon-cyan disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromPlaylist(article.id)}
                      className="p-1 text-text-muted hover:text-neon-magenta"
                      aria-label="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
