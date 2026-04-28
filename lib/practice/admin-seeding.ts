import { createHash } from 'node:crypto'
import { z } from 'zod'
import { AWS_SAA_C03_BATCH_SIZE, AWS_SAA_C03_TARGET_COUNT, buildAwsSaaC03Question } from '@/lib/practice/generators/aws-saa-c03'
import { BATCH_SIZE, EXAM_PROFILES, TARGET_COUNT, buildCloudQuestion } from '@/lib/practice/generators/cloud-cert'
import { DEVOPS_BATCH_SIZE, DEVOPS_EXAM_PROFILES, DEVOPS_TARGET_COUNT, buildDevOpsQuestion } from '@/lib/practice/generators/devops-cert'

const optionSchema = z.object({ id: z.enum(['A', 'B', 'C', 'D']), text: z.string().min(1) })
const questionSchema = z.object({
  question_text: z.string().min(20),
  options: z.tuple([optionSchema, optionSchema, optionSchema, optionSchema]),
  correct_option_id: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  domain: z.string().min(2).max(120).optional(),
})

const AWS_EXAMS: Record<string, { name: string; description: string }> = {
  'aws-clf-c02': {
    name: 'AWS Certified Cloud Practitioner (practice)',
    description:
      'Unofficial CLF-style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
  },
  'aws-saa-c03': {
    name: 'AWS Certified Solutions Architect – Associate (practice)',
    description:
      'Unofficial SAA-style practice bank for learning. Not affiliated with or endorsed by Amazon Web Services. Questions are original and for preparation only.',
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

const ALL_SUPPORTED_EXAMS = new Set([
  ...Object.keys(AWS_EXAMS),
  ...Object.keys(EXAM_PROFILES),
  ...Object.keys(DEVOPS_EXAM_PROFILES),
])

interface SupabaseLike {
  from: (table: string) => any
}

function stableQuestionUuid(examSlug: string, globalIndex: number): string {
  const versionTag = examSlug.startsWith('aws-') ? 'v1' : 'v2'
  const h = createHash('sha1')
    .update(`averonsoft.practice|${examSlug}|question|${versionTag}|${globalIndex}`)
    .digest()
  const b = Buffer.alloc(16)
  h.copy(b, 0, 0, 16)
  b[6] = (b[6]! & 0x0f) | 0x50
  b[7] = (b[7]! & 0x3f) | 0x80
  const hex = b.toString('hex')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-')
}

export async function seedNextBatchForExam(supabase: SupabaseLike, examSlug: string) {
  if (!ALL_SUPPORTED_EXAMS.has(examSlug)) {
    throw new Error(`Unsupported exam slug: ${examSlug}`)
  }

  const isAwsExam = examSlug in AWS_EXAMS
  const isLegacyCloudExam = examSlug in EXAM_PROFILES
  const isDevOpsExam = examSlug in DEVOPS_EXAM_PROFILES
  const target = isAwsExam
    ? AWS_SAA_C03_TARGET_COUNT
    : isLegacyCloudExam
      ? TARGET_COUNT
      : DEVOPS_TARGET_COUNT
  const batch = isAwsExam
    ? AWS_SAA_C03_BATCH_SIZE
    : isLegacyCloudExam
      ? BATCH_SIZE
      : DEVOPS_BATCH_SIZE

  const examSeedMeta = isAwsExam
    ? { provider: 'AWS' as const, ...AWS_EXAMS[examSlug]! }
    : isLegacyCloudExam
      ? {
        provider: EXAM_PROFILES[examSlug]!.provider,
        name: EXAM_PROFILES[examSlug]!.name,
        description: EXAM_PROFILES[examSlug]!.description,
      }
      : {
        provider: DEVOPS_EXAM_PROFILES[examSlug]!.provider,
        name: DEVOPS_EXAM_PROFILES[examSlug]!.name,
        description: DEVOPS_EXAM_PROFILES[examSlug]!.description,
      }

  const { data: existingExam, error: existingErr } = await supabase
    .from('exams')
    .select('id, total_questions')
    .eq('slug', examSlug)
    .maybeSingle()
  if (existingErr) throw existingErr

  if (!existingExam) {
    const { error: createErr } = await supabase.from('exams').insert({
      slug: examSlug,
      name: examSeedMeta.name,
      provider: examSeedMeta.provider,
      description: examSeedMeta.description,
      total_questions: 0,
      is_active: true,
    })
    if (createErr) throw createErr
  }

  const { data: examRow, error: examErr } = await supabase
    .from('exams')
    .select('id')
    .eq('slug', examSlug)
    .single()
  if (examErr || !examRow) throw new Error(`Could not load exam row for ${examSlug}`)

  const { count, error: countErr } = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examRow.id)
  if (countErr) throw countErr

  const beforeCount = count ?? 0
  if (beforeCount >= target) {
    return {
      examSlug,
      beforeCount,
      inserted: 0,
      afterCount: beforeCount,
      target,
      completed: true,
    }
  }

  const toInsert = Math.min(batch, target - beforeCount)
  const rows = buildRowsForRange(examSlug, examRow.id, beforeCount, toInsert, isAwsExam, isLegacyCloudExam, isDevOpsExam)

  const { error: upErr } = await supabase
    .from('exam_questions')
    .upsert(rows, { onConflict: 'id' })
  if (upErr) throw upErr

  const { count: afterCountRaw, error: recountErr } = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examRow.id)
  if (recountErr) throw recountErr

  const afterCount = afterCountRaw ?? beforeCount
  const { error: updErr } = await supabase
    .from('exams')
    .update({ total_questions: afterCount, updated_at: new Date().toISOString() })
    .eq('id', examRow.id)
  if (updErr) throw updErr

  return {
    examSlug,
    beforeCount,
    inserted: toInsert,
    afterCount,
    target,
    completed: afterCount >= target,
  }
}

