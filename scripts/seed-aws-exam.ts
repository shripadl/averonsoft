/**
 * Staged seed: inserts up to 50 questions per run for selected AWS exam until 1,000 exist.
 *
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 *
 * Usage:
 *   npx --yes tsx scripts/seed-aws-exam.ts --exam aws-clf-c02
 *   npx --yes tsx scripts/seed-aws-exam.ts --exam aws-dva-c02
 *   npx --yes tsx scripts/seed-aws-exam.ts --exam aws-soa-c02
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  AWS_SAA_C03_BATCH_SIZE,
  AWS_SAA_C03_TARGET_COUNT,
  buildAwsSaaC03Question,
} from '@/lib/practice/generators/aws-saa-c03'

const EXAMS: Record<string, { name: string; description: string }> = {
  'aws-saa-c03': {
    name: 'AWS Certified Solutions Architect – Associate (practice)',
    description:
      'Unofficial SAA-style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
  },
  'aws-clf-c02': {
    name: 'AWS Certified Cloud Practitioner (practice)',
    description:
      'Unofficial CLF-style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
  },
  'aws-dva-c02': {
    name: 'AWS Certified Developer – Associate (practice)',
    description:
      'Unofficial DVA-style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
  },
  'aws-soa-c02': {
    name: 'AWS Certified SysOps Administrator – Associate (practice)',
    description:
      'Unofficial SOA-style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
  },
}

const optionSchema = z.object({ id: z.string(), text: z.string().min(1) })
const questionSchema = z.object({
  question_text: z.string().min(20),
  options: z.tuple([optionSchema, optionSchema, optionSchema, optionSchema]),
  correct_option_id: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

function stableQuestionUuid(examSlug: string, globalIndex: number): string {
  const h = createHash('sha1')
    .update(`averonsoft.practice|${examSlug}|question|v1|${globalIndex}`)
    .digest()
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
  const content = readFileSync(fullPath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
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
    throw new Error('Missing --exam <slug>. Use aws-clf-c02 | aws-dva-c02 | aws-soa-c02')
  }
  return process.argv[idx + 1]!
}

async function main() {
  loadEnvFile('.env.local')
  loadEnvFile('.env')
  const examSlug = parseExamSlug()
  const exam = EXAMS[examSlug]
  if (!exam) throw new Error(`Unsupported exam slug: ${examSlug}`)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data: existingExam } = await supabase.from('exams').select('id').eq('slug', examSlug).maybeSingle()
  if (!existingExam) {
    const { error } = await supabase.from('exams').insert({
      slug: examSlug,
      name: exam.name,
      provider: 'AWS',
      description: exam.description,
      total_questions: 0,
      is_active: true,
    })
    if (error) throw error
  }

  const { data: examRow, error: examErr } = await supabase.from('exams').select('id').eq('slug', examSlug).single()
  if (examErr || !examRow) throw new Error(`Could not load exam ${examSlug}`)

  const { count, error: countErr } = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examRow.id)
  if (countErr) throw countErr

  const current = count ?? 0
  if (current >= AWS_SAA_C03_TARGET_COUNT) {
    console.log(`[${examSlug}] Already at ${current} questions (target ${AWS_SAA_C03_TARGET_COUNT}). Nothing to do.`)
    return
  }

  const toInsert = Math.min(AWS_SAA_C03_BATCH_SIZE, AWS_SAA_C03_TARGET_COUNT - current)
  const rows = []
  for (let i = 0; i < toInsert; i += 1) {
    const globalIndex = current + i
    const q = buildAwsSaaC03Question(globalIndex)
    const parsed = questionSchema.parse({
      question_text: q.question_text,
      options: q.options,
      correct_option_id: q.correct_option_id,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })
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
  const { error: updErr } = await supabase
    .from('exams')
    .update({ total_questions: total, updated_at: new Date().toISOString() })
    .eq('id', examRow.id)
  if (updErr) throw updErr

  console.log(`[${examSlug}] before=${current} batch=${toInsert} after=${total} target=${AWS_SAA_C03_TARGET_COUNT}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

