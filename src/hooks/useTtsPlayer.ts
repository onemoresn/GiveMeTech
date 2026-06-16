import { useCallback, useEffect, useRef, useState } from 'react'
import type { Article } from '../data/articles'
import {
  GEMINI_TTS_VOICE_PRESETS,
  hasGeminiTtsKey,
  getTtsUsageThisMonth,
  getTtsRemainingChars,
  GEMINI_TTS_MONTHLY_LIMIT,
  synthesizeGeminiSpeech,
} from '../lib/geminiTts'

export interface TtsVoicePreset {
  id: string
  label: string
  description: string
}

export const TTS_VOICE_PRESETS: TtsVoicePreset[] = GEMINI_TTS_VOICE_PRESETS

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
  const useGeminiTts = hasGeminiTtsKey()
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
    if (useGeminiTts) {
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
  }, [useGeminiTts])

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

  const playNextGemini = useCallback(async () => {
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
      const blob = await synthesizeGeminiSpeech(text, voicePresetId)
      if (stoppedRef.current) return

      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        URL.revokeObjectURL(url)
        indexRef.current += 1
        playNextGemini()
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        indexRef.current += 1
        playNextGemini()
      }
      await audio.play()
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'TTS failed')
      indexRef.current += 1
      playNextGemini()
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
      if (useGeminiTts) {
        playNextGemini()
      } else {
        speakNextBrowser()
      }
    },
    [speakNextBrowser, playNextGemini, stop, browserVoicesReady, useGeminiTts],
  )

  return {
    voicesReady: browserVoicesReady,
    playing,
    currentIndex,
    playQueue,
    stop,
    presets: TTS_VOICE_PRESETS,
    useGeminiTts,
    ttsError,
    ttsUsage: getTtsUsageThisMonth(),
    ttsRemaining: getTtsRemainingChars(),
    ttsLimit: GEMINI_TTS_MONTHLY_LIMIT,
  }
}
