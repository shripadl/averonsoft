/**
 * Staged seed: inserts up to 50 questions per run for aws-saa-c03 until 1,000 exist.
 *
 * These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.
 *
 * Usage (from repo root, with env):
 *   npx tsx scripts/seed-aws-saa-c03.ts
 *   npx tsx scripts/seed-aws-saa-c03.ts --dry-run
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  AWS_SAA_C03_BATCH_SIZE,
  AWS_SAA_C03_EXAM_SLUG,
  AWS_SAA_C03_TARGET_COUNT,
  buildAwsSaaC03Question,
} from '@/lib/practice/generators/aws-saa-c03'

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
})

const questionSchema = z.object({
  question_text: z.string().min(20),
  options: z.tuple([optionSchema, optionSchema, optionSchema, optionSchema]),
  correct_option_id: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

function assertOptionsValid(q: {
  options: { id: string; text: string }[]
  correct_option_id: string
}) {
  const ids = new Set(q.options.map((o) => o.id))
  if (ids.size !== 4) throw new Error('Option ids must be unique')
  if (!q.options.some((o) => o.id === q.correct_option_id)) {
    throw new Error(`correct_option_id ${q.correct_option_id} not in options`)
  }
}

function stableQuestionUuid(examSlug: string, globalIndex: number): string {
  const h = createHash('sha1')
    .update(`averonsoft.practice|${examSlug}|question|v1|${globalIndex}`)
    .digest()
  const b = Buffer.alloc(16)
  h.copy(b, 0, 0, 16)
  b[6] = (b[6]! & 0x0f) | 0x50 // version 5-like nibble
  b[7] = (b[7]! & 0x3f) | 0x80
  const hex = b.toString('hex')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

const dryRun = process.argv.includes('--dry-run')
loadEnvFile('.env.local')
loadEnvFile('.env')

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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!dryRun && (!url || !key)) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

  const examRow = {
    slug: AWS_SAA_C03_EXAM_SLUG,
    name: 'AWS Certified Solutions Architect – Associate (practice)',
    provider: 'AWS',
    description:
      'Unofficial SAA–style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
    is_active: true,
  }

  if (!dryRun && supabase) {
    const { data: existing, error: e1 } = await supabase
      .from('exams')
      .select('id, total_questions')
      .eq('slug', AWS_SAA_C03_EXAM_SLUG)
      .maybeSingle()

    if (e1) {
      console.error('Failed to read exam:', e1.message)
      process.exit(1)
    }

    if (!existing) {
      const { error: e2 } = await supabase.from('exams').insert({
        ...examRow,
        total_questions: 0,
      })
      if (e2) {
        console.error('Failed to insert exam:', e2.message)
        process.exit(1)
      }
    }
  }

  let examId: string
  if (dryRun) {
    examId = '00000000-0000-0000-0000-000000000000'
  } else {
    const { data: row, error } = await supabase!.from('exams').select('id').eq('slug', AWS_SAA_C03_EXAM_SLUG).single()
    if (error || !row) {
      console.error('Could not load exam id')
      process.exit(1)
    }
    examId = row.id
  }

  const { count, error: cErr } = dryRun
    ? { count: 0, error: null }
    : await supabase!
        .from('exam_questions')
        .select('id', { count: 'exact', head: true })
        .eq('exam_id', examId)

  if (cErr) {
    console.error('Count failed:', cErr.message)
    process.exit(1)
  }

  const current = count ?? 0
  if (current >= AWS_SAA_C03_TARGET_COUNT) {
    console.log(
      `Already at ${current} questions (target ${AWS_SAA_C03_TARGET_COUNT}). Nothing to do.`,
    )
    return
  }

  const toInsert = Math.min(AWS_SAA_C03_BATCH_SIZE, AWS_SAA_C03_TARGET_COUNT - current)
  const rows: Record<string, unknown>[] = []
  const preview: Record<string, unknown>[] = []

  for (let i = 0; i < toInsert; i += 1) {
    const globalIndex = current + i
    const q = buildAwsSaaC03Question(globalIndex)
    assertOptionsValid(q)
    const parsed = questionSchema.safeParse({
      question_text: q.question_text,
      options: q.options,
      correct_option_id: q.correct_option_id,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })
    if (!parsed.success) {
      console.error('Validation failed at index', globalIndex, parsed.error.flatten())
      process.exit(1)
    }

    const id = stableQuestionUuid(AWS_SAA_C03_EXAM_SLUG, globalIndex)
    rows.push({
      id,
      exam_id: examId,
      question_text: q.question_text,
      options: q.options,
      correct_option_id: q.correct_option_id,
      explanation: q.explanation,
      difficulty: q.difficulty,
      is_outdated: false,
      last_reviewed_at: new Date().toISOString(),
    })
    if (i < 3) {
      preview.push({
        globalIndex,
        question_text: q.question_text,
        options: q.options,
        correct_option_id: q.correct_option_id,
        difficulty: q.difficulty,
      })
    }
  }

  const outDir = join(process.cwd(), 'scripts', 'output')
  mkdirSync(outDir, { recursive: true })
  const previewPath = join(outDir, 'aws-saa-c03-last-batch-preview.json')
  writeFileSync(
    previewPath,
    JSON.stringify(
      {
        exam: AWS_SAA_C03_EXAM_SLUG,
        beforeCount: current,
        batchSize: toInsert,
        afterCount: current + toInsert,
        target: AWS_SAA_C03_TARGET_COUNT,
        sampleQuestions: preview,
        legal:
          'These questions are original and unofficial. Not affiliated with AWS, Microsoft, or Google.',
      },
      null,
      2,
    ),
    'utf8',
  )

  console.log('--- AWS SAA-C03 staged seed ---')
  console.log(`Running total before: ${current}`)
  console.log(`This batch: ${toInsert} (target ${AWS_SAA_C03_TARGET_COUNT})`)
  console.log(`Running total after:  ${current + toInsert}`)
  console.log(`JSON preview: ${previewPath}`)

  if (dryRun) {
    console.log('Dry run: no database writes.')
    return
  }

  const { error: upErr } = await supabase!.from('exam_questions').upsert(rows, { onConflict: 'id' })
  if (upErr) {
    console.error('Upsert failed:', upErr.message)
    process.exit(1)
  }

  const { count: newCount, error: nErr } = await supabase!
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examId)
  if (nErr) {
    console.error('Re-count failed:', nErr.message)
    process.exit(1)
  }

  const total = newCount ?? 0
  const { error: u2 } = await supabase!
    .from('exams')
    .update({ total_questions: total, updated_at: new Date().toISOString() })
    .eq('id', examId)
  if (u2) {
    console.error('Failed to update exam total_questions:', u2.message)
    process.exit(1)
  }

  console.log(`Done. exam_questions count for this exam: ${total}`)
  if (total < AWS_SAA_C03_TARGET_COUNT) {
    console.log(`Run again (same command) to insert the next batch until ${AWS_SAA_C03_TARGET_COUNT}.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
