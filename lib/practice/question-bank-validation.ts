import { normalizeOptions, type QuestionExportRow } from '@/lib/practice/format-question-bank-export'

export type ValidationSeverity = 'error' | 'warning'

export type ValidationIssueCode =
  | 'missing_question_text'
  | 'vague_question_text'
  | 'missing_explanation'
  | 'weak_explanation'
  | 'explanation_repeats_question'
  | 'invalid_difficulty'
  | 'invalid_domain_id'
  | 'invalid_options_type'
  | 'insufficient_options'
  | 'duplicate_options'
  | 'empty_option'
  | 'option_matches_stem'
  | 'invalid_correct_option'
  | 'duplicate_stem'
  | 'duplicate_explanation'
  | 'duplicate_scenario_pattern'
  | 'template_count_low'
  | 'domain_coverage_warning'
  | 'exam_mismatch'
  | 'bad_distractors'
  | 'hallucination'
  | 'copyright_risk'
  | 'stem_repetition'
  | 'distractor_pool_reuse'
  | 'mad_lib_pattern'
  | 'generic_explanation'
  | 'non_instructive_explanation'
  | 'missing_context'

export type ValidationIssue = {
  questionId?: string
  code: ValidationIssueCode
  severity: ValidationSeverity
  message: string
}

export type DomainCoverage = {
  domain: string
  count: number
}

export type ValidationSummary = {
  examSlug: string
  examName: string
  totalQuestions: number
  templateEstimate: number
  requiredTemplateMinimum: number
  issueCounts: Record<ValidationIssueCode, number>
  errorCount: number
  warningCount: number
  domainCoverage: DomainCoverage[]
  qualityScore: number
  pass: boolean
  topFixes: Array<{ code: ValidationIssueCode; count: number; impact: 'high' | 'medium' | 'low' }>
}

export type ValidationResult = {
  summary: ValidationSummary
  issues: ValidationIssue[]
  meta: {
    geminiRequested: boolean
    geminiConfigured: boolean
    geminiApplied: boolean
    geminiBatches: number
    geminiFlags: number
  }
}

export type ValidationProgress = {
  stage: 'rules' | 'gemini'
  completed: number
  total: number
  message: string
}

