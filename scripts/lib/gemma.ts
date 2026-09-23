import type { SectionId } from '../../src/data/sections'

const DEFAULT_GEMMA_MODEL = 'gemma4:e2b'
const DEFAULT_OLLAMA_HOST = 'http://127.0.0.1:11434'

let callCount = 0
let availability: Promise<boolean> | null = null

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function getModel(): string {
  return process.env.GEMMA_MODEL?.trim() || DEFAULT_GEMMA_MODEL
}

/** OLLAMA_HOST / GEMMA_HOST — default local Ollama. */
export function getOllamaHost(): string {
  const raw = process.env.OLLAMA_HOST?.trim() || process.env.GEMMA_HOST?.trim() || DEFAULT_OLLAMA_HOST
  const withProtocol = raw.includes('://') ? raw : `http://${raw}`
  return withProtocol.replace(/\/$/, '')
}

/** Disabled only when GEMMA_ENABLED is explicitly false. */
function isEnabled(): boolean {
  const value = process.env.GEMMA_ENABLED?.trim().toLowerCase()
  return value !== 'false' && value !== '0' && value !== 'off'
}

function getMaxCalls(): number {
  return parsePositiveInt(process.env.GEMMA_MAX_CALLS, 49)
}

export function isGemmaEnabled(): boolean {
  return isEnabled()
}

export function isGemmaActive(): boolean {
  return isEnabled() && callCount < getMaxCalls()
}

export function getGemmaUsage(): {
  calls: number
  maxCalls: number
  enabled: boolean
  model: string
  host: string
} {
  return {
    calls: callCount,
    maxCalls: getMaxCalls(),
    enabled: isEnabled(),
    model: getModel(),
    host: getOllamaHost(),
  }
}

const SECTION_TOPIC: Record<SectionId, string> = {
  ai: 'AI and machine learning',
  cybersecurity: 'cybersecurity and digital privacy',
  gadgets: 'consumer technology and gadgets',
  software: 'software development and engineering',
  space: 'space exploration and astronomy',
  gaming: 'gaming and interactive entertainment',
  cars: 'electric vehicles, hybrids, and automotive technology',
}

const SECTION_TONE: Record<SectionId, string> = {
  ai: 'Professional, precise, and measured — analytical without hype.',
  cybersecurity: 'Professional, precise, and measured — clear and serious, never alarmist.',
  software: 'Professional, precise, and measured — technical clarity over buzzwords.',
  space: 'Professional, precise, and measured — wonder is fine, but stay factual.',
  gadgets: 'Enthusiastic but grounded — excited about the hardware without overselling or hype.',
  gaming: 'Professional and playful — lighter word choice and energy, still factual and respectful.',
  cars: 'Enthusiastic but grounded — excited about EV and auto tech without overselling specs or hype.',
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
 * One probe per process: Ollama is up and gemma4:e2b (or GEMMA_MODEL) is pulled.
 * Cached so a missing local daemon does not add a timeout per article.
 */
async function isOllamaReady(): Promise<boolean> {
  if (!availability) {
    availability = (async () => {
      const host = getOllamaHost()
      const model = getModel()
      try {
        const res = await fetch(`${host}/api/tags`, {
          signal: AbortSignal.timeout(2500),
        })
        if (!res.ok) {
          console.warn(`  ⚠ Ollama not ready at ${host} (${res.status}) — using template summaries`)
          return false
        }
        const data = (await res.json()) as { models?: { name?: string }[] }
        const names = (data.models ?? []).map((m) => m.name ?? '')
        const found = names.some((name) => name === model || name.startsWith(`${model}-`))
        if (!found) {
          console.warn(
            `  ⚠ Ollama is running but ${model} is not pulled — using template summaries. Run: ollama pull ${model}`,
          )
          return false
        }
        return true
      } catch (err) {
        console.warn(
          `  ⚠ Ollama unreachable at ${host} — using template summaries:`,
          err instanceof Error ? err.message : err,
        )
        return false
      }
    })()
  }
  return availability
}

/**
 * Generates an article summary with local Gemma 4 e2b via Ollama (3–10 paragraphs).
 * Returns null when disabled, Ollama is down, the model is missing, the cap is hit,
 * or the request fails — caller should fall back to expandBody().
 */
export async function generateSummary(
  title: string,
  excerpt: string,
  section: SectionId,
  source: string,
): Promise<string | null> {
  if (!isEnabled()) return null
  if (!(await isOllamaReady())) return null

  const maxCalls = getMaxCalls()
  if (callCount >= maxCalls) {
    console.warn(`  ⚠ Gemma cap reached (${maxCalls}/run) — using template summary`)
    return null
  }

  callCount++

  const host = getOllamaHost()
  const model = getModel()
  const prompt = buildSummaryPrompt(title, excerpt, section, source)

  try {
    const res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.45, num_predict: 1200 },
      }),
      signal: AbortSignal.timeout(90000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.warn(`  ⚠ Gemma error (${res.status}): ${err.slice(0, 160)}`)
      return null
    }

    const data = (await res.json()) as { response?: string }
    return data.response?.trim() || null
  } catch (err) {
    console.warn('  ⚠ Gemma request failed:', err instanceof Error ? err.message : err)
    return null
  }
}
