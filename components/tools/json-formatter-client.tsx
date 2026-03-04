'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, Trash2 } from 'lucide-react'

function formatJson(json: string, indent: number | string): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, null, indent)
  } catch {
    return ''
  }
}

function minifyJson(json: string): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed)
  } catch {
    return ''
  }
}

function validateJson(json: string): { valid: boolean; error?: string } {
  if (!json.trim()) return { valid: false, error: 'Empty input' }
  try {
    JSON.parse(json)
    return { valid: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON'
    return { valid: false, error: msg }
  }
}

export function JsonFormatterClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2')
  const [copied, setCopied] = useState(false)

  const handleFormat = useCallback(() => {
    setError(null)
    const result = validateJson(input)
    if (!result.valid) {
      setError(result.error || 'Invalid JSON')
      setOutput('')
      return
    }
    setOutput(formatJson(input, indent === 'tab' ? '\t' : Number(indent)))
  }, [input, indent])

  const handleMinify = useCallback(() => {
    setError(null)
    const result = validateJson(input)
    if (!result.valid) {
      setError(result.error || 'Invalid JSON')
      setOutput('')
      return
    }
    setOutput(minifyJson(input))
  }, [input])

  const handleValidate = useCallback(() => {
    const result = validateJson(input)
    setError(result.valid ? null : (result.error || 'Invalid JSON'))
    if (result.valid) setOutput('Valid JSON ✓')
    else setOutput('')
  }, [input])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy')
    }
  }, [output])

  const handleClear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <label htmlFor="json-input" className="block text-sm font-medium text-foreground">
            Paste or type JSON
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Indent:</label>
            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value as '2' | '4' | 'tab')}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tabs</option>
            </select>
          </div>
        </div>
        <textarea
          id="json-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"name": "example", "items": [1, 2, 3]}'
          className="w-full min-h-[180px] rounded-md border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleFormat} variant="default">
            Format
          </Button>
          <Button onClick={handleMinify} variant="secondary">
            Minify
          </Button>
          <Button onClick={handleValidate} variant="secondary">
            Validate
          </Button>
          <Button onClick={handleClear} variant="ghost" size="icon" aria-label="Clear">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {output && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Output</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-[400px] overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>
        )}
      </div>

      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground mb-4">About this tool</h2>
        <p>
          The JSON formatter helps you format, minify, and validate JSON. Paste or type JSON and click Format to pretty-print it with indentation, or Minify to remove whitespace. Use Validate to check if your JSON is valid without changing it. All processing happens in your browser. Nothing is sent to a server or stored.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">How it works</h3>
        <p>
          Format uses <code>JSON.stringify</code> with indentation to produce readable output. You can choose 2 spaces, 4 spaces, or tabs. Minify removes all unnecessary whitespace to reduce file size. Validate parses the input and reports any syntax errors, including the position and type of the problem.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Practical examples</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>API responses: paste raw JSON to format it for debugging or documentation.</li>
          <li>Config files: minify JSON before embedding in HTML or sending over the network.</li>
          <li>Before committing: validate JSON configs or data files to catch errors early.</li>
          <li>Logs and exports: format minified logs to inspect structure and values.</li>
        </ul>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Limitations</h3>
        <p>
          The formatter does not preserve comments or trailing commas, as these are not part of standard JSON. Very large files (millions of characters) may cause the browser to slow. For JSON with comments (JSONC) or other extensions, use a specialized tool.
        </p>
      </section>
    </div>
  )
}
