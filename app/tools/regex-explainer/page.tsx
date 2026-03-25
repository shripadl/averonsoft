import Link from 'next/link'
import { headers } from 'next/headers'
import { RegexFeedbackLink } from '@/components/tools/regex-explainer/RegexFeedbackLink'
import { RegExplainClient } from '@/components/tools/regex-explainer/RegExplainClient'
import { getToolSettings, isToolAccessible } from '@/lib/tool-settings'
import { ToolMaintenancePage } from '@/components/tool-maintenance-page'
import { ToolDisabledPage } from '@/components/tool-disabled-page'
import { REGEX_USE_CASES } from '@/lib/regex-explain/use-cases'

export const metadata = {
  title: 'RegExplain — Regex Explainer & Tester | Averonsoft Tools',
  description:
    'Paste a regular expression and get a plain-English explanation. JavaScript, Python re, or PCRE notes. Test strings with live match highlighting. Embeddable widget. Share state in the URL. No signup; all in your browser.',
}

async function siteOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://averonsoft.com'
}

export default async function RegexExplainerPage() {
  const origin = await siteOrigin()
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">RegExplain</h1>
          <p className="mt-1 text-muted-foreground">
            Plain-English regex explanations and a live tester. JavaScript{' '}
            <code className="text-foreground">RegExp</code>, Python{' '}
            <code className="text-foreground">re</code>, or PCRE-oriented notes. Nothing leaves your
            browser.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            We’re improving this tool based on real use—try it and tell us what would help you most.
          </p>
        </div>
        <RegexFeedbackLink className="shrink-0" />
      </div>

      <RegExplainClient />

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-3">Practical examples</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
          Each link opens the same tool with a realistic starter pattern and sample text. Edit
          freely—use them as templates, not as production validators.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {REGEX_USE_CASES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/tools/regex-explainer/${c.slug}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary/30 hover:bg-muted/30 transition-colors"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-16">
        <h2 className="text-lg font-semibold text-foreground mb-4">How it works</h2>
        <p>
          RegExplain parses your pattern with the same grammar as JavaScript{' '}
          <code className="text-foreground">RegExp</code> (using{' '}
          <code className="text-foreground">regexpp</code>), walks the syntax tree, and turns each
          part into a short plain-English phrase—quantifiers, groups, character classes, assertions,
          and escapes.
        </p>
        <p>
          The <strong className="text-foreground">test string</strong> runs in your browser with{' '}
          <code className="text-foreground">RegExp</code>: matches are highlighted. Choose a{' '}
          <strong className="text-foreground">flavor</strong> (JavaScript, Python <code className="text-foreground">re</code>, or PCRE notes): JavaScript
          uses native semantics end-to-end; Python and PCRE add flag labels and notes where those
          engines can differ, while the live preview still uses mapped JavaScript flags.
        </p>
        <p>
          <strong className="text-foreground">Share links</strong> store pattern, flags, flavor, and
          sample text in the URL hash—nothing is sent to a server.
        </p>

        <h2 className="text-lg font-semibold text-foreground mt-10 mb-4">Limitations</h2>
        <p>
          <strong className="text-foreground">Not validation advice.</strong> Example patterns are
          educational shortcuts. Real apps need allowlists, libraries, or context-specific rules.
        </p>
        <p>
          <strong className="text-foreground">Dialect differences.</strong> Python and PCRE modes
          describe common flags and caveats, but parsing follows JavaScript rules.
        </p>
        <p>
          <strong className="text-foreground">URLs and privacy.</strong> Shared links can get long
          because state lives in the hash; avoid pasting secrets into the pattern or test fields.
        </p>
      </section>

      <section className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Embed in your docs</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add the tool to an internal wiki or README with an iframe. The embed URL hides the site
          header and footer; state still lives in the hash.
        </p>
        <div className="rounded-lg bg-muted/40 p-3 font-mono text-xs overflow-x-auto">
          {`<iframe
  src="${origin}/tools/regex-explainer/embed"
  title="RegExplain"
  width="100%"
  height="640"
  style="border:0;border-radius:8px;max-width:720px"
/>`}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Replace the host with yours when self-hosting.{' '}
          <Link href="/tools/regex-explainer/embed" className="text-primary hover:underline">
            Open embed page
          </Link>
        </p>
      </section>
    </div>
  )
}
