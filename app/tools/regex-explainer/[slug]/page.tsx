import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RegexFeedbackLink } from '@/components/tools/regex-explainer/RegexFeedbackLink'
import { RegExplainClient } from '@/components/tools/regex-explainer/RegExplainClient'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import { REGEX_USE_CASES, getUseCaseBySlug } from '@/lib/regex-explain/use-cases'

export function generateStaticParams() {
  return REGEX_USE_CASES.map((c) => ({ slug: c.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const c = getUseCaseBySlug(slug)
  if (!c) return { title: 'RegExplain' }
  return {
    title: `${c.shortTitle} regex example | RegExplain | Averonsoft`,
    description: c.metaDescription,
  }
}

export default async function RegexExplainerUseCasePage({ params }: Props) {
  const { slug } = await params
  const preset = getUseCaseBySlug(slug)
  if (!preset) notFound()

  const toolSettings = await getToolSettings()
  const { accessible, maintenance } = isToolAccessible(toolSettings, 'regexexplainer')

  if (!accessible) {
    if (maintenance) {
      return <ToolMaintenancePage toolName="RegExplain" />
    }
    return <ToolDisabledPage toolName="RegExplain" />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="text-sm text-muted-foreground">
          <Link href="/tools/regex-explainer" className="hover:text-foreground">
            RegExplain
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{preset.shortTitle}</span>
        </nav>
        <RegexFeedbackLink className="self-start sm:self-auto" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{preset.title}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Example pattern below—edit it or paste your own. All processing runs in your browser. For
          Python’s <code className="text-foreground">re</code> module, switch flavor in the tool.
        </p>
      </div>

      <RegExplainClient
        initialPattern={preset.pattern}
        initialFlags={preset.flags}
        initialTest={preset.test}
        initialFlavor={preset.initialFlavor ?? 'javascript'}
      />

      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-16">
        <h2 className="text-lg font-semibold text-foreground mb-4">More examples</h2>
        <ul className="list-disc pl-5 space-y-1 not-prose">
          {REGEX_USE_CASES.filter((x) => x.slug !== slug).map((c) => (
            <li key={c.slug}>
              <Link href={`/tools/regex-explainer/${c.slug}`} className="text-primary hover:underline">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href="/tools/regex-explainer" className="text-primary hover:underline">
            Back to RegExplain
          </Link>
        </p>
      </section>
    </div>
  )
}
