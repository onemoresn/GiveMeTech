import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useSubscriber } from '../../context/SubscriberContext'
import { SubscriberPerks } from './SubscriberPerks'
import { SubscriberPlaylist } from './SubscriberPlaylist'

const SERVICE_ID      = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
const TEMPLATE_NOTIFY = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
const TEMPLATE_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMATION_ID as string
const PUBLIC_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string
const OWNER_EMAIL     = (import.meta.env.VITE_NEWSLETTER_OWNER_EMAIL as string) ?? 'sm@nfinitdevelopment.com'

const emailjsReady = Boolean(SERVICE_ID && TEMPLATE_NOTIFY && PUBLIC_KEY)

async function sendEmails(subscriberEmail: string): Promise<void> {
  const { default: emailjs } = await import('@emailjs/browser')

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_NOTIFY,
    {
      subscriber_email: subscriberEmail,
      to_email: OWNER_EMAIL,
      reply_to: subscriberEmail,
    },
    { publicKey: PUBLIC_KEY },
  )

  if (TEMPLATE_CONFIRM) {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_CONFIRM,
        {
          subscriber_email: subscriberEmail,
          to_email: subscriberEmail,
          reply_to: OWNER_EMAIL,
        },
        { publicKey: PUBLIC_KEY },
      )
    } catch {
      // confirmation email failure is non-critical
    }
  }
}

type State = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterSignup() {
  const { isSubscriber, activateSubscription, subscriber } = useSubscriber()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const showSuccess = state === 'success' || isSubscriber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setState('loading')
    setErrorMsg('')

    try {
      if (emailjsReady) {
        await sendEmails(email)
      } else {
        const subject = encodeURIComponent('GiveMeTech Newsletter Subscription')
        const body = encodeURIComponent(`Please add me to the GiveMeTech weekly signal.\n\nSubscriber: ${email}`)
        window.open(`mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`, '_blank')
      }
      activateSubscription(email)
      setState('success')
    } catch (err) {
      console.error('Newsletter signup error:', err)
      setErrorMsg('Something went wrong. Please try again.')
      setState('error')
    }
  }

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16" aria-label="Newsletter signup">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-magenta/5 pointer-events-none" />

        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <CheckCircle2 className="mx-auto text-neon-green" size={44} />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-neon-green">
              You're in the Signal.
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              {state === 'success' ? (
                <>
                  A confirmation has been sent to{' '}
                  <span className="text-text-primary font-mono">{email}</span>. Your subscriber
                  perks are unlocked below.
                </>
              ) : (
                <>
                  Welcome back,{' '}
                  <span className="text-text-primary font-mono">{subscriber?.email ?? email}</span>.
                  Manage your playlist and listening preferences below.
                </>
              )}
            </p>
            <ul className="max-w-sm mx-auto text-left space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-neon-cyan mt-0.5 shrink-0">●</span>
                <span>
                  <strong className="text-text-primary">Weekly digest every Monday</strong> —
                  top stories across your chosen topics.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-cyan mt-0.5 shrink-0">●</span>
                <span>
                  <strong className="text-text-primary">Topic playlists</strong> — curate what you
                  want to read or hear.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-neon-cyan mt-0.5 shrink-0">●</span>
                <span>
                  <strong className="text-text-primary">Text-to-speech</strong> with multiple voice
                  options for hands-free listening.
                </span>
              </li>
            </ul>
            <SubscriberPlaylist />
          </motion.div>
        ) : (
          <>
            <Zap className="mx-auto mb-4 text-neon-cyan" size={32} />
            <h2 className="font-display text-2xl md:text-3xl font-bold holo-gradient mb-3">
              Join the Signal
            </h2>
            <p className="text-text-secondary max-w-md mx-auto mb-2">
              Get weekly tech intelligence delivered to your inbox. No noise, just the future.
            </p>
            <p className="text-text-muted text-xs font-mono max-w-lg mx-auto mb-6">
              Everyone can listen with free browser TTS below. Subscribe for Gemini voices, playlists
              saved to your account, and custom avatars.
            </p>

            <SubscriberPerks />

            <SubscriberPlaylist />

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={state === 'loading'}
                className="flex-1 px-4 py-3 rounded-lg bg-void-elevated border border-glass-border text-text-primary font-mono text-sm outline-none focus:border-neon-cyan transition-colors disabled:opacity-50"
                aria-label="Email address"
              />
              <Button type="submit" glow disabled={state === 'loading'}>
                {state === 'loading' ? (
                  <span className="font-mono text-xs animate-pulse">Sending…</span>
                ) : (
                  <><Send size={16} />Subscribe</>
                )}
              </Button>
            </form>

            {state === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-neon-magenta text-xs font-mono mt-4"
              >
                <AlertCircle size={14} /> {errorMsg}
              </motion.p>
            )}
          </>
        )}
      </motion.div>
    </section>
  )
}
