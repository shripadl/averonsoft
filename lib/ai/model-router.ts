/**
 * Multi-Model Router for AI Code Workspace
 * Groq: Used when groq_ai_enabled (super admin toggle)
 * Default: Gemini Flash (cheapest)
 * Fallback: Claude Haiku
 * Complex tasks: Claude Sonnet (when user requests "high quality")
 * Optional: GPT-4.1 Mini
 */

export type ModelTier = 'flash' | 'haiku' | 'sonnet' | 'gpt-mini' | 'groq'

export interface ModelConfig {
  id: string
  name: string
  provider: 'gemini' | 'anthropic' | 'openai' | 'groq'
  tier: ModelTier
  envKey: string
}

export const MODELS: ModelConfig[] = [
  { id: 'groq-llama', name: 'Groq (Llama)', provider: 'groq', tier: 'groq', envKey: 'GROQ_API_KEY' },
  { id: 'gemini-flash', name: 'Gemini Flash', provider: 'gemini', tier: 'flash', envKey: 'GEMINI_API_KEY' },
  { id: 'claude-haiku', name: 'Claude Haiku', provider: 'anthropic', tier: 'haiku', envKey: 'ANTHROPIC_API_KEY' },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'anthropic', tier: 'sonnet', envKey: 'ANTHROPIC_API_KEY' },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', tier: 'gpt-mini', envKey: 'OPENAI_API_KEY' },
]

// Soft token accounting (local only for v1)
let tokenUsage = { flash: 0, haiku: 0, sonnet: 0, 'gpt-mini': 0, groq: 0 }

export function getTokenUsage() {
  return { ...tokenUsage }
}

export function recordTokens(tier: ModelTier, count: number) {
  if (tier in tokenUsage) tokenUsage[tier as keyof typeof tokenUsage] += count
}

export function selectModel(
  userMessage: string,
  preferHighQuality = false,
  groqEnabled = false
): ModelConfig | null {
  // When Groq is enabled (super admin toggle), prefer Groq in dev
  if (groqEnabled && process.env.GROQ_API_KEY) {
    return MODELS.find(m => m.provider === 'groq') || null
  }

  const wantsHighQuality = preferHighQuality ||
    /high quality|best quality|use (claude )?sonnet|complex/i.test(userMessage)

  if (wantsHighQuality && process.env.ANTHROPIC_API_KEY) {
    return MODELS.find(m => m.tier === 'sonnet') || null
  }

  if (process.env.GEMINI_API_KEY) {
    return MODELS.find(m => m.tier === 'flash') || null
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return MODELS.find(m => m.tier === 'haiku') || null
  }

  if (process.env.OPENAI_API_KEY) {
    return MODELS.find(m => m.tier === 'gpt-mini') || null
  }

  return null
}

export async function callModel(
  model: ModelConfig,
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt?: string
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = process.env[model.envKey]
  if (!apiKey) {
    throw new Error(`API key not configured for ${model.name}`)
  }

  if (model.provider === 'gemini') {
    return callGemini(apiKey, messages, systemPrompt)
  }

  if (model.provider === 'anthropic') {
    return callAnthropic(apiKey, model.tier, messages, systemPrompt)
  }

  if (model.provider === 'openai') {
    return callOpenAI(apiKey, messages, systemPrompt)
  }

  if (model.provider === 'groq') {
    return callGroq(apiKey, messages, systemPrompt)
  }

  throw new Error(`Unknown provider: ${model.provider}`)
}

async function callGroq(
  apiKey: string,
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<{ content: string; tokensUsed: number }> {
  const url = 'https://api.groq.com/openai/v1/chat/completions'
  const groqMessages = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      max_tokens: 8192,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  const tokensUsed = data.usage?.total_tokens || text.length / 4

  recordTokens('groq', tokensUsed)
  return { content: text, tokensUsed }
}

async function callGemini(
  apiKey: string,
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<{ content: string; tokensUsed: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const payload = {
    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const tokensUsed = data.usageMetadata?.totalTokenCount || text.length / 4

  recordTokens('flash', tokensUsed)
  return { content: text, tokensUsed }
}

async function callAnthropic(
  apiKey: string,
  tier: ModelTier,
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<{ content: string; tokensUsed: number }> {
  const model = tier === 'sonnet' ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-20241022'
  const url = 'https://api.anthropic.com/v1/messages'

  const system = systemPrompt || 'You are a helpful coding assistant.'
  const anthropicMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  const lastUser = anthropicMessages.filter(m => m.role === 'user').pop()
  const priorMessages = anthropicMessages.slice(0, -1)

  const payload = {
    model,
    max_tokens: 8192,
    system,
    messages: lastUser ? [...priorMessages, lastUser] : anthropicMessages,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || text.length / 4

  recordTokens(tier, tokensUsed)
  return { content: text, tokensUsed }
}

async function callOpenAI(
  apiKey: string,
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<{ content: string; tokensUsed: number }> {
  const url = 'https://api.openai.com/v1/chat/completions'
  const openAIMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: openAIMessages,
      max_tokens: 8192,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  const tokensUsed = data.usage?.total_tokens || text.length / 4

  recordTokens('gpt-mini', tokensUsed)
  return { content: text, tokensUsed }
}
