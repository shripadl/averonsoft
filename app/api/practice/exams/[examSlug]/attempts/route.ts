import { NextResponse } from 'next/server'
import { requireAuthenticatedUser } from '@/lib/practice/auth'
import { getExamBySlug, getUserAttemptCount } from '@/lib/practice/service'

export async function GET(_: Request, { params }: { params: Promise<{ examSlug: string }> }) {
  const { examSlug } = await params
  const auth = await requireAuthenticatedUser()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const exam = await getExamBySlug(auth.supabase, examSlug)
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
  }

  const { data: attempts, error } = await auth.supabase
    .from('user_exam_attempts')
    .select('*')
    .eq('user_id', auth.user.id)
    .eq('exam_id', exam.id)
    .order('started_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const attemptCount = await getUserAttemptCount(auth.supabase, auth.user.id, exam.id)
  return NextResponse.json({ attempts: attempts || [], attemptCount })
}
