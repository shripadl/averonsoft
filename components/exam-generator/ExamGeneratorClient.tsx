'use client'

import { useCallback, useState } from 'react'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileDown, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Difficulty = 'easy' | 'medium' | 'hard'

type McqOption = { label: string; text: string }

type Mcq = {
  id: string
  stem: string
  options: McqOption[]
  correctLabel: string
  domain: string
}

const CATEGORY_LINKS: { href: string; label: string }[] = [
  { href: '/exam-generator/aws', label: 'Cloud & IT career prep' },
  { href: '/exam-generator/gcse', label: 'GCSE-style revision' },
  { href: '/exam-generator/cbse', label: 'CBSE-style practice' },
  { href: '/exam-generator/neet', label: 'NEET-style biology focus' },
  { href: '/exam-generator/a-level', label: 'A‑Level style study' },
  { href: '/exam-generator/nursing', label: 'Nursing fundamentals' },
]

export function ExamGeneratorClient() {
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [mcqs, setMcqs] = useState<Mcq[]>([])
  const [mappedDomain, setMappedDomain] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/exam-generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() || 'General revision', difficulty }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Generation failed.')
        setMcqs([])
        setMappedDomain('')
        return
      }
      setMcqs(data.mcqs ?? [])
      setMappedDomain(typeof data.mappedDomain === 'string' ? data.mappedDomain : '')
    } catch {
      setError('Network error. Please try again.')
      setMcqs([])
      setMappedDomain('')
    } finally {
      setLoading(false)
    }
  }, [topic, difficulty])

  const downloadPdf = useCallback(() => {
    if (mcqs.length === 0) return
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 48
    const lineHeight = 16
    const pageHeight = doc.internal.pageSize.getHeight()
    let y = margin

    const addLine = (text: string, fontSize = 11, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - margin * 2)
      for (const line of lines) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line as string, margin, y)
        y += lineHeight
      }
    }

    addLine('Averonsoft — Exam Question Generator', 14, true)
    addLine(`Topic: ${topic.trim() || 'General revision'} · Difficulty: ${difficulty}`, 10, false)
    y += 8

    mcqs.forEach((q, i) => {
      addLine(`${i + 1}. ${q.stem}`, 11, true)
      q.options.forEach(o => {
        addLine(`   ${o.label}. ${o.text}`, 10, false)
      })
      addLine(`   Answer: ${q.correctLabel}`, 10, false)
      y += 6
    })

    doc.save(`exam-questions-${Date.now()}.pdf`)
  }, [mcqs, topic, difficulty])

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
        <p className="font-medium">🎉 Free for a Limited Period — No Login Required</p>
        <p className="mt-1 text-muted-foreground">Generate unlimited exam questions instantly.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="exam-topic" className="mb-2 block text-sm font-medium text-foreground">
              Enter topic…
            </label>
            <input
              id="exam-topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. networking basics, algebra, business strategy"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="exam-difficulty" className="mb-2 block text-sm font-medium text-foreground">
              Difficulty
            </label>
            <select
              id="exam-difficulty"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as Difficulty)}
              className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="easy">Easy (10 questions)</option>
              <option value="medium">Medium (15 questions)</option>
              <option value="hard">Hard (20 questions)</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void generate()} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Generating…
                </>
              ) : (
                'Generate'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={downloadPdf} disabled={mcqs.length === 0}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden />
              Download as PDF
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {mappedDomain ? (
            <p className="text-xs text-muted-foreground">
              Matched domain: {mappedDomain}. Questions are template‑based study aids, not copies of official exams.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {mcqs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your MCQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {mcqs.map((q, idx) => (
              <div key={q.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">
                  {idx + 1}. {q.stem}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {q.options.map(o => (
                    <li key={o.label}>
                      <span className="font-mono text-foreground">{o.label}.</span> {o.text}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Correct: <span className="font-mono text-foreground">{q.correctLabel}</span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-foreground">More exam prep hubs</h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {CATEGORY_LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} className="text-primary underline-offset-4 hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