type GeminiSignal = {
  questionId: string
  flags: Array<
    | 'exam_mismatch'
    | 'bad_distractors'
    | 'hallucination'
    | 'copyright_risk'
    | 'stem_repetition'
    | 'distractor_pool_reuse'
    | 'mad_lib_pattern'
    | 'generic_explanation'
    | 'non_instructive_explanation'
    | 'missing_context'
  >
  notes?: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const VAGUE_PATTERNS = [
  /which aws service is best/i,
  /which aws feature should/i,
  /what is the right aws service/i,
  /which aws tool applies/i,
  /^which service/i,
]

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

function scenarioTemplateSignature(text: string): string {
  return normalizeText(text)
    .replace(/\b\d+(\.\d+)?\b/g, '{num}')
    .replace(/\b(us|eu|ap|sa|ca|me)-(east|west|south|north|central)-\d\b/gi, '{region}')
    .replace(/\b(company|team|organization|startup|enterprise|customer)\b/gi, '{org}')
    .replace(/\b[a-z]{2,}-[a-z]{2,}\b/g, '{slug}')
}

function buildIssueCounts(issues: ValidationIssue[]): Record<ValidationIssueCode, number> {
  const out = {} as Record<ValidationIssueCode, number>
  for (const i of issues) {
    out[i.code] = (out[i.code] || 0) + 1
  }
  return out
}

const ISSUE_WEIGHTS: Record<ValidationIssueCode, number> = {
  missing_question_text: 8,
  vague_question_text: 6,
  missing_explanation: 8,
  weak_explanation: 3,
  explanation_repeats_question: 6,
  invalid_difficulty: 5,
  invalid_domain_id: 2,
  invalid_options_type: 8,
  insufficient_options: 7,
  duplicate_options: 7,
  empty_option: 8,
  option_matches_stem: 5,
  invalid_correct_option: 8,
  duplicate_stem: 3,
  duplicate_explanation: 4,
  duplicate_scenario_pattern: 3,
  template_count_low: 10,
  domain_coverage_warning: 2,
  exam_mismatch: 6,
  bad_distractors: 6,
  hallucination: 9,
  copyright_risk: 10,
  stem_repetition: 4,
  distractor_pool_reuse: 4,
  mad_lib_pattern: 5,
  generic_explanation: 3,
  non_instructive_explanation: 4,
  missing_context: 5,
}

const ISSUE_IMPACT: Record<ValidationIssueCode, 'high' | 'medium' | 'low'> = {
  missing_question_text: 'high',
  vague_question_text: 'medium',
  missing_explanation: 'high',
  weak_explanation: 'low',
  explanation_repeats_question: 'medium',
  invalid_difficulty: 'medium',
  invalid_domain_id: 'low',
  invalid_options_type: 'high',
  insufficient_options: 'high',
  duplicate_options: 'high',
  empty_option: 'high',
  option_matches_stem: 'medium',
  invalid_correct_option: 'high',
  duplicate_stem: 'medium',
  duplicate_explanation: 'medium',
  duplicate_scenario_pattern: 'medium',
  template_count_low: 'high',
  domain_coverage_warning: 'low',
  exam_mismatch: 'high',
  bad_distractors: 'high',
  hallucination: 'high',
  copyright_risk: 'high',
  stem_repetition: 'medium',
  distractor_pool_reuse: 'medium',
  mad_lib_pattern: 'high',
  generic_explanation: 'low',
  non_instructive_explanation: 'medium',
  missing_context: 'high',
}

function computeQualityScore(totalQuestions: number, issues: ValidationIssue[]): number {
  if (totalQuestions <= 0) return 100
  const weightedPenalty = issues.reduce((sum, i) => sum + (ISSUE_WEIGHTS[i.code] || 1), 0)
  const perQuestionPenalty = weightedPenalty / totalQuestions
  const score = Math.round(Math.max(0, 100 - perQuestionPenalty))
  return Math.min(100, score)
}

function parseGeminiJson(text: string): GeminiSignal[] {
  const raw = text.trim()
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  try {
    const parsed = JSON.parse(cleaned) as unknown
    if (!Array.isArray(parsed)) return []
    const out: GeminiSignal[] = []
    for (const row of parsed) {
      if (!row || typeof row !== 'object') continue
      const questionId = String((row as { questionId?: unknown }).questionId || '')
      if (!questionId) continue
      const flagsRaw = (row as { flags?: unknown }).flags
      const flags: GeminiSignal['flags'] = []
      if (Array.isArray(flagsRaw)) {
        for (const f of flagsRaw) {
          if (
            f === 'exam_mismatch' ||
            f === 'bad_distractors' ||
            f === 'hallucination' ||
            f === 'copyright_risk' ||
            f === 'stem_repetition' ||
            f === 'distractor_pool_reuse' ||
            f === 'mad_lib_pattern' ||
            f === 'generic_explanation' ||
            f === 'non_instructive_explanation' ||
            f === 'missing_context'
          ) {
            flags.push(f)
          }
        }
      }
      out.push({
        questionId,
        flags,
        notes: typeof (row as { notes?: unknown }).notes === 'string' ? (row as { notes: string }).notes : undefined,
      })
    }
    return out
  } catch {
    return []
  }
}

async function geminiBatchValidate(
  apiKey: string,
  exam: { slug: string; name: string; provider: string },
  rows: QuestionExportRow[],
): Promise<GeminiSignal[]> {
  if (rows.length === 0) return []
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const prompt = [
    'You are validating cloud exam practice MCQs.',
    `Exam: ${exam.name} (${exam.slug}), provider: ${exam.provider}.`,
    'For each question return JSON array with objects:',
    '{ "questionId": string, "flags": string[], "notes": string }',
    'Allowed flags: exam_mismatch, bad_distractors, hallucination, copyright_risk',
    'Additional allowed flags: stem_repetition, distractor_pool_reuse, mad_lib_pattern, generic_explanation, non_instructive_explanation, missing_context',
    'Use empty flags if no issue.',
    'Flag exam_mismatch for advanced content that does not suit foundational exams.',
    'Flag bad_distractors if options are nonsense, non-existent services, or obviously wrong.',
    'Flag hallucination for factual technical inaccuracies.',
    'Flag copyright_risk for content resembling leaked/copyrighted real exam items.',
    'Flag stem_repetition if stem shape repeats previous questions too closely.',
    'Flag distractor_pool_reuse if same distractor set repeats excessively.',
    'Flag mad_lib_pattern for same sentence with token swaps (company names, numbers, regions).',
    'Flag generic_explanation if explanation is generic and not teaching the concept.',
    'Flag non_instructive_explanation if explanation does not justify why correct option is correct and others are wrong.',
    'Flag missing_context when stem lacks requirement/constraint/context for a decision.',
    'Respond with JSON only, no prose.',
    '',
    JSON.stringify(
      rows.map((q) => ({
        questionId: q.id,
        question_text: q.question_text,
        options: normalizeOptions(q.options),
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
      })),
    ),
  ].join('\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
  )
  if (!response.ok) return []
  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return parseGeminiJson(text)
}

function requiredTemplateMinimum(total: number): number {
  if (total >= 1000) return 200
  if (total >= 500) return 100
  return Math.max(30, Math.floor(total / 5))
}

export async function validateQuestionBank(
  exam: { slug: string; name: string; provider: string },
  rows: QuestionExportRow[],
  useGemini: boolean,
  onProgress?: (progress: ValidationProgress) => void | Promise<void>,
): Promise<ValidationResult> {
  const geminiConfigured = !!(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim())
  let geminiBatches = 0
  let geminiFlags = 0

  const issues: ValidationIssue[] = []
  const stemSeen = new Map<string, string>()
  const explanationSeen = new Map<string, string>()
  const templateSeen = new Map<string, string>()
  const domainCounts = new Map<string, number>()

  for (const row of rows) {
    const qText = String(row.question_text || '').trim()
    const explanation = String(row.explanation || '').trim()
    const difficulty = String(row.difficulty || '').trim()
    const domain = row.domain?.trim() || null
    const options = normalizeOptions(row.options)

    if (!qText) {
      issues.push({ questionId: row.id, code: 'missing_question_text', severity: 'error', message: 'question_text is missing.' })
    } else {
      const low = normalizeText(qText)
      if (VAGUE_PATTERNS.some((rx) => rx.test(low))) {
        issues.push({ questionId: row.id, code: 'vague_question_text', severity: 'error', message: 'Question stem is too vague and lacks concrete requirement/context.' })
      }
      const prior = stemSeen.get(low)
      if (prior && prior !== row.id) {
        issues.push({ questionId: row.id, code: 'duplicate_stem', severity: 'warning', message: `Stem duplicates question ${prior}.` })
      } else {
        stemSeen.set(low, row.id)
      }

      const sig = scenarioTemplateSignature(qText)
      const priorSig = templateSeen.get(sig)
      if (priorSig && priorSig !== row.id) {
        issues.push({ questionId: row.id, code: 'duplicate_scenario_pattern', severity: 'warning', message: `Scenario template repeats question ${priorSig}.` })
      } else {
        templateSeen.set(sig, row.id)
      }
    }

    if (!explanation) {
      issues.push({ questionId: row.id, code: 'missing_explanation', severity: 'error', message: 'Explanation is required.' })
    } else {
      if (explanation.length < 24) {
        issues.push({ questionId: row.id, code: 'weak_explanation', severity: 'warning', message: 'Explanation is very short or generic.' })
      }
      const expNorm = normalizeText(explanation)
      if (qText && expNorm === normalizeText(qText)) {
        issues.push({ questionId: row.id, code: 'explanation_repeats_question', severity: 'error', message: 'Explanation repeats the question text.' })
      }
      const prior = explanationSeen.get(expNorm)
      if (prior && prior !== row.id) {
        issues.push({ questionId: row.id, code: 'duplicate_explanation', severity: 'warning', message: `Explanation duplicates question ${prior}.` })
      } else {
        explanationSeen.set(expNorm, row.id)
      }
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      issues.push({ questionId: row.id, code: 'invalid_difficulty', severity: 'error', message: 'difficulty must be easy, medium, or hard.' })
    }

    if (domain) {
      if (!UUID_RE.test(domain)) {
        issues.push({ questionId: row.id, code: 'invalid_domain_id', severity: 'error', message: 'domain must be UUID or null.' })
      }
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1)
    }

    if (!Array.isArray(row.options)) {
      issues.push({ questionId: row.id, code: 'invalid_options_type', severity: 'error', message: 'options must be an array.' })
    }
    if (options.length < 4) {
      issues.push({ questionId: row.id, code: 'insufficient_options', severity: 'error', message: 'At least 4 options are required.' })
    }

    const optionTextSet = new Set<string>()
    for (const opt of options) {
      const t = String(opt.text || '').trim()
      if (!t) {
        issues.push({ questionId: row.id, code: 'empty_option', severity: 'error', message: 'Option text cannot be empty.' })
      }
      const k = normalizeText(t)
      if (optionTextSet.has(k)) {
        issues.push({ questionId: row.id, code: 'duplicate_options', severity: 'error', message: 'Option texts must be unique.' })
      } else {
        optionTextSet.add(k)
      }
      if (qText && k && k === normalizeText(qText)) {
        issues.push({ questionId: row.id, code: 'option_matches_stem', severity: 'error', message: 'Option cannot equal the full question stem.' })
      }
    }

    const optionIds = new Set(options.map((o) => String(o.id || '').trim()))
    if (!optionIds.has(String(row.correct_option_id || '').trim())) {
      issues.push({ questionId: row.id, code: 'invalid_correct_option', severity: 'error', message: 'correct_option_id must match one of the option IDs.' })
    }
  }

  const requiredTemplates = requiredTemplateMinimum(rows.length)
  if (templateSeen.size < requiredTemplates) {
    issues.push({
      code: 'template_count_low',
      severity: 'error',
      message: `Template diversity too low: ${templateSeen.size} unique templates, minimum ${requiredTemplates} required.`,
    })
  }

  if (domainCounts.size === 0) {
    issues.push({
      code: 'domain_coverage_warning',
      severity: 'warning',
      message: 'No domain IDs set. Coverage reporting is limited.',
    })
  }

  await onProgress?.({
    stage: 'rules',
    completed: 1,
    total: 1,
    message: 'Rule validation complete.',
  })

  if (useGemini) {
    const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || ''
    if (apiKey) {
      const batchSize = 30
      const totalBatches = Math.max(1, Math.ceil(rows.length / batchSize))
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const signals = await geminiBatchValidate(apiKey, exam, batch)
        geminiBatches += 1
        for (const s of signals) {
          for (const flag of s.flags) {
            const severity: ValidationSeverity =
              flag === 'copyright_risk' || flag === 'hallucination' || flag === 'exam_mismatch'
                ? 'error'
                : 'warning'
            issues.push({
              questionId: s.questionId,
              code: flag,
              severity,
              message: s.notes || `Gemini flagged ${flag}.`,
            })
            geminiFlags += 1
          }
        }
        const completedBatches = Math.floor(i / batchSize) + 1
        await onProgress?.({
          stage: 'gemini',
          completed: completedBatches,
          total: totalBatches,
          message: `Gemini validation batch ${completedBatches}/${totalBatches}`,
        })
      }
    }
  }

  const domainCoverage: DomainCoverage[] = [...domainCounts.entries()]
    .map(([d, count]) => ({ domain: d, count }))
    .sort((a, b) => b.count - a.count)

  const issueCounts = buildIssueCounts(issues)
  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const qualityScore = computeQualityScore(rows.length, issues)
  const topFixes = (Object.entries(issueCounts) as Array<[ValidationIssueCode, number]>)
    .sort((a, b) => (ISSUE_WEIGHTS[b[0]] || 0) * b[1] - (ISSUE_WEIGHTS[a[0]] || 0) * a[1])
    .slice(0, 8)
    .map(([code, count]) => ({ code, count, impact: ISSUE_IMPACT[code] }))
  const pass = errorCount === 0 && qualityScore >= 70 && requiredTemplates <= templateSeen.size

  return {
    summary: {
      examSlug: exam.slug,
      examName: exam.name,
      totalQuestions: rows.length,
      templateEstimate: templateSeen.size,
      requiredTemplateMinimum: requiredTemplates,
      issueCounts,
      errorCount,
      warningCount,
      domainCoverage,
      qualityScore,
      pass,
      topFixes,
    },
    issues,
    meta: {
      geminiRequested: useGemini,
      geminiConfigured,
      geminiApplied: useGemini && geminiConfigured && geminiBatches > 0,
      geminiBatches,
      geminiFlags,
    },
  }
}
