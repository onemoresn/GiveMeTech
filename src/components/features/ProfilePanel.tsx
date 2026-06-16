import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, Lock, ListMusic, UserCircle, LogOut, Upload, Volume2 } from 'lucide-react'
import { useApp, badgeInfo } from '../../context/AppContext'
import { useSubscriber } from '../../context/SubscriberContext'
import { Button } from '../ui/Button'
import { SubscriberSignIn } from './SubscriberSignIn'
import { SubscriberPlaylist } from './SubscriberPlaylist'
import { ProfileAvatar, avatarColors } from '../ui/ProfileAvatar'
import { AVATAR_PRESET_LABELS, AVATAR_PRESET_MODES, DEFAULT_AVATARS } from '../../data/avatarDefaults'
import { compressAvatarFile } from '../../utils/avatarImage'

interface ProfilePanelProps {
  open: boolean
  onClose: () => void
}

const avatarShapes = ['sphere', 'cube', 'torus'] as const

type ProfileTab = 'avatar' | 'playlist'

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  const { profile, updateProfile } = useApp()
  const { isSubscriber, subscriber, clearSubscription } = useSubscriber()
  const [tab, setTab] = useState<ProfileTab>('avatar')
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-void/80 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-label="User profile"
        >
          <motion.div
            initial={{ scale: 0.9, rotateY: -15 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.9, rotateY: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-panel border-neon-purple/30 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <h2 className="font-display text-lg font-bold holo-gradient">Your Profile</h2>
                {isSubscriber && subscriber && (
                  <p className="text-text-muted text-xs font-mono mt-1 truncate max-w-[240px]">
                    {subscriber.email}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-neon-magenta shrink-0"
                aria-label="Close profile"
              >
                <X size={20} />
              </button>
            </div>

            {!isSubscriber ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-4">
                  <div className="flex items-center gap-2 text-neon-cyan mb-2">
                    <Volume2 size={16} />
                    <span className="font-display text-sm font-bold">Listen free</span>
                  </div>
                  <p className="text-text-muted text-xs mb-4">
                    Build a playlist and play stories with your browser&apos;s built-in voices — no
                    sign-in required.
                  </p>
                  <SubscriberPlaylist embedded />
                </div>

                <div className="rounded-lg border border-neon-purple/20 bg-neon-purple/5 p-4">
                  <div className="flex items-center gap-2 text-neon-purple mb-2">
                    <Lock size={16} />
                    <span className="font-display text-sm font-bold">Subscriber sign-in</span>
                  </div>
                  <p className="text-text-muted text-xs mb-3">
                    Unlock custom avatars, Gemini AI Studio voices, and saved subscriber perks.
                  </p>
                  <SubscriberSignIn compact />
                </div>

                <div className="relative rounded-lg border border-glass-border p-4 opacity-60 pointer-events-none select-none">
                  <p className="text-xs font-mono uppercase text-text-muted mb-3 flex items-center gap-2">
                    <Lock size={12} /> Subscribers only
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-display border-2 border-glass-border text-text-muted"
                    >
                      ●
                    </div>
                    <div>
                      <p className="font-display font-bold text-text-muted">Custom avatar</p>
                      <p className="text-text-muted text-xs">Cartoon presets, upload, colors &amp; shapes</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-1 mb-6 p-1 rounded-lg bg-void-elevated border border-glass-border">
                  <button
                    type="button"
                    onClick={() => setTab('avatar')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-colors ${
                      tab === 'avatar'
                        ? 'bg-neon-purple/20 text-neon-cyan border border-neon-cyan/30'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <UserCircle size={14} /> Avatar &amp; XP
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('playlist')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-colors ${
                      tab === 'playlist'
                        ? 'bg-neon-purple/20 text-neon-cyan border border-neon-cyan/30'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <ListMusic size={14} /> Playlist &amp; TTS
                  </button>
                </div>

                {tab === 'avatar' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-4 mb-6">
                      <ProfileAvatar profile={profile} size="md" />
                      <div className="flex-1 min-w-0">
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
                      <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3 block">
                        Avatar style
                      </label>
                      <div className="flex flex-wrap gap-3 items-center">
                        {AVATAR_PRESET_MODES.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => updateProfile({ avatarMode: preset, avatarUpload: undefined })}
                            className={`rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                              profile.avatarMode === preset
                                ? 'border-neon-cyan ring-2 ring-neon-cyan/40'
                                : 'border-glass-border'
                            }`}
                            aria-label={AVATAR_PRESET_LABELS[preset]}
                          >
                            <img src={DEFAULT_AVATARS[preset]} alt="" className="w-14 h-14 object-cover" />
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => updateProfile({ avatarMode: 'glyph', avatarUpload: undefined })}
                          className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-display transition-transform hover:scale-105 ${
                            profile.avatarMode === 'glyph'
                              ? 'border-neon-purple ring-2 ring-neon-purple/40'
                              : 'border-glass-border'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${profile.avatarColor}40, ${profile.avatarColor}10)`,
                            color: profile.avatarColor,
                          }}
                          aria-label="Neon glyph avatar"
                        >
                          {profile.avatarShape === 'sphere' && '●'}
                          {profile.avatarShape === 'cube' && '■'}
                          {profile.avatarShape === 'torus' && '◉'}
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-14 h-14 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-0.5 text-text-muted hover:text-neon-cyan hover:border-neon-cyan/50 transition-colors ${
                            profile.avatarMode === 'upload' ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-glass-border'
                          }`}
                          aria-label="Upload photo"
                        >
                          <Upload size={18} />
                          <span className="text-[9px] font-mono">Upload</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (!file) return
                            setUploadError('')
                            try {
                              const dataUrl = await compressAvatarFile(file)
                              updateProfile({ avatarMode: 'upload', avatarUpload: dataUrl })
                            } catch (err) {
                              setUploadError(err instanceof Error ? err.message : 'Upload failed')
                            }
                          }}
                        />
                      </div>
                      {uploadError && (
                        <p className="text-neon-magenta text-xs font-mono mt-2">{uploadError}</p>
                      )}
                      <p className="text-text-muted text-[10px] font-mono mt-2">
                        Pick a cartoon avatar, neon glyph, or upload your own photo (stored on this device).
                      </p>
                    </div>

                    {profile.avatarMode === 'glyph' && (
                      <>
                        <div className="mb-6">
                          <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 block">
                            Glyph color
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {avatarColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateProfile({ avatarColor: color })}
                                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                                  profile.avatarColor === color
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-void'
                                    : ''
                                }`}
                                style={{ background: color, boxShadow: `0 0 10px ${color}60` }}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 block">
                            Glyph shape
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
                      </>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={16} className="text-neon-yellow" />
                        <span className="font-display text-sm font-bold text-neon-yellow">
                          Achievements
                        </span>
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
                )}

                {tab === 'playlist' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-text-secondary text-sm mb-4">
                      Pick topics, build your queue, and listen with Gemini TTS voices from Google AI
                      Studio.
                    </p>
                    <SubscriberPlaylist embedded />
                  </motion.div>
                )}

                <div className="mt-6 pt-4 border-t border-glass-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      clearSubscription()
                      setTab('avatar')
                    }}
                    className="flex items-center gap-2 text-text-muted hover:text-neon-magenta text-xs font-mono"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
