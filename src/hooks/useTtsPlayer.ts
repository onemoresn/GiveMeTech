import { useCallback, useEffect, useRef, useState } from 'react'
import type { Article } from '../data/articles'
import {
  GOOGLE_TTS_VOICE_PRESETS,
  hasGoogleTtsKey,
  getTtsUsageThisMonth,
  getTtsRemainingChars,
  GOOGLE_TTS_MONTHLY_LIMIT,
  synthesizeGoogleSpeech,
} from '../lib/googleTts'

export interface TtsVoicePreset {
  id: string
  label: string
  description: string
}

export const TTS_VOICE_PRESETS: TtsVoicePreset[] = GOOGLE_TTS_VOICE_PRESETS

function pickBrowserVoice(presetId: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  const en = voices.filter((v) => v.lang.startsWith('en'))
  const pool = en.length ? en : voices
  const idx = TTS_VOICE_PRESETS.findIndex((p) => p.id === presetId)
  return pool[idx % pool.length] ?? pool[0]
}

export function articleSpeechText(article: Article): string {
  const body = (article.body || article.excerpt).replace(/<[^>]+>/g, ' ')
  const trimmed = body.length > 900 ? `${body.slice(0, 900).trim()}…` : body
  return `${article.title}. ${trimmed}`
}

export function useTtsPlayer(voicePresetId: string) {
  const useGoogle = hasGoogleTtsKey()
  const [browserVoicesReady, setBrowserVoicesReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const queueRef = useRef<Article[]>([])
  const indexRef = useRef(0)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (useGoogle) {
      setBrowserVoicesReady(true)
      return
    }
    const load = () => {
      voicesRef.current = speechSynthesis.getVoices()
      setBrowserVoicesReady(voicesRef.current.length > 0)
    }
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [useGoogle])

  const stop = useCallback(() => {
    stoppedRef.current = true
    speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    queueRef.current = []
    indexRef.current = 0
    setPlaying(false)
    setCurrentIndex(-1)
    setTtsError(null)
  }, [])

  const playNextGoogle = useCallback(async () => {
    if (stoppedRef.current) return
    const queue = queueRef.current
    if (indexRef.current >= queue.length) {
      stop()
      return
    }

    const article = queue[indexRef.current]
    setCurrentIndex(indexRef.current)
    const text = articleSpeechText(article)

    try {
      const blob = await synthesizeGoogleSpeech(text, voicePresetId)
      if (stoppedRef.current) return

      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        indexRef.current += 1
        playNextGoogle()
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        indexRef.current += 1
        playNextGoogle()
      }
      await audio.play()
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'TTS failed')
      indexRef.current += 1
      playNextGoogle()
    }
  }, [voicePresetId, stop])

  const speakNextBrowser = useCallback(() => {
    const queue = queueRef.current
    if (indexRef.current >= queue.length) {
      stop()
      return
    }
    const article = queue[indexRef.current]
    setCurrentIndex(indexRef.current)
    const utterance = new SpeechSynthesisUtterance(articleSpeechText(article))
    const voice = pickBrowserVoice(voicePresetId, voicesRef.current)
    if (voice) utterance.voice = voice
    utterance.onend = () => {
      indexRef.current += 1
      speakNextBrowser()
    }
    utterance.onerror = () => {
      indexRef.current += 1
      speakNextBrowser()
    }
    speechSynthesis.speak(utterance)
  }, [voicePresetId, stop])

  const playQueue = useCallback(
    (articles: Article[]) => {
      stop()
      stoppedRef.current = false
      if (!articles.length || !browserVoicesReady) return
      queueRef.current = articles
      indexRef.current = 0
      setPlaying(true)
      if (useGoogle) {
        playNextGoogle()
      } else {
        speakNextBrowser()
      }
    },
    [speakNextBrowser, playNextGoogle, stop, browserVoicesReady, useGoogle],
  )

  return {
    voicesReady: browserVoicesReady,
    playing,
    currentIndex,
    playQueue,
    stop,
    presets: TTS_VOICE_PRESETS,
    useGoogle,
    ttsError,
    ttsUsage: getTtsUsageThisMonth(),
    ttsRemaining: getTtsRemainingChars(),
    ttsLimit: GOOGLE_TTS_MONTHLY_LIMIT,
  }
}
