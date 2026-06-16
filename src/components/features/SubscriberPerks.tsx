import { ListMusic, Mic, Headphones } from 'lucide-react'

const perks = [
  {
    icon: ListMusic,
    title: 'Topic playlists',
    description: 'Pick AI, gaming, space, and more — build your own listening queue.',
    accent: 'text-neon-cyan',
    border: 'border-neon-cyan/25',
    bg: 'bg-neon-cyan/5',
  },
  {
    icon: Mic,
    title: 'Listen with TTS',
    description: 'Play your playlist hands-free with built-in text-to-speech.',
    accent: 'text-neon-magenta',
    border: 'border-neon-magenta/25',
    bg: 'bg-neon-magenta/5',
  },
  {
    icon: Headphones,
    title: 'Google Neural2 TTS',
    description: 'Listen with Orion, Lyra, Vector, or Pulse — ~1M chars/month free tier.',
    accent: 'text-neon-purple',
    border: 'border-neon-purple/25',
    bg: 'bg-neon-purple/5',
  },
]

export function SubscriberPerks() {
  return (
    <div className="mt-8 pt-8 border-t border-glass-border">
      <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4">
        Subscriber perks
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {perks.map((perk) => (
          <div
            key={perk.title}
            className={`rounded-lg border p-4 ${perk.border} ${perk.bg}`}
          >
            <perk.icon className={`${perk.accent} mb-2`} size={20} />
            <p className="font-display text-sm font-bold text-text-primary mb-1">
              {perk.title}
            </p>
            <p className="text-text-secondary text-xs leading-relaxed">
              {perk.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
