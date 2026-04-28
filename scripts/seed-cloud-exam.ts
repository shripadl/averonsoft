/**
 * Staged seed for Azure/GCP exams:
 * Inserts up to 50 original questions per run until 1,000 exist.
 *
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { BATCH_SIZE, EXAM_PROFILES, TARGET_COUNT, buildCloudQuestion } from '@/lib/practice/generators/cloud-cert'

const optionSchema = z.object({ id: z.enum(['A', 'B', 'C', 'D']), text: z.string().min(1) })
const questionSchema = z.object({
  question_text: z.string().min(20),
  options: z.tuple([optionSchema, optionSchema, optionSchema, optionSchema]),
  correct_option_id: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

function stableQuestionUuid(examSlug: string, globalIndex: number): string {
  const h = createHash('sha1').update(`averonsoft.practice|${examSlug}|question|v2|${globalIndex}`).digest()
  const b = Buffer.alloc(16)
  h.copy(b, 0, 0, 16)
  b[6] = (b[6]! & 0x0f) | 0x50
  b[7] = (b[7]! & 0x3f) | 0x80
  const hex = b.toString('hex')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-')
}

function loadEnvFile(relativePath: string) {
  const fullPath = join(process.cwd(), relativePath)
  if (!existsSync(fullPath)) return
  for (const rawLine of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    if (!key || process.env[key] != null) continue
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

function parseExamSlug(): string {
  const idx = process.argv.indexOf('--exam')
  if (idx === -1 || !process.argv[idx + 1]) {
    throw new Error('Missing --exam <slug>')
  }
  return process.argv[idx + 1]!
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')

  const examSlug = parseExamSlug()
  const profile = EXAM_PROFILES[examSlug]
  if (!profile) throw new Error(`Unsupported exam slug: ${examSlug}`)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data: existing } = await supabase.from('exams').select('id').eq('slug', examSlug).maybeSingle()
  if (!existing) {
    const { error } = await supabase.from('exams').insert({
      slug: examSlug,
      name: profile.name,
      provider: profile.provider,
      description: profile.description,
      total_questions: 0,
      is_active: true,
    })
    if (error) throw error
  }

  const { data: examRow, error: examErr } = await supabase.from('exams').select('id').eq('slug', examSlug).single()
  if (examErr || !examRow) throw new Error(`Could not load exam row for ${examSlug}`)

  const { count, error: countErr } = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examRow.id)
  if (countErr) throw countErr
  const current = count ?? 0
  if (current >= TARGET_COUNT) {
    console.log(`[${examSlug}] Already at ${current} questions (target ${TARGET_COUNT}). Nothing to do.`)
    return
  }

  const toInsert = Math.min(BATCH_SIZE, TARGET_COUNT - current)
  const rows = []
  for (let i = 0; i < toInsert; i += 1) {
    const globalIndex = current + i
    const q = buildCloudQuestion(examSlug, globalIndex)
    const parsed = questionSchema.parse(q)
    rows.push({
      id: stableQuestionUuid(examSlug, globalIndex),
      exam_id: examRow.id,
      question_text: parsed.question_text,
      options: parsed.options,
      correct_option_id: parsed.correct_option_id,
      explanation: parsed.explanation,
      difficulty: parsed.difficulty,
      is_outdated: false,
      last_reviewed_at: new Date().toISOString(),
    })
  }

  const { error: upErr } = await supabase.from('exam_questions').upsert(rows, { onConflict: 'id' })
  if (upErr) throw upErr

  const { count: newCount, error: recountErr } = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examRow.id)
  if (recountErr) throw recountErr

  const total = newCount ?? 0
  const { error: updateErr } = await supabase
    .from('exams')
    .update({ total_questions: total, updated_at: new Date().toISOString() })
    .eq('id', examRow.id)
  if (updateErr) throw updateErr

  console.log(`[${examSlug}] before=${current} batch=${toInsert} after=${total} target=${TARGET_COUNT}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

