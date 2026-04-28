import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getExamBySlug, canUserStartAttempt, buildQuestionSet } from '@/lib/practice/service'
import { DEFAULT_ATTEMPT_QUESTION_COUNT } from '@/lib/practice/constants'
import { PracticeAttemptClient } from '@/components/practice/PracticeAttemptClient'
import { LegalDisclaimer } from '@/components/practice/LegalDisclaimer'
import { PracticePaywallCard } from '@/components/practice/PracticePaywallCard'

interface Props {
  params: Promise<{ examSlug: string; attemptId: string }>
}

export default async function PracticeAttemptPage({ params }: Props) {
  const { examSlug, attemptId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-sm">Please sign in to start an attempt.</div>
  }

  const exam = await getExamBySlug(supabase, examSlug)
  if (!exam) notFound()

  const gate = await canUserStartAttempt(supabase, user.id, exam)
  if (!gate.allowed) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <PracticePaywallCard
          examSlug={exam.slug}
          message={gate.paywall?.message}
        />
      </div>
    )
  }

  const { data: questions } = await supabase
    .from('exam_questions')
    .select('id, question_text, options')
    .eq('exam_id', exam.id)
    .eq('is_outdated', false)

  const set = buildQuestionSet(questions || [], attemptId, DEFAULT_ATTEMPT_QUESTION_COUNT)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-5 text-2xl font-bold">{exam.name} - Attempt</h1>
        <PracticeAttemptClient examSlug={examSlug} attemptId={attemptId} questions={set} />
        <div className="mt-8">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  )
}
