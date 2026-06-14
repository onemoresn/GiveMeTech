import { motion, AnimatePresence } from 'framer-motion'
import { X, Award } from 'lucide-react'
import { useApp, badgeInfo } from '../../context/AppContext'
import { Button } from '../ui/Button'

interface ProfilePanelProps {
  open: boolean
  onClose: () => void
}

const avatarColors = ['#00f0ff', '#ff00aa', '#8b5cf6', '#00ff88', '#ff6b00', '#ffd700']
const avatarShapes = ['sphere', 'cube', 'torus'] as const

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const { profile, updateProfile } = useApp()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-void/80 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-label="User profile"
        >
          <motion.div
            initial={{ scale: 0.9, rotateY: -15 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.9, rotateY: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-panel border-neon-purple/30 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg font-bold holo-gradient">Your Profile</h2>
              <button onClick={onClose} className="text-text-muted hover:text-neon-magenta" aria-label="Close profile">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-display font-bold"
                style={{
                  background: `linear-gradient(135deg, ${profile.avatarColor}40, ${profile.avatarColor}10)`,
                  border: `2px solid ${profile.avatarColor}`,
                  boxShadow: `0 0 20px ${profile.avatarColor}40`,
                }}
              >
                {profile.avatarShape === 'sphere' && '●'}
                {profile.avatarShape === 'cube' && '■'}
                {profile.avatarShape === 'torus' && '◉'}
              </div>
              <div>
                <input
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="bg-transparent border-b border-glass-border font-display text-lg font-bold text-text-primary outline-none focus:border-neon-cyan w-full"
                  aria-label="Display name"
                />
                <p className="text-text-muted text-sm font-mono mt-1">
                  Level {profile.level} · {profile.xp}/200 XP
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 block">
                Avatar Color
              </label>
              <div className="flex gap-2">
                {avatarColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateProfile({ avatarColor: color })}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${profile.avatarColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-void' : ''}`}
                    style={{ background: color, boxShadow: `0 0 10px ${color}60` }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 block">
                Avatar Shape
              </label>
              <div className="flex gap-2">
                {avatarShapes.map((shape) => (
                  <Button
                    key={shape}
                    variant={profile.avatarShape === shape ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => updateProfile({ avatarShape: shape })}
                  >
                    {shape}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-neon-yellow" />
                <span className="font-display text-sm font-bold text-neon-yellow">Achievements</span>
              </div>
              {profile.badges.length === 0 ? (
                <p className="text-text-muted text-sm">Read articles to earn badges!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => {
                    const info = badgeInfo[badge]
                    return (
                      <div
                        key={badge}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-yellow/10 border border-neon-yellow/30 text-xs"
                        title={info?.label}
                      >
                        <span>{info?.icon}</span>
                        <span className="text-neon-yellow font-mono">{info?.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
