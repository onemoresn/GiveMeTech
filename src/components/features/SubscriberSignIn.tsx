import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useSubscriber } from '../../context/SubscriberContext'

interface SubscriberSignInProps {
  compact?: boolean
  onSuccess?: () => void
}

export function SubscriberSignIn({ compact, onSuccess }: SubscriberSignInProps) {
  const { activateSubscription } = useSubscriber()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      activateSubscription(trimmed)
      onSuccess?.()
    } catch {
      setError('Could not sign in. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? '' : 'text-center'}>
      {!compact && (
        <p className="text-text-secondary text-sm mb-4 max-w-sm mx-auto">
          Sign in with your subscriber email to unlock avatar customization, playlists, and
          text-to-speech.
        </p>
      )}
      {compact && (
        <p className="text-text-secondary text-sm mb-3">
          Sign in with your subscriber email to unlock your profile, playlist, and listen-aloud
          voices.
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col sm:flex-row gap-2 ${compact ? '' : 'max-w-md mx-auto'}`}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="subscriber@email.com"
          required
          disabled={loading}
          className="flex-1 px-3 py-2.5 rounded-lg bg-void-elevated border border-glass-border text-text-primary font-mono text-sm outline-none focus:border-neon-cyan disabled:opacity-50"
          aria-label="Subscriber email"
        />
        <Button type="submit" glow disabled={loading} className="shrink-0">
          {loading ? (
            <span className="font-mono text-xs animate-pulse">Signing in…</span>
          ) : (
            <><LogIn size={16} /> Sign in</>
          )}
        </Button>
      </form>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-neon-magenta text-xs font-mono mt-3 justify-center"
        >
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}
      {compact && (
        <p className="text-text-muted text-[10px] font-mono mt-3">
          Use the same email you used to join the Signal newsletter.
        </p>
      )}
    </div>
  )
}
