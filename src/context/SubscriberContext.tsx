import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { SectionId } from '../data/sections'
import { sections } from '../data/sections'

export interface SubscriberState {
  email: string
  subscribedAt: string
  topics: SectionId[]
  playlist: string[]
  voicePresetId: string
}

const STORAGE_KEY = 'gmt-subscriber'
const ALL_TOPICS = sections.map((s) => s.id)

const defaultState: SubscriberState = {
  email: '',
  subscribedAt: '',
  topics: [...ALL_TOPICS],
  playlist: [],
  voicePresetId: 'orion',
}

function loadState(): SubscriberState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SubscriberState
    if (!parsed.email || !parsed.subscribedAt) return null
    return {
      ...defaultState,
      ...parsed,
      topics: parsed.topics?.length ? parsed.topics : [...ALL_TOPICS],
      playlist: parsed.playlist ?? [],
    }
  } catch {
    return null
  }
}

interface SubscriberContextType {
  subscriber: SubscriberState | null
  isSubscriber: boolean
  activateSubscription: (email: string) => void
  clearSubscription: () => void
  setTopics: (topics: SectionId[]) => void
  toggleTopic: (topic: SectionId) => void
  setPlaylist: (ids: string[]) => void
  addToPlaylist: (id: string) => void
  removeFromPlaylist: (id: string) => void
  movePlaylistItem: (from: number, to: number) => void
  setVoicePresetId: (id: string) => void
}

const SubscriberContext = createContext<SubscriberContextType | null>(null)

export function SubscriberProvider({ children }: { children: ReactNode }) {
  const [subscriber, setSubscriber] = useState<SubscriberState | null>(() => loadState())

  useEffect(() => {
    if (subscriber) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriber))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [subscriber])

  const activateSubscription = useCallback((email: string) => {
    setSubscriber((prev) => ({
      ...(prev ?? defaultState),
      email,
      subscribedAt: new Date().toISOString(),
    }))
  }, [])

  const clearSubscription = useCallback(() => setSubscriber(null), [])

  const setTopics = useCallback((topics: SectionId[]) => {
    setSubscriber((prev) => (prev ? { ...prev, topics } : prev))
  }, [])

  const toggleTopic = useCallback((topic: SectionId) => {
    setSubscriber((prev) => {
      if (!prev) return prev
      const has = prev.topics.includes(topic)
      const topics = has
        ? prev.topics.filter((t) => t !== topic)
        : [...prev.topics, topic]
      return { ...prev, topics: topics.length ? topics : [topic] }
    })
  }, [])

  const setPlaylist = useCallback((playlist: string[]) => {
    setSubscriber((prev) => (prev ? { ...prev, playlist } : prev))
  }, [])

  const addToPlaylist = useCallback((id: string) => {
    setSubscriber((prev) => {
      if (!prev || prev.playlist.includes(id)) return prev
      return { ...prev, playlist: [...prev.playlist, id] }
    })
  }, [])

  const removeFromPlaylist = useCallback((id: string) => {
    setSubscriber((prev) =>
      prev ? { ...prev, playlist: prev.playlist.filter((x) => x !== id) } : prev,
    )
  }, [])

  const movePlaylistItem = useCallback((from: number, to: number) => {
    setSubscriber((prev) => {
      if (!prev || to < 0 || to >= prev.playlist.length) return prev
      const playlist = [...prev.playlist]
      const [item] = playlist.splice(from, 1)
      playlist.splice(to, 0, item)
      return { ...prev, playlist }
    })
  }, [])

  const setVoicePresetId = useCallback((voicePresetId: string) => {
    setSubscriber((prev) => (prev ? { ...prev, voicePresetId } : prev))
  }, [])

  return (
    <SubscriberContext.Provider
      value={{
        subscriber,
        isSubscriber: Boolean(subscriber?.email),
        activateSubscription,
        clearSubscription,
        setTopics,
        toggleTopic,
        setPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        movePlaylistItem,
        setVoicePresetId,
      }}
    >
      {children}
    </SubscriberContext.Provider>
  )
}

export function useSubscriber() {
  const ctx = useContext(SubscriberContext)
  if (!ctx) throw new Error('useSubscriber must be used within SubscriberProvider')
  return ctx
}
