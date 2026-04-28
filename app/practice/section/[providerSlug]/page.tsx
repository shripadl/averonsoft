import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LegalDisclaimer } from '@/components/practice/LegalDisclaimer'
import { getProviderSectionBySlug } from '@/lib/practice/providers'

interface Props {
  params: Promise<{ providerSlug: string }>
}

export default async function PracticeProviderSectionPage({ params }: Props) {
  const { providerSlug } = await params
  const section = getProviderSectionBySlug(providerSlug)
  if (!section) notFound()

  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, slug, name, provider, description')
    .eq('is_active', true)
    .eq('provider', section.provider)
    .order('name')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{section.title} Practice Exams</h1>
            <p className="mt-2 text-muted-foreground">{section.description}</p>
          </div>
          <Link
            href="/practice"
            className="whitespace-nowrap rounded border border-border px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Back to Topics
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(exams || []).map((exam) => (
            <div key={exam.id} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-xl font-semibold">{exam.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{exam.description}</p>
              <Link
                href={`/practice/${exam.slug}`}
                className="mt-4 inline-flex rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Start Practice
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <LegalDisclaimer />
        </div>
      </div>
    </div>
  )
}

