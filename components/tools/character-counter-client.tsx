'use client'

import { useState, useCallback } from 'react'

function countWords(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countSentences(text: string): number {
  if (!text.trim()) return 0
  const matches = text.trim().match(/[^.!?]+[.!?]+/g)
  return matches ? matches.length : (text.trim().length > 0 ? 1 : 0)
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(/\n\n+/).filter((p) => p.trim()).length
}

export function CharacterCounterClient() {
  const [text, setText] = useState('')

  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const words = countWords(text)
  const sentences = countSentences(text)
  const paragraphs = countParagraphs(text)

  const handleClear = useCallback(() => setText(''), [])

  return (
    <div className="space-y-6">
      {/* Tool - above the fold */}
      <div className="rounded-lg border border-border bg-card p-6">
        <label htmlFor="counter-input" className="block text-sm font-medium text-foreground mb-2">
          Paste or type your text
        </label>
        <textarea
          id="counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full min-h-[200px] rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
          aria-label="Text input for character and word counting"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Characters</span>
              <span className="ml-2 font-mono font-medium">{chars.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">No spaces</span>
              <span className="ml-2 font-mono font-medium">{charsNoSpaces.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Words</span>
              <span className="ml-2 font-mono font-medium">{words.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sentences</span>
              <span className="ml-2 font-mono font-medium">{sentences.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Paragraphs</span>
              <span className="ml-2 font-mono font-medium">{paragraphs.toLocaleString()}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Explanation - below tool (400–600 words) */}
      <section className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground mb-4">About this tool</h2>
        <p>
          The character and word counter helps you measure text length in real time. It counts characters (with and without spaces), words, sentences, and paragraphs. All counting happens in your browser. Nothing is sent to a server or stored. You can paste or type any text and see the numbers update instantly.
        </p>
        <p>
          Writers use it to stay within word limits for articles, essays, or social posts. Students check assignment length. Marketers verify ad copy fits character limits. Anyone who needs to know how long a piece of text is can paste it here and get instant counts. The tool is free to use and requires no account.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">How it works</h3>
        <p>
          Words are split on whitespace: spaces, tabs, and newlines. Each sequence of non-whitespace characters counts as one word. Sentences are detected by punctuation: periods, exclamation marks, and question marks. A sentence ends when one of these appears. Paragraphs are split by blank lines. Two or more consecutive newlines create a paragraph break. Character counts include every character you type, including spaces and line breaks. The &quot;no spaces&quot; count excludes spaces and tabs, which is useful when some platforms or APIs ignore spaces or when you need a strict character limit for systems that count differently.
        </p>
        <p>
          The counts update as you type or paste. There is no submit button and no delay. The tool does not save your text anywhere. When you close the tab or clear the input, the data is gone. This makes it suitable for sensitive or confidential text.
        </p>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Practical examples</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Twitter/X posts: 280 characters max — use the character count to stay under the limit.</li>
          <li>Meta descriptions: often 150–160 characters — check before publishing.</li>
          <li>Essay word limits: paste your draft to see if you&apos;ve hit 500 or 1000 words.</li>
          <li>Email subject lines: many perform better under 50 characters.</li>
          <li>Headlines and titles: some CMS or social tools have their own limits; verify before posting.</li>
          <li>API or form fields: when a backend expects a maximum length, count first to avoid truncation.</li>
        </ul>
        <h3 className="text-base font-medium text-foreground mt-6 mb-2">Limitations</h3>
        <p>
          Sentence and paragraph detection is approximate. Abbreviations like &quot;Dr.&quot; or &quot;e.g.&quot; can be counted as sentence endings. Numbers with decimals (e.g. 3.14) may also trigger a false sentence break. Unusual formatting, such as lists without periods or bullet points, may affect word and paragraph counts. Different style guides define words differently; hyphenated compounds might be one word or two depending on the convention.
        </p>
        <p>
          For strict academic or legal requirements, verify with your institution&apos;s preferred tool. Some platforms (e.g. SMS, certain ad networks) use their own counting rules. This counter is best for quick, everyday checks rather than formal compliance. It does not support reading from files; you must paste text manually.
        </p>
      </section>
    </div>
  )
}
