import { NextRequest, NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'
import { type QuestionExportRow } from '@/lib/practice/format-question-bank-export'
import { validateQuestionBank } from '@/lib/practice/question-bank-validation'

const BATCH = 400

type ValidationRunRow = {
  id: string
  exam_slug: string
  exam_name: string
  provider: string
  use_gemini: boolean
  status: 'running' | 'completed' | 'failed'
  progress_percent: number
  progress_message: string | null
  summary: unknown
  issues: unknown
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

function isSchemaCacheMissing(errorMessage: string | null | undefined) {
  const m = (errorMessage || '').toLowerCase()
  return m.includes('schema cache') && m.includes('practice_question_validation_runs')
}

async function loadAllQuestions(
  supabase: any,
  examId: string,
) {
  const { count, error: countError } = await supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examId)

  if (countError) return { error: countError.message } as const

  const rows: QuestionExportRow[] = []
  const total = count ?? 0
  let offset = 0
  for (;;) {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('id, question_text, options, correct_option_id, explanation, difficulty, domain, is_outdated')
      .eq('exam_id', examId)
      .order('id', { ascending: true })
      .range(offset, offset + BATCH - 1)
    if (error) return { error: error.message } as const
    const batch = (data || []) as QuestionExportRow[]
    if (batch.length === 0) break
    rows.push(...batch)
    offset += batch.length
    if (offset >= total) break
  }
  return { rows } as const
}

function normalizeRun(row: ValidationRunRow) {
  return {
    id: row.id,
    examSlug: row.exam_slug,
    examName: row.exam_name,
    provider: row.provider,
    useGemini: row.use_gemini,
    status: row.status,
    progressPercent: row.progress_percent,
    progressMessage: row.progress_message,
    summary: row.summary,
    issues: row.issues,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const runId = request.nextUrl.searchParams.get('runId')?.trim()
  const examSlug = request.nextUrl.searchParams.get('examSlug')?.trim()

  if (runId) {
    const { data, error } = await auth.supabase
      .from('practice_question_validation_runs')
      .select(
        'id, exam_slug, exam_name, provider, use_gemini, status, progress_percent, progress_message, summary, issues, error_message, created_at, updated_at, completed_at',
      )
      .eq('id', runId)
      .single()
    if (error) {
      if (isSchemaCacheMissing(error.message)) {
        return NextResponse.json({ run: null, schemaCacheMissing: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'Validation run not found' }, { status: 404 })
    return NextResponse.json({ run: normalizeRun(data as ValidationRunRow) })
  }

  let query = auth.supabase
    .from('practice_question_validation_runs')
    .select(
      'id, exam_slug, exam_name, provider, use_gemini, status, progress_percent, progress_message, summary, issues, error_message, created_at, updated_at, completed_at',
    )
    .order('created_at', { ascending: false })
    .limit(20)

  if (examSlug) {
    query = query.eq('exam_slug', examSlug)
  }

  const { data, error } = await query
  if (error) {
    if (isSchemaCacheMissing(error.message)) {
      return NextResponse.json({ runs: [], schemaCacheMissing: true })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ runs: (data || []).map((r) => normalizeRun(r as ValidationRunRow)) })
}

/**
 * POST /api/practice/admin/questions/validate
 * Body:
 *  - { action: 'start', examSlug: string, useGemini?: boolean }
 *  - { action: 'execute', runId: string }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: 'start' | 'execute' | 'direct'
    examSlug?: string
    useGemini?: boolean
    runId?: string
  }

  if (body.action === 'direct') {
    const examSlug = body.examSlug?.trim()
    if (!examSlug) return NextResponse.json({ error: 'examSlug is required' }, { status: 400 })
    const { data: exam, error: examError } = await auth.supabase
      .from('exams')
      .select('id, slug, name, provider')
      .eq('slug', examSlug)
      .single()
    if (examError || !exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    const loaded = await loadAllQuestions(auth.supabase, exam.id)
    if ('error' in loaded) return NextResponse.json({ error: loaded.error }, { status: 500 })
    const result = await validateQuestionBank(
      { slug: exam.slug, name: exam.name, provider: exam.provider || '' },
      loaded.rows,
      body.useGemini !== false,
    )
    return NextResponse.json({
      exam: { slug: exam.slug, name: exam.name, provider: exam.provider || '' },
      ...result,
      meta: {
        ...result.meta,
        persistence: 'disabled_schema_cache_missing',
      },
    })
  }

  if (body.action === 'start') {
    const examSlug = body.examSlug?.trim()
    if (!examSlug) return NextResponse.json({ error: 'examSlug is required' }, { status: 400 })

    const { data: exam, error: examError } = await auth.supabase
      .from('exams')
      .select('slug, name, provider')
      .eq('slug', examSlug)
      .single()
    if (examError || !exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    const { data: run, error: runError } = await auth.supabase
      .from('practice_question_validation_runs')
      .insert({
        user_id: auth.user.id,
        exam_slug: exam.slug,
        exam_name: exam.name,
        provider: exam.provider || '',
        use_gemini: body.useGemini !== false,
        status: 'running',
        progress_percent: 0,
        progress_message: 'Validation queued.',
      })
      .select('id')
      .single()
    if (runError || !run) {
      if (isSchemaCacheMissing(runError?.message)) {
        return NextResponse.json({ direct: true, schemaCacheMissing: true })
      }
      return NextResponse.json({ error: runError?.message || 'Failed to create run' }, { status: 500 })
    }
    return NextResponse.json({ runId: run.id })
  }

  if (body.action !== 'execute') {
    return NextResponse.json({ error: "action must be 'start' or 'execute'" }, { status: 400 })
  }

  const runId = body.runId?.trim()
  if (!runId) return NextResponse.json({ error: 'runId is required' }, { status: 400 })

  const { data: runRow, error: runErr } = await auth.supabase
    .from('practice_question_validation_runs')
    .select('id, exam_slug, exam_name, provider, use_gemini, status')
    .eq('id', runId)
    .single()
  if (runErr || !runRow) return NextResponse.json({ error: 'Validation run not found' }, { status: 404 })

  const { data: exam, error: examError } = await auth.supabase
    .from('exams')
    .select('id, slug, name, provider')
    .eq('slug', runRow.exam_slug)
    .single()
  if (examError || !exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

  const loaded = await loadAllQuestions(auth.supabase, exam.id)
  if ('error' in loaded) {
    await auth.supabase
      .from('practice_question_validation_runs')
      .update({
        status: 'failed',
        progress_percent: 100,
        progress_message: 'Failed to read question bank.',
        error_message: loaded.error,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', runId)
    return NextResponse.json({ error: loaded.error }, { status: 500 })
  }

  try {
    const result = await validateQuestionBank(
      { slug: exam.slug, name: exam.name, provider: exam.provider || '' },
      loaded.rows,
      runRow.use_gemini,
      async (progress) => {
        const percent =
          progress.stage === 'rules'
            ? 15
            : 15 + Math.round((Math.max(1, progress.completed) / Math.max(1, progress.total)) * 85)
        await auth.supabase
          .from('practice_question_validation_runs')
          .update({
            progress_percent: Math.min(99, percent),
            progress_message: progress.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', runId)
      },
    )

    await auth.supabase
      .from('practice_question_validation_runs')
      .update({
        status: 'completed',
        progress_percent: 100,
        progress_message: 'Validation complete.',
        summary: result.summary,
        issues: result.issues,
        error_message: null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', runId)

    return NextResponse.json({
      runId,
      exam: { slug: exam.slug, name: exam.name, provider: exam.provider || '' },
      ...result,
      meta: {
        ...result.meta,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Validation failed'
    await auth.supabase
      .from('practice_question_validation_runs')
      .update({
        status: 'failed',
        progress_percent: 100,
        progress_message: 'Validation failed.',
        error_message: msg,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', runId)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
