import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ examSlug: string }>
}

export default async function PracticeAttemptsPage({ params }: Props) {
  const { examSlug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-sm">Please sign in to view attempts.</div>
  }

  const { data: exam } = await supabase.from('exams').select('id, name, slug').eq('slug', examSlug).single()
  if (!exam) return <div className="p-8 text-sm">Exam not found.</div>

  const { data: attempts } = await supabase
    .from('user_exam_attempts')
    .select('id, score, total_questions, attempt_number_for_exam, completed_at')
    .eq('exam_id', exam.id)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">{exam.name} - Past Attempts</h1>
        <div className="mt-6 space-y-3">
          {(attempts || []).map((attempt) => (
            <Link key={attempt.id} href={`/practice/${exam.slug}/result/${attempt.id}`} className="block rounded-lg border border-border bg-surface p-4">
              <p>Attempt #{attempt.attempt_number_for_exam}</p>
              <p className="text-sm text-muted-foreground">
                Score {attempt.score}/{attempt.total_questions} - {new Date(attempt.completed_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
