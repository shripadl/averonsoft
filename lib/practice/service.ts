import { DEFAULT_ATTEMPT_QUESTION_COUNT } from '@/lib/practice/constants'
import type { SubmitAnswerInput } from '@/lib/practice/types'
import { seededShuffle } from '@/lib/practice/shuffle'
import { getAttemptsRemaining } from '@/lib/practice/entitlements'

interface DbClient {
  from: (table: string) => any
}

export async function getExamBySlug(supabase: DbClient, examSlug: string) {
  const { data: exam, error } = await supabase
    .from('exams')
    .select('*')
    .eq('slug', examSlug)
    .eq('is_active', true)
    .single()

  if (error || !exam) return null
  return exam
}

export async function getUserAttemptCount(supabase: DbClient, userId: string, examId: string) {
  const { count, error } = await supabase
    .from('user_exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('exam_id', examId)

  if (error) throw error
  return count ?? 0
}

export async function canUserStartAttempt(
  supabase: DbClient,
  userId: string,
  exam: { id: string; slug?: string; provider?: string },
) {
  const attemptsState = await getAttemptsRemaining(supabase, userId, exam.slug || '')
  const attemptCount = await getUserAttemptCount(supabase, userId, exam.id)
  if (attemptsState.totalAttemptsRemaining > 0) {
    return {
      allowed: true,
      reason: null,
      attemptCount,
      attemptsRemaining: attemptsState.totalAttemptsRemaining,
      paywall: null,
    }
  }
  return {
    allowed: false,
    reason: 'PAYWALL_REQUIRED',
    attemptCount,
    attemptsRemaining: 0,
    paywall: {
      examId: exam.id,
      examSlug: exam.slug || null,
      provider: exam.provider || 'Other',
      message: 'Your free attempt is used and no paid attempts remain for this exam.',
      redirectTo: `/exam-payment-plans?exam=${encodeURIComponent(exam.slug || '')}`,
    },
  }
}

export function buildQuestionSet(questions: any[], attemptId: string, limit = DEFAULT_ATTEMPT_QUESTION_COUNT) {
  return seededShuffle(questions, attemptId).slice(0, Math.max(1, limit))
}

export function scoreExamAnswers(
  questions: Array<{ id: string; correct_option_id: string; explanation: string; options: Array<{ id: string; text: string }>; question_text: string }>,
  answers: SubmitAnswerInput[],
) {
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]))
  let score = 0

  const perQuestion = questions.map((question) => {
    const selectedOptionId = answerByQuestion.get(question.id) ?? null
    const isCorrect = selectedOptionId === question.correct_option_id
    if (isCorrect) score += 1

    return {
      questionId: question.id,
      questionText: question.question_text,
      selectedOptionId,
      correctOptionId: question.correct_option_id,
      options: question.options,
      isCorrect,
      explanation: question.explanation,
    }
  })

  return {
    score,
    totalQuestions: questions.length,
    perQuestion,
  }
}
