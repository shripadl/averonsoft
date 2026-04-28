import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/practice/auth'
import { getExamBySlug } from '@/lib/practice/service'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ examSlug: string; attemptId: string }> },
) {
  const { examSlug, attemptId } = await params
  const auth = await requireAuthenticatedUser()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const exam = await getExamBySlug(auth.supabase, examSlug)
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const { data: attempt, error: attemptError } = await auth.supabase
    .from('user_exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('exam_id', exam.id)
    .eq('user_id', auth.user.id)
    .single()

  if (attemptError || !attempt) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }

  const { data: responses, error: responsesError } = await auth.supabase
    .from('user_exam_responses')
    .select('question_id, selected_option_id, is_correct')
    .eq('attempt_id', attempt.id)

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 })
  }

  const questionIds = (responses || []).map((item) => item.question_id)
  const { data: questions } = await auth.supabase
    .from('exam_questions')
    .select('id, question_text, options, correct_option_id, explanation')
    .in('id', questionIds)

  const questionMap = new Map((questions || []).map((q) => [q.id, q]))
  const detailedResponses = (responses || []).map((response) => ({
    ...response,
    question: questionMap.get(response.question_id) || null,
  }))

  return NextResponse.json({ attempt, responses: detailedResponses })
}
