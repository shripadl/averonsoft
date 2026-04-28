import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LegalDisclaimer } from '@/components/practice/LegalDisclaimer'
import { StartAttemptButton } from '@/components/practice/StartAttemptButton'
import { getAttemptsRemaining } from '@/lib/practice/entitlements'

interface Props {
  params: Promise<{ examSlug: string }>
}

export default async function PracticeExamOverviewPage({ params }: Props) {
  const { examSlug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: exam } = await supabase
    .from('exams')
    .select('id, slug, name, provider, description, total_questions')
    .eq('slug', examSlug)
    .eq('is_active', true)
    .single()

  if (!exam) notFound()

  let isPracticeAdmin = false
  let attemptsRemaining: number | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, banned')
      .eq('id', user.id)
      .single()
    isPracticeAdmin = !profile?.banned && ['admin', 'super_admin'].includes(profile?.role || '')
    const attemptsState = await getAttemptsRemaining(supabase, user.id, exam.slug)
    attemptsRemaining = attemptsState.totalAttemptsRemaining
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold">{exam.name}</h1>
        <p className="mt-2 text-primary">{exam.provider}</p>
        <p className="mt-4 text-muted-foreground">{exam.description}</p>

        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          <p className="mt-2 text-sm text-muted-foreground">
            First attempt is free. After that, exam attempts are consumed from your purchased exam packs.
          </p>
          {attemptsRemaining !== null ? (
            <p className="mt-2 text-sm font-medium text-foreground">You have {attemptsRemaining} attempts remaining for this exam.</p>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          <StartAttemptButton examSlug={exam.slug} />
          <Link href={`/practice/${exam.slug}/attempts`} className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-hover">
            View Past Attempts
          </Link>
          {isPracticeAdmin ? (
            <Link href={`/practice/${exam.slug}/admin`} className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-hover">
              Admin
            </Link>
          ) : null}
        </div>

        <div className="mt-8">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  )
}
