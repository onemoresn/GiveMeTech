import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { trackSiteCommandEvent } from '../lib/sitecommand'

interface UserProfile {
  name: string
  avatarColor: string
  avatarShape: 'sphere' | 'cube' | 'torus'
  level: number
  xp: number
  badges: string[]
  readArticles: string[]
}

interface AppContextType {
  highContrast: boolean
  toggleHighContrast: () => void
  profile: UserProfile
  addXP: (amount: number, articleId?: string) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const defaultProfile: UserProfile = {
  name: 'Explorer',
  avatarColor: '#00f0ff',
  avatarShape: 'sphere',
  level: 1,
  xp: 0,
  badges: [],
  readArticles: [],
}

const AppContext = createContext<AppContextType | null>(null)

const XP_PER_LEVEL = 200

export function AppProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('gmt-profile')
      return saved ? JSON.parse(saved) : defaultProfile
    } catch {
      return defaultProfile
    }
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem('gmt-profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  const toggleHighContrast = useCallback(() => setHighContrast((v) => !v), [])

  const addXP = useCallback((amount: number, articleId?: string) => {
    setProfile((prev) => {
      let xp = prev.xp + amount
      let level = prev.level
      const isNewRead = articleId && !prev.readArticles.includes(articleId)
      const readArticles = isNewRead
        ? [...prev.readArticles, articleId]
        : prev.readArticles

      if (isNewRead && articleId) {
        trackSiteCommandEvent('article_read', { articleId, xp: amount })
      }

      while (xp >= XP_PER_LEVEL) {
        xp -= XP_PER_LEVEL
        level += 1
      }

      const badges = [...prev.badges]
      if (readArticles.length >= 1 && !badges.includes('first-read')) badges.push('first-read')
      if (readArticles.length >= 5 && !badges.includes('avid-reader')) badges.push('avid-reader')
      if (readArticles.length >= 10 && !badges.includes('tech-sage')) badges.push('tech-sage')
      if (level >= 5 && !badges.includes('level-5')) badges.push('level-5')

      return { ...prev, xp, level, badges, readArticles }
    })
  }, [])

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  return (
    <AppContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        profile,
        addXP,
        updateProfile,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export const badgeInfo: Record<string, { label: string; icon: string }> = {
  'first-read': { label: 'First Contact', icon: '📡' },
  'avid-reader': { label: 'Avid Reader', icon: '📚' },
  'tech-sage': { label: 'Tech Sage', icon: '🧙' },
  'level-5': { label: 'Level 5 Pioneer', icon: '⭐' },
}
