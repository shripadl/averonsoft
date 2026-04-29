import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { PracticeResetAttemptsClient } from '@/components/admin/PracticeResetAttemptsClient'

interface Props {
  searchParams: Promise<{ exam?: string }>
}

export default async function PracticeResetAttemptsPage({ searchParams }: Props) {
  const sp = await searchParams
  const initialExamSlug = sp.exam || null
  const { user } = await requireAdmin('full')
  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('slug, name, provider')
    .eq('is_active', true)
    .order('provider')
    .order('name')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const canEdit = ['admin', 'super_admin'].includes(profile?.role || '')

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Practice: reset user attempts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Restore one free attempt for selected users on one exam, many exams, or all exams.
      </p>
      <div className="mt-8">
        <PracticeResetAttemptsClient exams={exams ?? []} canEdit={canEdit} initialExamSlug={initialExamSlug} />
      </div>
    </div>
  )
}
