import type { PracticeOption } from '@/lib/practice/types'

export type QuestionExportRow = {
  id: string
  question_text: string
  options: unknown
  correct_option_id: string
  explanation: string
  difficulty: string
  domain: string | null
  is_outdated: boolean
}

export function normalizeOptions(raw: unknown): PracticeOption[] {
  if (!Array.isArray(raw)) return []
  const out: PracticeOption[] = []
  for (const o of raw) {
    if (o && typeof o === 'object' && 'id' in o && 'text' in o) {
      out.push({
        id: String((o as { id: unknown }).id),
        text: String((o as { text: unknown }).text),
      })
    }
  }
  return out
}

export function formatExamBankTxtHeader(examName: string, examSlug: string, total: number): string {
  const now = new Date().toISOString()
  return [
    `EXPORT: ${examName}`,
    `Exam slug: ${examSlug}`,
    `Generated (UTC): ${now}`,
    `Question count: ${total}`,
    '',
    'For internal / validator review only. Original practice content; not official certification exam material.',
    '',
    '='.repeat(72),
    '',
  ].join('\n')
}

export function formatQuestionBlock(
  index: number,
  total: number,
  row: QuestionExportRow,
): string {
  const options = normalizeOptions(row.options)
  const lines: string[] = [
    `=== Question ${index} / ${total} ===`,
    `ID: ${row.id}`,
    `Domain: ${row.domain?.trim() || '(none)'} | Difficulty: ${row.difficulty} | Outdated: ${row.is_outdated ? 'yes' : 'no'}`,
    '---',
    'QUESTION:',
    row.question_text.trim(),
    '',
    'OPTIONS:',
  ]
  for (const opt of options) {
    lines.push(`${opt.id}) ${opt.text.trim()}`)
  }
  lines.push(
    '',
    `CORRECT_OPTION_ID: ${row.correct_option_id}`,
    '',
    'EXPLANATION:',
    row.explanation.trim(),
    '',
    '',
  )
  return lines.join('\n')
}

export function safeExportFilenameSlug(slug: string): string {
  const s = slug.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return s.slice(0, 80) || 'exam'
}
