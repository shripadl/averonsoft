import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PASS_PERCENTAGE } from '@/lib/practice/constants'
import { LegalDisclaimer } from '@/components/practice/LegalDisclaimer'
import { StartAttemptButton } from '@/components/practice/StartAttemptButton'

interface Props {
  params: Promise<{ examSlug: string; attemptId: string }>
}

export default async function PracticeResultPage({ params }: Props) {
  const { examSlug, attemptId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-sm">Please sign in to view your result.</div>
  }

  const { data: exam } = await supabase.from('exams').select('id, name, slug').eq('slug', examSlug).single()
  if (!exam) notFound()

  const { data: attempt } = await supabase
    .from('user_exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('exam_id', exam.id)
    .eq('user_id', user.id)
    .single()

  if (!attempt) notFound()
  if (!attempt.completed_at) {
    redirect(`/practice/${examSlug}/attempt/${attemptId}`)
  }

  const { data: responses } = await supabase
    .from('user_exam_responses')
    .select('question_id, selected_option_id, is_correct')
    .eq('attempt_id', attempt.id)

  const questionIds = (responses || []).map((item) => item.question_id)
  const { data: questions } = await supabase
    .from('exam_questions')
    .select('id, question_text, options, correct_option_id, explanation')
    .in('id', questionIds)

  const byQuestion = new Map((questions || []).map((q) => [q.id, q]))
  const percentage = Math.round((attempt.score / Math.max(1, attempt.total_questions)) * 100)
  const passed = percentage >= PASS_PERCENTAGE

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">Result - {exam.name}</h1>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <p>Score: {attempt.score} / {attempt.total_questions}</p>
          <p>Percentage: {percentage}%</p>
          <p className={passed ? 'text-emerald-600' : 'text-rose-600'}>
            {passed ? 'Pass' : 'Fail'} (threshold: {PASS_PERCENTAGE}%)
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {(responses || []).map((response) => {
            const question = byQuestion.get(response.question_id)
            if (!question) return null
            const selected = question.options.find((o: { id: string }) => o.id === response.selected_option_id)
            const correct = question.options.find((o: { id: string }) => o.id === question.correct_option_id)

            return (
              <div key={response.question_id} className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium">{question.question_text}</p>
                <p className="mt-2 text-sm">Your answer: {selected?.text || 'Not answered'}</p>
                <p className="text-sm">Correct answer: {correct?.text || question.correct_option_id}</p>
                <p className="mt-2 text-sm text-muted-foreground">Explanation: {question.explanation}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <StartAttemptButton examSlug={exam.slug} />
          <Link href={`/practice/${exam.slug}`} className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-hover">
            Back to Exam
          </Link>
        </div>

        <div className="mt-8">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  )
}