export async function replaceExamBank(supabase: SupabaseLike, examSlug: string) {
  if (!ALL_SUPPORTED_EXAMS.has(examSlug)) {
    throw new Error(`Unsupported exam slug: ${examSlug}`)
  }

  const isAwsExam = examSlug in AWS_EXAMS
  const target = isAwsExam ? AWS_SAA_C03_TARGET_COUNT : TARGET_COUNT

  const { data: examRow, error: examErr } = await supabase
    .from('exams')
    .select('id')
    .eq('slug', examSlug)
    .single()

  if (examErr || !examRow) {
    throw new Error(`Exam not found: ${examSlug}`)
  }

  const { error: deleteErr } = await supabase
    .from('exam_questions')
    .delete()
    .eq('exam_id', examRow.id)
  if (deleteErr) throw deleteErr

  const isLegacyCloudExam = examSlug in EXAM_PROFILES
  const isDevOpsExam = examSlug in DEVOPS_EXAM_PROFILES
  const rows = buildRowsForRange(examSlug, examRow.id, 0, target, isAwsExam, isLegacyCloudExam, isDevOpsExam)
  const { error: insertErr } = await supabase
    .from('exam_questions')
    .insert(rows)
  if (insertErr) throw insertErr

  const { error: updateErr } = await supabase
    .from('exams')
    .update({ total_questions: target, updated_at: new Date().toISOString() })
    .eq('id', examRow.id)
  if (updateErr) throw updateErr

  return {
    examSlug,
    replaced: true,
    inserted: target,
    afterCount: target,
    target,
  }
}

function buildRowsForRange(
  examSlug: string,
  examId: string,
  startIndex: number,
  size: number,
  isAwsExam: boolean,
  isLegacyCloudExam: boolean,
  isDevOpsExam: boolean,
) {
  const rows = []
  for (let i = 0; i < size; i += 1) {
    const globalIndex = startIndex + i
    const built = isAwsExam
      ? buildAwsSaaC03Question(globalIndex)
      : isLegacyCloudExam
        ? buildCloudQuestion(examSlug, globalIndex)
        : isDevOpsExam
          ? buildDevOpsQuestion(examSlug, globalIndex)
          : null
    if (!built) {
      throw new Error(`Unsupported exam slug: ${examSlug}`)
    }
    const parsed = questionSchema.parse({
      question_text: built.question_text,
      options: built.options,
      correct_option_id: built.correct_option_id,
      explanation: built.explanation,
      difficulty: built.difficulty,
      domain: (built as { domain?: string }).domain,
    })
    rows.push({
      id: stableQuestionUuid(examSlug, globalIndex),
      exam_id: examId,
      question_text: parsed.question_text,
      options: parsed.options,
      correct_option_id: parsed.correct_option_id,
      explanation: parsed.explanation,
      difficulty: parsed.difficulty,
      domain: parsed.domain ?? null,
      is_outdated: false,
      last_reviewed_at: new Date().toISOString(),
    })
  }
  return rows
}

