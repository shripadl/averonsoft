import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/practice/auth'
import { getExamBySlug, scoreExamAnswers, getUserAttemptCount, canUserStartAttempt } from '@/lib/practice/service'
import { consumeAttempt } from '@/lib/practice/entitlements'

export async function POST(request: NextRequest, { params }: { params: Promise<{ examSlug: string }> }) {
  const { examSlug } = await params
  const auth = await requireAuthenticatedUser()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const attemptId = body?.attemptId || crypto.randomUUID()
  const answers = Array.isArray(body?.answers) ? body.answers : []
  const questionIds = Array.isArray(body?.questionIds) ? body.questionIds : []

  const exam = await getExamBySlug(auth.supabase, examSlug)
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const { data: existingAttempt } = await auth.supabase
    .from('user_exam_attempts')
    .select('id')
    .eq('id', attemptId)
    .eq('user_id', auth.user.id)
    .eq('exam_id', exam.id)
    .maybeSingle()

  if (!existingAttempt) {
    const gate = await canUserStartAttempt(auth.supabase, auth.user.id, exam)
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
    const consumption = await consumeAttempt(auth.supabase, auth.user.id, exam.slug)
    if (!consumption) {
      return NextResponse.json(
        {
          error: 'No attempts remaining',
          code: 'PAYWALL_REQUIRED',
          paywall: gate.paywall,
        },
        { status: 402 },
      )
    }
  }

  if (questionIds.length === 0) {
    return NextResponse.json({ error: 'questionIds is required' }, { status: 400 })
  }

  const { data: questions, error: questionsError } = await auth.supabase
    .from('exam_questions')
    .select('id, question_text, options, correct_option_id, explanation')
    .eq('exam_id', exam.id)
    .eq('is_outdated', false)
    .in('id', questionIds)

  if (questionsError) {
    return NextResponse.json({ error: questionsError.message }, { status: 500 })
  }

  const scored = scoreExamAnswers(questions || [], answers)
  const attemptCount = await getUserAttemptCount(auth.supabase, auth.user.id, exam.id)

  const { error: attemptError } = await auth.supabase.from('user_exam_attempts').upsert(
    {
      id: attemptId,
      user_id: auth.user.id,
      exam_id: exam.id,
      score: scored.score,
      total_questions: scored.totalQuestions,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      attempt_number_for_exam: attemptCount + 1,
    },
    { onConflict: 'id' },
  )

  if (attemptError) {
    return NextResponse.json({ error: attemptError.message }, { status: 500 })
  }

  const responseRows = scored.perQuestion.map((item) => ({
    attempt_id: attemptId,
    question_id: item.questionId,
    selected_option_id: item.selectedOptionId,
    is_correct: item.isCorrect,
  }))

  const { error: responseError } = await auth.supabase
    .from('user_exam_responses')
    .upsert(responseRows, { onConflict: 'attempt_id,question_id' })

  if (responseError) {
    return NextResponse.json({ error: responseError.message }, { status: 500 })
  }

  return NextResponse.json({
    attemptId,
    score: scored.score,
    totalQuestions: scored.totalQuestions,
    perQuestion: scored.perQuestion,
  })
}
