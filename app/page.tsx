import { getToolSettings, getVisibleTools } from '@/lib/tool-settings'
import Link from 'next/link'
import {
  FileText,
  Hash,
  Braces,
  CreditCard,
  Code2,
  Music,
  ChevronRight,
  ImageIcon,
  TextSearch,
  Trophy,
  GraduationCap,
} from 'lucide-react'

const TOOL_DESCRIPTIONS: Record<string, string> = {
  pdfconverter: 'Convert images, text to PDF. Merge, split, compress. All in your browser.',
  charactercounter: 'Count characters, words, sentences, and paragraphs.',
  jsonformatter: 'Format, minify, and validate JSON. All in your browser.',
  smartimageresizer: 'Resize images without cropping. Content-aware. All in your browser.',
  businesscard: 'Create a card, preview it, and export as PNG or PDF. No data stored.',
  aiworkspace: 'Code with Monaco editor and AI assistant.',
  daw: 'Record, mix, and export audio.',
  regexexplainer: 'Explain regex in plain English and test matches in your browser.',
  practiceexams:
    'Unofficial cloud certification practice exams. Sign in to track attempts; first tries are free.',
}

const TOOL_ICONS: Record<string, typeof FileText> = {
  pdfconverter: FileText,
  charactercounter: Hash,
  jsonformatter: Braces,
  smartimageresizer: ImageIcon,
  businesscard: CreditCard,
  aiworkspace: Code2,
  daw: Music,
  regexexplainer: TextSearch,
  sportanalytics: Trophy,
  practiceexams: GraduationCap,
}

export default async function HomePage() {
  const toolSettings = await getToolSettings()
  const visibleTools = [...getVisibleTools(toolSettings)].reverse()

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
            {visibleTools.map((tool) => {
              const Icon = TOOL_ICONS[tool.key] ?? FileText
              const description = TOOL_DESCRIPTIONS[tool.key] ?? ''
              return (
                <li key={tool.key}>
                  <Link
                    href={tool.href}
                    className="group flex items-center gap-5 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/25 hover:bg-card hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </li>
              )
            })}
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
