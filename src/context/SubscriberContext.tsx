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

export interface GuestListenState {
  topics: SectionId[]
  playlist: string[]
  voicePresetId: string
}

const STORAGE_KEY = 'gmt-subscriber'
const GUEST_STORAGE_KEY = 'gmt-guest-listen'
const ALL_TOPICS = sections.map((s) => s.id)

const defaultState: SubscriberState = {
  email: '',
  subscribedAt: '',
  topics: [...ALL_TOPICS],
  playlist: [],
  voicePresetId: 'orion',
}

const defaultGuestListen: GuestListenState = {
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

function loadGuestListen(): GuestListenState {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!raw) return { ...defaultGuestListen }
    const parsed = JSON.parse(raw) as GuestListenState
    return {
      ...defaultGuestListen,
      ...parsed,
      topics: parsed.topics?.length ? parsed.topics : [...ALL_TOPICS],
      playlist: parsed.playlist ?? [],
    }
  } catch {
    return { ...defaultGuestListen }
  }
}

interface SubscriberContextType {
  subscriber: SubscriberState | null
  guestListen: GuestListenState
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
  const [guestListen, setGuestListen] = useState<GuestListenState>(() => loadGuestListen())

  useEffect(() => {
    if (subscriber) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriber))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [subscriber])

  useEffect(() => {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestListen))
  }, [guestListen])

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
    setGuestListen((prev) => ({ ...prev, topics }))
  }, [])

  const toggleTopic = useCallback((topic: SectionId) => {
    const toggle = (topics: SectionId[]) => {
      const has = topics.includes(topic)
      const next = has ? topics.filter((t) => t !== topic) : [...topics, topic]
      return next.length ? next : [topic]
    }
    setSubscriber((prev) => (prev ? { ...prev, topics: toggle(prev.topics) } : prev))
    setGuestListen((prev) => ({ ...prev, topics: toggle(prev.topics) }))
  }, [])

  const setPlaylist = useCallback((playlist: string[]) => {
    setSubscriber((prev) => (prev ? { ...prev, playlist } : prev))
    setGuestListen((prev) => ({ ...prev, playlist }))
  }, [])

  const addToPlaylist = useCallback((id: string) => {
    const add = (playlist: string[]) =>
      playlist.includes(id) ? playlist : [...playlist, id]
    setSubscriber((prev) => (prev ? { ...prev, playlist: add(prev.playlist) } : prev))
    setGuestListen((prev) => ({ ...prev, playlist: add(prev.playlist) }))
  }, [])

  const removeFromPlaylist = useCallback((id: string) => {
    const remove = (playlist: string[]) => playlist.filter((x) => x !== id)
    setSubscriber((prev) => (prev ? { ...prev, playlist: remove(prev.playlist) } : prev))
    setGuestListen((prev) => ({ ...prev, playlist: remove(prev.playlist) }))
  }, [])

  const movePlaylistItem = useCallback((from: number, to: number) => {
    const move = (playlist: string[]) => {
      if (to < 0 || to >= playlist.length) return playlist
      const next = [...playlist]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    }
    setSubscriber((prev) => (prev ? { ...prev, playlist: move(prev.playlist) } : prev))
    setGuestListen((prev) => ({ ...prev, playlist: move(prev.playlist) }))
  }, [])

  const setVoicePresetId = useCallback((voicePresetId: string) => {
    setSubscriber((prev) => (prev ? { ...prev, voicePresetId } : prev))
    setGuestListen((prev) => ({ ...prev, voicePresetId }))
  }, [])

  return (
    <SubscriberContext.Provider
      value={{
        subscriber,
        guestListen,
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
