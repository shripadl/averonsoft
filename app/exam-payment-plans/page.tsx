import { createClient } from '@/lib/supabase/server'
import { ExamPaymentPlansClient } from '@/components/practice/ExamPaymentPlansClient'

interface Props {
  searchParams: Promise<{ exam?: string }>
}

export default async function ExamPaymentPlansPage({ searchParams }: Props) {
  const sp = await searchParams
  const preselectedExamSlug = sp.exam || null
  const supabase = await createClient()

  const { data: exams } = await supabase
    .from('exams')
    .select('slug, name, provider')
    .eq('is_active', true)
    .order('provider')
    .order('name')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">Exam Payment Plans</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a one-time plan and select the exam(s) you want to unlock with 5 attempts each.
        </p>

        <div className="mt-8">
          <ExamPaymentPlansClient exams={exams || []} preselectedExamSlug={preselectedExamSlug} />
        </div>
      </div>
    </div>
  )
}
