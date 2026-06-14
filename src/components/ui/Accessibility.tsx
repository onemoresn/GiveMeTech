import { motion } from 'framer-motion'
import { Contrast, EyeOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export function HighContrastToggle() {
  const { highContrast, toggleHighContrast } = useApp()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleHighContrast}
      className="p-2 rounded-lg glass-panel border-glass-border text-text-secondary hover:text-neon-cyan transition-colors"
      aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      title="Toggle high contrast"
    >
      {highContrast ? <EyeOff size={18} /> : <Contrast size={18} />}
      <span className="sr-only">High contrast toggle</span>
    </motion.button>
  )
}

export function XPBar() {
  const { profile } = useApp()
  const progress = (profile.xp / 200) * 100

  return (
    <div className="flex items-center gap-2" aria-label={`Level ${profile.level}, ${profile.xp} XP`}>
      <span className="font-display text-xs text-neon-cyan font-bold">LV.{profile.level}</span>
      <div className="w-20 h-1.5 rounded-full bg-void-elevated overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
