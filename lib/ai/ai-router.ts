/**
 * AI model routing based on task complexity.
 * Routes to appropriate model based on:
 * - Token budget
 * - Context length
 * - Complexity of request
 * - User subscription tier (placeholder for future)
 */

import type { ModelConfig } from './model-router'
import { MODELS } from './model-router'

export type TaskComplexity = 'small' | 'medium' | 'architecture' | 'free'

export function classifyTaskComplexity(
  userMessage: string,
  fileCount: number,
  totalChars: number,
  preferHighQuality?: boolean
): TaskComplexity {
  if (preferHighQuality) return 'architecture'

  const lower = userMessage.toLowerCase()
  const architectureKeywords = [
    'architecture', 'refactor', 'restructure', 'multi-file', 'multiple files',
    'create component', 'create module', 'add feature', 'implement',
    'create new', 'add new', 'build', 'scaffold',
  ]
  const isArchitecture = architectureKeywords.some(kw => lower.includes(kw))
  if (isArchitecture || fileCount > 2) return 'architecture'

  const mediumKeywords = [
    'fix', 'improve', 'optimize', 'update', 'modify', 'change',
    'add', 'remove', 'implement', 'complete',
  ]
  const isMedium = mediumKeywords.some(kw => lower.includes(kw)) || totalChars > 2000
  if (isMedium || fileCount > 1) return 'medium'

  return 'small'
}

/**
 * Select model based on task complexity and available API keys.
 * Priority: Groq 8B (small) -> Groq 70B / GPT-4o-mini (medium) -> Claude Sonnet / GPT-4o (architecture)
 */
export function routeModelByComplexity(
  complexity: TaskComplexity,
  groqEnabled: boolean
): ModelConfig | null {
  // Small edits: cheap model (Groq 8B or 70B, Gemini Flash)
  if (complexity === 'small') {
    if (groqEnabled && process.env.GROQ_API_KEY) {
      return MODELS.find(m => m.provider === 'groq') || null
    }
    if (process.env.GEMINI_API_KEY) {
      return MODELS.find(m => m.tier === 'flash') || null
    }
    if (process.env.GROQ_API_KEY) {
      return MODELS.find(m => m.provider === 'groq') || null
    }
  }

  // Medium: Groq 70B, GPT-4o-mini, Claude Haiku
  if (complexity === 'medium') {
    if (groqEnabled && process.env.GROQ_API_KEY) {
      return MODELS.find(m => m.provider === 'groq') || null
    }
    if (process.env.OPENAI_API_KEY) {
      return MODELS.find(m => m.tier === 'gpt-mini') || null
    }
    if (process.env.ANTHROPIC_API_KEY) {
      return MODELS.find(m => m.tier === 'haiku') || null
    }
    if (process.env.GEMINI_API_KEY) {
      return MODELS.find(m => m.tier === 'flash') || null
    }
  }

  // Architecture / multi-file: premium (Claude Sonnet, GPT-4o)
  if (complexity === 'architecture') {
    if (process.env.ANTHROPIC_API_KEY) {
      return MODELS.find(m => m.tier === 'sonnet') || null
    }
    if (process.env.OPENAI_API_KEY) {
      return MODELS.find(m => m.tier === 'gpt-mini') || null
    }
    if (process.env.GROQ_API_KEY) {
      return MODELS.find(m => m.provider === 'groq') || null
    }
    if (process.env.GEMINI_API_KEY) {
      return MODELS.find(m => m.tier === 'flash') || null
    }
  }

  // Free tier fallback
  if (process.env.GEMINI_API_KEY) return MODELS.find(m => m.tier === 'flash') || null
  if (process.env.GROQ_API_KEY) return MODELS.find(m => m.provider === 'groq') || null

  return null
}
