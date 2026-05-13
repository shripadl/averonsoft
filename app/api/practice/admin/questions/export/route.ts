import { NextRequest, NextResponse } from 'next/server'
import { requirePracticeAdmin } from '@/lib/practice/auth'
import {
  formatExamBankTxtHeader,
  formatQuestionBlock,
  safeExportFilenameSlug,
  type QuestionExportRow,
} from '@/lib/practice/format-question-bank-export'

const BATCH = 400

async function loadAllExportRows(
  supabase: { from: (t: string) => any },
  examId: string,
  total: number,
): Promise<{ rows: QuestionExportRow[]; error?: string }> {
  const rows: QuestionExportRow[] = []
  let offset = 0
  for (;;) {
    const { data: batchRows, error } = await supabase
      .from('exam_questions')
      .select(
        'id, question_text, options, correct_option_id, explanation, difficulty, domain, is_outdated',
      )
      .eq('exam_id', examId)
      .order('id', { ascending: true })
      .range(offset, offset + BATCH - 1)

    if (error) return { rows: [], error: error.message }
    const batch = (batchRows || []) as QuestionExportRow[]
    if (batch.length === 0) break
    rows.push(...batch)
    offset += batch.length
    if (offset >= total) break
  }
  return { rows }
}

/**
 * GET full question bank (admin only).
 * Query: examSlug (required), format=txt | json (default txt)
 */
export async function GET(request: NextRequest) {
  const auth = await requirePracticeAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const examSlug = request.nextUrl.searchParams.get('examSlug')?.trim()
  if (!examSlug) {
    return NextResponse.json({ error: 'examSlug query is required' }, { status: 400 })
  }

  const { data: exam, error: examError } = await auth.supabase
    .from('exams')
    .select('id, slug, name')
    .eq('slug', examSlug)
    .single()

  if (examError || !exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const format = (request.nextUrl.searchParams.get('format') || 'txt').trim().toLowerCase()
  if (format !== 'txt' && format !== 'json') {
    return NextResponse.json({ error: 'format must be txt or json' }, { status: 400 })
  }

  const { count, error: countError } = await auth.supabase
    .from('exam_questions')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', exam.id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  const total = count ?? 0
  const loaded = await loadAllExportRows(auth.supabase, exam.id, total)
  if (loaded.error) {
    return NextResponse.json({ error: loaded.error }, { status: 500 })
  }

  const safeSlug = safeExportFilenameSlug(exam.slug)

  if (format === 'json') {
    const payload = {
      export: {
        exam: { id: exam.id, slug: exam.slug, name: exam.name },
        generatedAt: new Date().toISOString(),
        questionCount: total,
        disclaimer:
          'For internal / validator review only. Original practice content; not official certification exam material.',
        questions: loaded.rows.map((row, i) => ({
          index: i + 1,
          id: row.id,
          question_text: row.question_text,
          options: row.options,
          correct_option_id: row.correct_option_id,
          explanation: row.explanation,
          difficulty: row.difficulty,
          domain: row.domain,
          is_outdated: row.is_outdated,
        })),
      },
    }
    const body = JSON.stringify(payload, null, 2)
    const filename = `${safeSlug}-question-bank.json`
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const chunks: string[] = [formatExamBankTxtHeader(exam.name, exam.slug, total)]
  loaded.rows.forEach((row, i) => {
    chunks.push(formatQuestionBlock(i + 1, total, row))
  })

  const body = chunks.join('')
  const filename = `${safeSlug}-question-bank.txt`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
