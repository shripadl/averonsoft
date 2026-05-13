import type { Metadata } from 'next'
import Link from 'next/link'
import { ExamGeneratorClient } from '@/components/exam-generator/ExamGeneratorClient'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { EXAM_GENERATOR_SEO_SLUGS } from '@/lib/exam-generator/category-seo'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'

const site = 'https://averonsoft.com'

export const metadata: Metadata = {
  title: 'Exam Question Generator — Free for Limited Period | Averonsoft',
  description:
    'Generate 10–20 exam-style MCQs instantly from your topic. Deterministic template engine, no external AI, no login required during the promotional period. PDF export.',
  keywords: [
    'exam question generator',
    'MCQ generator',
    'free practice questions',
    'PDF quiz export',
    'deterministic question bank',
  ],
  alternates: { canonical: '/exam-generator' },
  openGraph: {
    title: 'Exam Question Generator — Averonsoft',
    description:
      'Template-based MCQs for revision. Free for a limited period — no login required. Download as PDF.',
    type: 'website',
    url: `${site}/exam-generator`,
  },
}

const faqMain = [
  {
    question: 'Does the Exam Question Generator use artificial intelligence APIs?',
    answer:
      'No. All items are assembled from an on-server template library with procedural variation. There are no calls to third-party large language models.',
  },
  {
    question: 'How many questions are created per run?',
    answer:
      'Easy produces ten questions, medium fifteen, and hard twenty. The exact count is fixed for each difficulty level.',
  },
  {
    question: 'Can I download the questions?',
    answer:
      'Yes. Use the “Download as PDF” button to create a file in your browser using jsPDF without extra server rendering.',
  },
  {
    question: 'Is official exam content reproduced?',
    answer:
      'No. Templates are original study aids. They are filtered to avoid proprietary exam wording and vendor-specific certification trivia.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No login is required during the free promotional period, as shown in the banner on the tool page.',
  },
]

export default async function ExamGeneratorPage() {
  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'examgenerator')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="Exam Question Generator" />
    }
    return <ToolDisabledPage toolName="Exam Question Generator" />
  }

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Averonsoft Exam Question Generator',
    applicationCategory: 'EducationalApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description:
      'Deterministic, template-based multiple-choice question generator with PDF export. No external AI APIs.',
    url: `${site}/exam-generator`,
    operatingSystem: 'Any',
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqMain.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Exam Question Generator</h1>
          <p className="mt-2 text-muted-foreground">
            Build instant multiple-choice revision sets from a topic line. Generation is deterministic and runs on
            Averonsoft infrastructure—ideal for quick class warm-ups, solo recall drills, and printable PDFs.
          </p>
        </header>

        <ExamGeneratorClient />

        <section className="mt-14 space-y-4 border-t border-border pt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <dl className="space-y-6">
            {faqMain.map(f => (
              <div key={f.question}>
                <dt className="font-medium text-foreground">{f.question}</dt>
                <dd className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 text-sm text-muted-foreground">
          <h2 className="mb-3 font-semibold text-foreground">Topic hubs</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {EXAM_GENERATOR_SEO_SLUGS.map(slug => (
              <li key={slug}>
                <Link className="text-primary underline-offset-4 hover:underline" href={`/exam-generator/${slug}`}>
                  {slug === 'a-level' ? 'A‑Level hub' : `${slug.charAt(0).toUpperCase() + slug.slice(1)} hub`}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
