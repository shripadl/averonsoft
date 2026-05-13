import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import {
  CATEGORY_SEO,
  EXAM_GENERATOR_SEO_SLUGS,
  type ExamGeneratorSeoSlug,
  isExamGeneratorSeoSlug,
} from '@/lib/exam-generator/category-seo'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'

const site = 'https://averonsoft.com'

export function generateStaticParams(): { category: ExamGeneratorSeoSlug }[] {
  return EXAM_GENERATOR_SEO_SLUGS.map(category => ({ category }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  if (!isExamGeneratorSeoSlug(category)) {
    return { title: 'Exam generator' }
  }
  const c = CATEGORY_SEO[category]
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/exam-generator/${category}` },
    openGraph: {
      title: c.title,
      description: c.description,
      type: 'article',
      url: `${site}/exam-generator/${category}`,
    },
  }
}

export default async function ExamGeneratorCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  if (!isExamGeneratorSeoSlug(category)) {
    notFound()
  }

  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'examgenerator')
  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Exam Question Generator" />
    }
    return <ToolDisabledPage toolName="Exam Question Generator" />
  }

  const c = CATEGORY_SEO[category]

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.h1,
    description: c.description,
    author: { '@type': 'Organization', name: 'Averonsoft' },
    publisher: { '@type': 'Organization', name: 'Averonsoft' },
    mainEntityOfPage: `${site}/exam-generator/${category}`,
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  const otherSlugs = EXAM_GENERATOR_SEO_SLUGS.filter(s => s !== category)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm text-muted-foreground">
            <Link href="/exam-generator" className="text-primary underline-offset-4 hover:underline">
              Exam Question Generator
            </Link>
            <span aria-hidden> · </span>
            Topic hub
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{c.h1}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{c.description}</p>
          <div className="mt-6">
            <Link
              href="/exam-generator"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Open the free generator
            </Link>
          </div>
        </header>

        <div className="max-w-none space-y-5 text-sm leading-relaxed text-muted-foreground">
          {c.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <section className="mt-12 border-t border-border pt-10" aria-labelledby="cat-faq">
          <h2 id="cat-faq" className="text-xl font-semibold text-foreground">
            FAQ
          </h2>
          <dl className="mt-6 space-y-6">
            {c.faq.map(f => (
              <div key={f.question}>
                <dt className="font-medium text-foreground">{f.question}</dt>
                <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 text-sm">
          <h2 className="font-semibold text-foreground">Related hubs</h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            {otherSlugs.map(s => (
              <li key={s}>
                <Link href={`/exam-generator/${s}`} className="text-primary underline-offset-4 hover:underline">
                  {s === 'a-level' ? 'A‑Level' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  )
}
