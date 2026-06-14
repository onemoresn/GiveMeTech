import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Zap } from 'lucide-react'
import { Button } from '../ui/Button'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16" aria-label="Newsletter signup">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-8 md:p-12 text-center relative overflow-hidden"
        style={{ animation: submitted ? undefined : 'energy-pulse 3s infinite' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-magenta/5 pointer-events-none" />

        <Zap className="mx-auto mb-4 text-neon-cyan" size={32} />
        <h2 className="font-display text-2xl md:text-3xl font-bold holo-gradient mb-3">
          Join the Signal
        </h2>
        <p className="text-text-secondary max-w-md mx-auto mb-8">
          Get weekly tech intelligence delivered to your inbox. No noise, just the future.
        </p>

        {submitted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-neon-green font-display text-lg font-bold"
          >
            ✓ Signal acquired. Welcome to the network.
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-void-elevated border border-glass-border text-text-primary font-mono text-sm outline-none focus:border-neon-cyan transition-colors"
              aria-label="Email address"
            />
            <Button type="submit" glow>
              <Send size={16} />
              Subscribe
            </Button>
          </form>
        )}
      </motion.div>
    </section>
  )
}
