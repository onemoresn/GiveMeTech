/**
 * Gemini TTS via Google AI Studio (generateContent API).
 * Get an API key at https://aistudio.google.com/apikey
 * Same key as GEMINI_API_KEY — expose to the browser as VITE_GEMINI_API_KEY.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
const TTS_MODEL = 'gemini-2.5-flash-preview-tts'
const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`

/** Soft client-side cap for usage display (AI Studio free tier is request-limited). */
export const GEMINI_TTS_MONTHLY_LIMIT = 1_000_000
const USAGE_KEY_PREFIX = 'gmt-tts-usage-'

export interface GeminiTtsVoicePreset {
  id: string
  label: string
  description: string
  geminiVoice: string
}

export const GEMINI_TTS_VOICE_PRESETS: GeminiTtsVoicePreset[] = [
  {
    id: 'orion',
    label: 'Orion',
    description: 'Clear male narrator',
    geminiVoice: 'Orus',
  },
  {
    id: 'lyra',
    label: 'Lyra',
    description: 'Warm female tone',
    geminiVoice: 'Aoede',
  },
  {
    id: 'vector',
    label: 'Vector',
    description: 'Neutral broadcast',
    geminiVoice: 'Charon',
  },
  {
    id: 'pulse',
    label: 'Pulse',
    description: 'Energetic briefing',
    geminiVoice: 'Puck',
  },
]

export function hasGeminiTtsKey(): boolean {
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
  return Math.max(0, GEMINI_TTS_MONTHLY_LIMIT - getTtsUsageThisMonth())
}

function pcmToWav(pcm: Uint8Array, sampleRate = 24000): Blob {
  const channels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const blockAlign = channels * (bitsPerSample / 8)
  const dataSize = pcm.length
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)
  new Uint8Array(buffer, 44).set(pcm)
  return new Blob([buffer], { type: 'audio/wav' })
}

function parseSampleRate(mimeType?: string): number {
  if (!mimeType) return 24000
  const match = mimeType.match(/rate=(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 24000
}

export async function synthesizeGeminiSpeech(
  text: string,
  voicePresetId: string,
): Promise<Blob> {
  if (!API_KEY) throw new Error('Gemini API key is not configured.')

  const chars = text.length
  if (getTtsUsageThisMonth() + chars > GEMINI_TTS_MONTHLY_LIMIT) {
    throw new Error('Monthly TTS character limit reached. Resets next calendar month.')
  }

  const preset = GEMINI_TTS_VOICE_PRESETS.find((p) => p.id === voicePresetId)
  const voiceName = preset?.geminiVoice ?? 'Orus'

  const res = await fetch(`${GENERATE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini TTS error (${res.status}): ${err.slice(0, 160)}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>
      }
    }>
  }

  const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!inlineData?.data) throw new Error('Gemini TTS returned empty audio.')

  recordTtsUsage(chars)

  const binary = atob(inlineData.data)
  const pcm = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) pcm[i] = binary.charCodeAt(i)

  const sampleRate = parseSampleRate(inlineData.mimeType)
  return pcmToWav(pcm, sampleRate)
}
