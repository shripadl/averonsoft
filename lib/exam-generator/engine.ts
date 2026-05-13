import type { Difficulty, GeneratedMcq, QuestionTemplate } from '@/lib/exam-generator/types'
import { isGeneratedTextSafe, validateTopic } from '@/lib/exam-generator/safety'
import { mapTopicToDomain } from '@/lib/exam-generator/domain-map'
import { ALL_TEMPLATES } from '@/lib/exam-generator/templates'

const NO_TEMPLATES_MSG =
  'No templates available for this topic yet. Please try a related topic.'

function fnv1a32(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    let t = (a += 0x6d2b79f5) >>> 0
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function prng(seedStr: string): () => number {
  return mulberry32(fnv1a32(seedStr) || 1)
}

export function applyVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)
}

function pickVariables(
  variables: Record<string, string[]>,
  rand: () => number
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, values] of Object.entries(variables)) {
    if (!values.length) continue
    out[key] = values[Math.floor(rand() * values.length)]!
  }
  return out
}

function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function difficultyToCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 10
    case 'medium':
      return 15
    case 'hard':
      return 20
    default:
      return 15
  }
}

const FALLBACK_DISTRACTORS = [
  'This statement is unrelated to the topic.',
  'It applies only in rare experimental conditions.',
  'It reverses the usual direction of the effect.',
  'It describes a deprecated practice with no modern use.',
]

function pickDistractors(template: QuestionTemplate, rand: () => number, need: number): string[] {
  const pool = [...template.distractors]
  const shuffled = seededShuffle(pool, rand)
  const picked = shuffled.slice(0, need)
  let i = 0
  while (picked.length < need) {
    picked.push(FALLBACK_DISTRACTORS[i % FALLBACK_DISTRACTORS.length]!)
    i += 1
  }
  return picked
}

function buildMcq(
  template: QuestionTemplate,
  topic: string,
  difficulty: Difficulty,
  qIndex: number
): GeneratedMcq | null {
  const rand = prng(`${topic}|${difficulty}|${template.id}|${qIndex}`)
  const vars = pickVariables(template.variables, rand)
  const stem = applyVariables(template.stem, vars).trim()
  const correct = applyVariables(template.correctTemplate, vars).trim()
  const wrong = pickDistractors(template, rand, 3)
  const optionsRaw = seededShuffle([correct, ...wrong], rand)
  const labels = ['A', 'B', 'C', 'D'] as const
  const options = optionsRaw.map((text, i) => ({
    label: labels[i]!,
    text,
  }))
  const correctLabel = options.find(o => o.text === correct)?.label ?? 'A'
  const blob = `${stem}\n${options.map(o => o.text).join('\n')}`
  if (!isGeneratedTextSafe(blob).ok) return null
  return {
    id: `${template.id}-${qIndex}`,
    stem,
    options,
    correctLabel,
    domain: template.domain,
  }
}

export interface GenerateExamInput {
  topic: string
  difficulty: Difficulty
}

export interface GenerateExamResult {
  ok: true
  topic: string
  difficulty: Difficulty
  mappedDomain: string
  mcqs: GeneratedMcq[]
}

export interface GenerateExamError {
  ok: false
  error: string
}

export function generateExamQuestions(input: GenerateExamInput): GenerateExamResult | GenerateExamError {
  const topicCheck = validateTopic(input.topic)
  if (!topicCheck.ok) {
    return { ok: false, error: topicCheck.reason ?? 'Invalid topic.' }
  }
  const topic = input.topic.trim()
  const difficulty = input.difficulty
  const mappedDomain = mapTopicToDomain(topic)
  const requested = difficultyToCount(difficulty)

  const pool = ALL_TEMPLATES.filter(t => t.domain === mappedDomain)

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Topic:', topic)
    // eslint-disable-next-line no-console
    console.log('Mapped domain:', mappedDomain)
    // eslint-disable-next-line no-console
    console.log('Templates loaded:', pool.length)
  }

  if (pool.length === 0) {
    return { ok: false, error: NO_TEMPLATES_MSG }
  }

  const count = Math.min(requested, pool.length)

  const ordered = [...pool].sort((a, b) => a.id.localeCompare(b.id))
  const randOrder = prng(`${topic}|${difficulty}|order`)
  const shuffledTemplates = seededShuffle(ordered, randOrder)

  const mcqs: GeneratedMcq[] = []
  let spin = 0
  const maxSpins = Math.max(count * 8, shuffledTemplates.length * 6)
  while (mcqs.length < count && spin < maxSpins) {
    const template = shuffledTemplates[spin % shuffledTemplates.length]!
    const built = buildMcq(template, topic, difficulty, spin)
    if (built) {
      const dupStem = mcqs.some(m => m.stem === built.stem)
      if (!dupStem) mcqs.push(built)
    }
    spin += 1
  }

  if (mcqs.length === 0) {
    return { ok: false, error: NO_TEMPLATES_MSG }
  }

  return {
    ok: true,
    topic,
    difficulty,
    mappedDomain,
    mcqs: mcqs.slice(0, count),
  }
}
