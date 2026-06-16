import { DEFAULT_AVATARS } from '../../data/avatarDefaults'
import type { UserProfile } from '../../context/AppContext'

const avatarColors = ['#00f0ff', '#ff00aa', '#8b5cf6', '#00ff88', '#ff6b00', '#ffd700']

interface ProfileAvatarProps {
  profile: UserProfile
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm rounded-lg',
  md: 'w-16 h-16 text-2xl rounded-xl',
  lg: 'w-20 h-20 text-3xl rounded-xl',
}

export function ProfileAvatar({ profile, size = 'md', className = '' }: ProfileAvatarProps) {
  const dim = sizeClasses[size]
  const mode = profile.avatarMode ?? 'glyph'

  if (mode === 'upload' && profile.avatarUpload) {
    return (
      <img
        src={profile.avatarUpload}
        alt=""
        className={`${dim} object-cover border-2 border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] ${className}`}
      />
    )
  }

  if (mode === 'male' || mode === 'female') {
    const src = mode === 'male' ? DEFAULT_AVATARS.male : DEFAULT_AVATARS.female
    return (
      <img
        src={src}
        alt=""
        className={`${dim} object-cover border-2 border-neon-purple/40 shadow-[0_0_20px_rgba(139,92,246,0.3)] ${className}`}
      />
    )
  }

  return (
    <div
      className={`${dim} flex items-center justify-center font-display font-bold ${className}`}
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
  )
}

export function GlyphAvatarPreview({
  color,
  shape,
  selected,
  onClick,
}: {
  color: string
  shape: UserProfile['avatarShape']
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-display transition-transform hover:scale-105 ${
        selected ? 'ring-2 ring-white ring-offset-2 ring-offset-void' : ''
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}40, ${color}10)`,
        border: `2px solid ${color}`,
      }}
      aria-label={`Glyph avatar ${shape}`}
    >
      {shape === 'sphere' && '●'}
      {shape === 'cube' && '■'}
      {shape === 'torus' && '◉'}
    </button>
  )
}

export { avatarColors }
