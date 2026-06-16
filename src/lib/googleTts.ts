/**
 * Google Cloud Text-to-Speech (Neural2 voices).
 * Free tier: ~1M characters/month per Google Cloud project (Neural2/Wavenet).
 * Enable "Cloud Text-to-Speech API" and restrict the browser key by HTTP referrer.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY?.trim()
const SYNTH_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'

export const GOOGLE_TTS_MONTHLY_LIMIT = 1_000_000
const USAGE_KEY_PREFIX = 'gmt-tts-usage-'

export interface GoogleTtsVoicePreset {
  id: string
  label: string
  description: string
  googleVoice: string
}

export const GOOGLE_TTS_VOICE_PRESETS: GoogleTtsVoicePreset[] = [
  {
    id: 'orion',
    label: 'Orion',
    description: 'Clear male narrator (Neural2)',
    googleVoice: 'en-US-Neural2-D',
  },
  {
    id: 'lyra',
    label: 'Lyra',
    description: 'Warm female tone (Neural2)',
    googleVoice: 'en-US-Neural2-F',
  },
  {
    id: 'vector',
    label: 'Vector',
    description: 'Neutral broadcast (Neural2)',
    googleVoice: 'en-US-Neural2-A',
  },
  {
    id: 'pulse',
    label: 'Pulse',
    description: 'Energetic briefing (Neural2)',
    googleVoice: 'en-US-Neural2-J',
  },
]

export function hasGoogleTtsKey(): boolean {
  return Boolean(API_KEY)
}

function usageMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

export function getTtsUsageThisMonth(): number {
  try {
    const raw = localStorage.getItem(`${USAGE_KEY_PREFIX}${usageMonthKey()}`)
    return raw ? Number.parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}

export function recordTtsUsage(characters: number): void {
  const key = `${USAGE_KEY_PREFIX}${usageMonthKey()}`
  const total = getTtsUsageThisMonth() + characters
  localStorage.setItem(key, String(total))
}

export function getTtsRemainingChars(): number {
  return Math.max(0, GOOGLE_TTS_MONTHLY_LIMIT - getTtsUsageThisMonth())
}

export async function synthesizeGoogleSpeech(
  text: string,
  voicePresetId: string,
): Promise<Blob> {
  if (!API_KEY) throw new Error('Google TTS API key is not configured.')

  const chars = text.length
  if (getTtsUsageThisMonth() + chars > GOOGLE_TTS_MONTHLY_LIMIT) {
    throw new Error('Monthly TTS character limit reached (~1M). Resets next calendar month.')
  }

  const preset = GOOGLE_TTS_VOICE_PRESETS.find((p) => p.id === voicePresetId)
  const voiceName = preset?.googleVoice ?? 'en-US-Neural2-D'

  const res = await fetch(`${SYNTH_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-US', name: voiceName },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google TTS error (${res.status}): ${err.slice(0, 120)}`)
  }

  const data = (await res.json()) as { audioContent?: string }
  if (!data.audioContent) throw new Error('Google TTS returned empty audio.')

  recordTtsUsage(chars)

  const binary = atob(data.audioContent)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: 'audio/mp3' })
}
