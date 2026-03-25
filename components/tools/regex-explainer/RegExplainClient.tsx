'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RegexFeedbackLink } from '@/components/tools/regex-explainer/RegexFeedbackLink'
import { Button } from '@/components/ui/button'
import {
  explainRegex,
  highlightMatches,
  tryBuildRegExp,
  pythonFlagsToJs,
  describePythonReFlags,
  PYTHON_RE_NOTES,
  pcreFlagsToJs,
  describePcreFlags,
  PCRE_NOTES,
  type RegexFlavor,
} from '@/lib/regex-explain'
import { Link2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_PATTERN = String.raw`\d{3}-\d{4}`
const DEFAULT_TEST = 'Call 555-1234 or 999-9999'

export interface RegExplainClientProps {
  initialPattern?: string
  initialFlags?: string
  initialTest?: string
  initialFlavor?: RegexFlavor
  showFlavorSelector?: boolean
  embed?: boolean
}

export function RegExplainClient({
  initialPattern = DEFAULT_PATTERN,
  initialFlags = 'g',
  initialTest = DEFAULT_TEST,
  initialFlavor = 'javascript',
  showFlavorSelector = true,
  embed = false,
}: RegExplainClientProps) {
  const [pattern, setPattern] = useState(initialPattern)
  const [flags, setFlags] = useState(initialFlags)
  const [test, setTest] = useState(initialTest)
  const [flavor, setFlavor] = useState<RegexFlavor>(initialFlavor)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      setHydrated(true)
      return
    }
    const params = new URLSearchParams(hash)
    const p = params.get('p')
    const f = params.get('f')
    const t = params.get('t')
    const v = params.get('v')
    if (p !== null) setPattern(p)
    if (f !== null) setFlags(f)
    if (t !== null) setTest(t)
    if (v === 'py') setFlavor('python')
    else if (v === 'pcre') setFlavor('pcre')
    else if (v === 'js') setFlavor('javascript')
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const params = new URLSearchParams()
    if (pattern) params.set('p', pattern)
    if (flags) params.set('f', flags)
    if (test) params.set('t', test)
    params.set('v', flavor === 'python' ? 'py' : flavor === 'pcre' ? 'pcre' : 'js')
    const qs = params.toString()
    const url = `${window.location.pathname}${qs ? `#${qs}` : ''}`
    window.history.replaceState(null, '', url)
  }, [hydrated, pattern, flags, test, flavor])

  const flagsForParse = useMemo(() => {
    if (flavor === 'python') {
      let base = pythonFlagsToJs(flags)
      if (pattern.includes('\\p{') || pattern.includes('\\P{')) base += 'u'
      return base
    }
    if (flavor === 'pcre') {
      let base = pcreFlagsToJs(flags)
      if (pattern.includes('\\p{') || pattern.includes('\\P{')) base += 'u'
      return base
    }
    return flags
  }, [flavor, flags, pattern])

  const flagsForMatch = useMemo(() => {
    if (flavor === 'python') {
      let base = pythonFlagsToJs(flags)
      if (!base.includes('g')) base += 'g'
      if (pattern.includes('\\p{') || pattern.includes('\\P{')) {
        if (!base.includes('u')) base += 'u'
      }
      return base
    }
    if (flavor === 'pcre') {
      let base = pcreFlagsToJs(flags)
      if (!base.includes('g')) base += 'g'
      if (pattern.includes('\\p{') || pattern.includes('\\P{')) {
        if (!base.includes('u')) base += 'u'
      }
      return base
    }
    return flags
  }, [flavor, flags, pattern])

  const explained = useMemo(() => explainRegex(pattern, flagsForParse), [pattern, flagsForParse])

  const segments = useMemo(() => {
    if (!test.trim()) return []
    const re = tryBuildRegExp(pattern, flagsForMatch)
    if (!re) return []
    return highlightMatches(test, re)
  }, [pattern, flagsForMatch, test])

  const copyShareLink = useCallback(async () => {
    const params = new URLSearchParams()
    if (pattern) params.set('p', pattern)
    if (flags) params.set('f', flags)
    if (test) params.set('t', test)
    params.set('v', flavor === 'python' ? 'py' : flavor === 'pcre' ? 'pcre' : 'js')
    const qs = params.toString()
    const url = `${window.location.origin}${window.location.pathname}${qs ? `#${qs}` : ''}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy')
    }
  }, [pattern, flags, test, flavor])

  const setFlavorNormalized = useCallback((next: RegexFlavor) => {
    setFlavor(next)
    setFlags((prev) => {
      if (next === 'python') return prev.replace(/[^imsax]/gi, '').toLowerCase()
      if (next === 'pcre') return prev.replace(/[^imsuxjad]/gi, '').toLowerCase()
      return prev.replace(/[^gimsuvyd]/gi, '')
    })
  }, [])

  const onFlagsChange = (value: string) => {
    if (flavor === 'python') setFlags(value.replace(/[^imsax]/gi, '').toLowerCase())
    else if (flavor === 'pcre') setFlags(value.replace(/[^imsuxjad]/gi, '').toLowerCase())
    else setFlags(value.replace(/[^gimsuvyd]/gi, ''))
  }

  const flavorLabel =
    flavor === 'javascript'
      ? 'JavaScript RegExp'
      : flavor === 'python'
        ? 'Python `re` (explained via JS parser; see notes)'
        : 'PCRE (explained via JS parser; see notes)'

  const flagsExplainedLine =
    flavor === 'python'
      ? describePythonReFlags(flags)
      : flavor === 'pcre'
        ? describePcreFlags(flags)
        : explained.ok
          ? explained.flagsSummary
          : ''

  const taMin = embed ? 'min-h-[72px]' : 'min-h-[100px]'
  const sectionGap = embed ? 'space-y-5' : 'space-y-8'

  return (
    <div className={sectionGap} data-regexplain-embed={embed ? '' : undefined}>
      {showFlavorSelector && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Flavor</span>
          <div className="inline-flex flex-wrap rounded-lg border border-border p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setFlavorNormalized('javascript')}
              className={`rounded-md px-2.5 py-1.5 text-sm ${
                flavor === 'javascript' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              JavaScript
            </button>
            <button
              type="button"
              onClick={() => setFlavorNormalized('python')}
              className={`rounded-md px-2.5 py-1.5 text-sm ${
                flavor === 'python' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Python <code className="text-xs opacity-90">re</code>
            </button>
            <button
              type="button"
              onClick={() => setFlavorNormalized('pcre')}
              className={`rounded-md px-2.5 py-1.5 text-sm ${
                flavor === 'pcre' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              PCRE
            </button>
          </div>
          {!embed && (
            <p className="text-xs text-muted-foreground max-w-xl">
              {flavor === 'javascript' && 'Standard `RegExp` for explanation and preview.'}
              {flavor === 'python' && 'Flags map to `re.I`, `re.M`, `re.S`. See notes below.'}
              {flavor === 'pcre' && 'Common PCRE modifiers; preview maps `i`/`m`/`s`/`u` to JS.'}
            </p>
          )}
        </div>
      )}

      <div className={`grid gap-6 ${embed ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <div className="space-y-3">
          <label className="block text-sm font-medium">Pattern</label>
          <textarea
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            className={`${taMin} w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm`}
            placeholder="e.g. ^[a-z]+$"
            aria-label="Regular expression pattern"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground">Flags</label>
            <input
              value={flags}
              onChange={(e) => onFlagsChange(e.target.value)}
              className="w-36 rounded-md border border-input bg-background px-2 py-1 font-mono text-sm"
              placeholder={flavor === 'python' ? 'i m s …' : flavor === 'pcre' ? 'i m s u …' : 'g i m …'}
              aria-label="Regex flags"
              maxLength={16}
            />
            <span className="text-xs text-muted-foreground">
              {flavor === 'python' && 'i m s a x (Python re; preview uses JS i/m/s)'}
              {flavor === 'pcre' && 'i m s u x a d j (PCRE; preview uses subset)'}
              {flavor === 'javascript' && 'g i m s u y d v (JavaScript)'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Test string</label>
          <textarea
            value={test}
            onChange={(e) => setTest(e.target.value)}
            className={`${taMin} w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm`}
            placeholder="Text to match against…"
            aria-label="Test string"
          />
          <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-sm break-all min-h-[2.5rem]">
            {segments.length === 0 ? (
              <span className="text-muted-foreground">Matches will highlight here.</span>
            ) : (
              segments.map((seg, i) =>
                seg.match ? (
                  <mark key={i} className="rounded bg-primary/25 px-0.5 text-foreground">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={copyShareLink}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
          Copy share link
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            const text = explained.ok ? explanationToText(explained, flavor, flags) : 'Invalid regex'
            await navigator.clipboard.writeText(text)
            toast.success('Explanation copied')
          }}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy explanation
        </Button>
      </div>

      <div>
        <h2 className={`font-semibold mb-3 ${embed ? 'text-base' : 'text-lg'}`}>Plain-English explanation</h2>
        {!explained.ok ? (
          <p className="text-sm text-destructive">{explained.message}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Flavor:</span> {flavorLabel}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {flavor === 'javascript' ? 'Flags:' : flavor === 'python' ? 'Python flags:' : 'PCRE flags:'}
              </span>{' '}
              {flagsExplainedLine}
            </p>
            {explained.lines.length > 1 ? (
              <ul className="list-decimal space-y-1 pl-5 text-sm">
                {explained.lines.map((line, i) => (
                  <li key={i}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{line.raw}</span>
                    {line.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed">{explained.lines[0]?.text}</p>
            )}
            {flavor === 'python' && (
              <div className="rounded-md border border-border bg-muted/20 p-4 text-sm">
                <p className="font-medium text-foreground mb-2">Python `re` notes</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {PYTHON_RE_NOTES.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {flavor === 'pcre' && (
              <div className="rounded-md border border-border bg-muted/20 p-4 text-sm">
                <p className="font-medium text-foreground mb-2">PCRE notes</p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {PCRE_NOTES.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {embed && (
        <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <RegexFeedbackLink variant="embed" />
          <span aria-hidden>·</span>
          <Link href="/tools/regex-explainer" className="text-primary hover:underline">
            RegExplain
          </Link>
          <span aria-hidden>·</span>
          <span>Averonsoft</span>
        </p>
      )}
    </div>
  )
}

function explanationToText(
  result: Extract<ReturnType<typeof explainRegex>, { ok: true }>,
  flavor: RegexFlavor,
  flagsDisplay: string
): string {
  const flavorLine =
    flavor === 'javascript' ? 'JavaScript' : flavor === 'python' ? 'Python re' : 'PCRE'
  const flagLine =
    flavor === 'python'
      ? `Python flags: ${describePythonReFlags(flagsDisplay)}`
      : flavor === 'pcre'
        ? `PCRE flags: ${describePcreFlags(flagsDisplay)}`
        : `Flags: ${result.flagsSummary}`
  const lines = [
    `Flavor: ${flavorLine}`,
    flagLine,
    ...result.lines.map((l) => (result.lines.length > 1 ? `${l.raw} → ${l.text}` : l.text)),
  ]
  if (flavor === 'python') lines.push('', ...PYTHON_RE_NOTES.map((n) => `- ${n}`))
  if (flavor === 'pcre') lines.push('', ...PCRE_NOTES.map((n) => `- ${n}`))
  return lines.join('\n')
}
