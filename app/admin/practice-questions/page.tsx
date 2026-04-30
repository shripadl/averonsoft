import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { PracticeQuestionsAdminClient } from '@/components/practice/PracticeQuestionsAdminClient'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function PracticeQuestionsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireAdmin('readonly')
  const sp = await searchParams
  const getSingle = (k: string): string | null => {
    const v = sp[k]
    if (Array.isArray(v)) return v[0] ?? null
    return v ?? null
  }

  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, slug, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">Practice question bank</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Search, filter, edit in place, and run bulk status updates. Admin access only.
      </p>
      <PracticeQuestionsAdminClient
        exams={exams ?? []}
        initialFilters={{
          exam: getSingle('exam'),
          q: getSingle('q') || '',
          domain: getSingle('domain') || '',
          difficulty: getSingle('difficulty') || '',
          outdated: getSingle('outdated') || 'all',
          page: Math.max(1, parseInt(getSingle('page') || '1', 10) || 1),
        }}
      />
    </div>
  )
}
