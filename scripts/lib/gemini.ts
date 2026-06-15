import type { SectionId } from '../../src/data/sections'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

let callCount = 0

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Read at call time so dotenv has loaded before fetch-feeds runs. */
function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined
}

function isEnabled(): boolean {
  return process.env.GEMINI_ENABLED?.trim().toLowerCase() === 'true'
}

function getMaxCalls(): number {
  return parsePositiveInt(process.env.GEMINI_MAX_CALLS, 12)
}

/** Key is present — does not mean Gemini will run (see isGeminiActive). */
export function hasGeminiKey(): boolean {
  return Boolean(getApiKey())
}

/** Key + GEMINI_ENABLED=true and under per-run call cap. */
export function isGeminiActive(): boolean {
  return Boolean(getApiKey()) && isEnabled() && callCount < getMaxCalls()
}

export function getGeminiUsage(): { calls: number; maxCalls: number; enabled: boolean } {
  return { calls: callCount, maxCalls: getMaxCalls(), enabled: isEnabled() }
}

/** 5 s gap between calls → max 12 req/min, safely under the 15 req/min free-tier limit */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const SECTION_TOPIC: Record<SectionId, string> = {
  ai: 'AI and machine learning',
  cybersecurity: 'cybersecurity and digital privacy',
  gadgets: 'consumer technology and gadgets',
  software: 'software development and engineering',
  space: 'space exploration and astronomy',
  gaming: 'gaming and interactive entertainment',
}

const SECTION_TONE: Record<SectionId, string> = {
  ai: 'Professional, precise, and measured — analytical without hype.',
  cybersecurity: 'Professional, precise, and measured — clear and serious, never alarmist.',
  software: 'Professional, precise, and measured — technical clarity over buzzwords.',
  space: 'Professional, precise, and measured — wonder is fine, but stay factual.',
  gadgets: 'Enthusiastic but grounded — excited about the hardware without overselling or hype.',
  gaming: 'Professional and playful — lighter word choice and energy, still factual and respectful.',
}

function buildSummaryPrompt(
  title: string,
  excerpt: string,
  section: SectionId,
  source: string,
): string {
  return (
    `You write editorial summaries for GiveMeTech, a futuristic tech news portal for savvy readers.\n\n` +
    `TOPIC: ${SECTION_TOPIC[section]}\n` +
    `TONE: ${SECTION_TONE[section]}\n\n` +
    `TASK: Expand the story below into a readable summary for our readers. ` +
    `Use as many paragraphs as the material warrants — minimum 3, maximum 10. ` +
    `Each paragraph should be 2-4 sentences. Separate paragraphs with a blank line.\n\n` +
    `FACTUAL RULES (strict):\n` +
    `- Only state facts present in the title and summary below. Do not invent names, numbers, dates, quotes, or specs.\n` +
    `- You may explain why something matters in general terms, but do not add new claims.\n` +
    `- If details are missing, acknowledge the gap rather than filling it.\n` +
    `- Do not claim GiveMeTech did original reporting. This is a summary of reporting by ${source}.\n\n` +
    `STYLE RULES:\n` +
    `- Plain prose only — no markdown, headings, or bullet points.\n` +
    `- Never clickbait. Do not start with "In a" or "According to".\n` +
    `- End naturally; the last paragraph may note that ${source} has the full story.\n\n` +
    `Title: ${title}\n` +
    `Source: ${source}\n` +
    `Summary: ${excerpt}\n\n` +
    `Write the summary now:`
  )
}

/**
 * Generates an article summary using Gemini 1.5 Flash (3–10 paragraphs).
 * Returns null on missing key, disabled, cap reached, or API failure — caller should fall back to expandBody().
 */
export async function generateSummary(
  title: string,
  excerpt: string,
  section: SectionId,
  source: string,
): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey) return null
  if (!isEnabled()) return null
  const maxCalls = getMaxCalls()
  if (callCount >= maxCalls) {
    console.warn(`  ⚠ Gemini cap reached (${maxCalls}/run) — using template summary`)
    return null
  }

  callCount++

  const prompt = buildSummaryPrompt(title, excerpt, section, source)

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 1200 },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.warn(`  ⚠ Gemini error (${res.status}): ${err.slice(0, 120)}`)
      return null
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
  } catch (err) {
    console.warn('  ⚠ Gemini request failed:', err instanceof Error ? err.message : err)
    return null
  } finally {
    await delay(5000)
  }
}
