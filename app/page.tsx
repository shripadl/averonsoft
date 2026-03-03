import { getToolSettings, getVisibleTools } from '@/lib/tool-settings'
import Link from 'next/link'

export default async function HomePage() {
  const toolSettings = await getToolSettings()
  const visibleTools = getVisibleTools(toolSettings)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Headline - above the fold */}
      <div className="mb-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Averonsoft Tools
        </h1>
        <p className="mt-3 text-muted-foreground">
          A small collection of online utilities. Fast, minimal, no signup required.
        </p>
      </div>

      {/* Tools - primary content */}
      <section className="mb-20">
        <h2 className="sr-only">Tools</h2>
        {visibleTools.length > 0 ? (
          <ul className="space-y-4">
            {visibleTools.map((tool) => (
              <li key={tool.key}>
                <Link
                  href={tool.href}
                  className="block rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-muted/50"
                >
                  <span className="font-medium text-foreground">{tool.name}</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tool.key === 'charactercounter' && 'Count characters, words, sentences, and paragraphs.'}
                    {tool.key === 'businesscard' && 'Create a card, preview it, and export as PNG or PDF. No data stored.'}
                    {tool.key === 'aiworkspace' && 'Code with Monaco editor and AI assistant.'}
                    {tool.key === 'daw' && 'Record, mix, and export audio.'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            No tools available at the moment. Check back later.
          </p>
        )}
      </section>

      {/* Brief about - below tools */}
      <section className="border-t border-border pt-12">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Averonsoft Tools is a minimal set of online utilities. Each tool is designed to do one thing well.
          We don&apos;t store your data unless a tool explicitly requires it (e.g. saving a business card).
          No marketing fluff, no forced signups for tools that work without an account.
        </p>
      </section>
    </div>
  )
}
