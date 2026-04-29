import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/practice/auth'
import { getExamBySlug, canUserStartAttempt, buildQuestionSet } from '@/lib/practice/service'
import { DEFAULT_ATTEMPT_QUESTION_COUNT } from '@/lib/practice/constants'

export async function GET(request: NextRequest, { params }: { params: Promise<{ examSlug: string }> }) {
  const { examSlug } = await params
  const auth = await requireAuthenticatedUser()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const exam = await getExamBySlug(auth.supabase, examSlug)
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const url = new URL(request.url)
  const attemptIdParam = url.searchParams.get('attemptId')

  const gate = await canUserStartAttempt(auth.supabase, auth.user.id, exam, attemptIdParam)
  if (!gate.allowed) {
    return NextResponse.json(
      {
        error: 'No attempts remaining',
        code: gate.reason,
        paywall: gate.paywall,
      },
      { status: 402 },
    )
  }

  const attemptId = attemptIdParam || crypto.randomUUID()
  const limit = Number(url.searchParams.get('limit') || DEFAULT_ATTEMPT_QUESTION_COUNT)

  const { data: questions, error } = await auth.supabase
    .from('exam_questions')
    .select('id, question_text, options')
    .eq('exam_id', exam.id)
    .eq('is_outdated', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const set = buildQuestionSet(questions || [], attemptId, limit)
  return NextResponse.json({
    exam: { id: exam.id, slug: exam.slug, name: exam.name },
    attemptId,
    attemptCount: gate.attemptCount,
    questions: set,
  })
}
