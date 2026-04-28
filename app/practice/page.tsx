import { createClient } from '@/lib/supabase/server'
import { LegalDisclaimer } from '@/components/practice/LegalDisclaimer'
import Link from 'next/link'
import { PRACTICE_PROVIDER_SECTIONS } from '@/lib/practice/providers'

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, slug, name, provider, description')
    .eq('is_active', true)
    .order('provider')
    .order('name')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold">Practice Exams</h1>
        <p className="mb-6 text-muted-foreground">Unofficial cloud certification practice exams for learning and preparation.</p>

        {(exams || []).length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-muted-foreground">
            <p className="font-medium text-foreground">No practice exams in the catalog yet.</p>
            <p className="mt-2 text-sm">
              Add at least one row to the <code className="text-primary">exams</code> table in Supabase (set{' '}
              <code className="text-primary">is_active = true</code>), use the admin API, or run the seed script{' '}
              <code className="text-primary">supabase/practice-exams-seed.sql</code> in the SQL Editor to load a
              demo exam and sample questions.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {PRACTICE_PROVIDER_SECTIONS.filter((section) =>
              (exams || []).some((exam) => exam.provider === section.provider),
            ).map((section) => (
              <Link
                key={section.slug}
                href={`/practice/section/${section.slug}`}
                className="rounded-xl border border-border bg-surface p-5 text-left transition hover:border-primary/40 hover:bg-surface-hover"
              >
                <p className="text-xl font-semibold">{section.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  )
}
