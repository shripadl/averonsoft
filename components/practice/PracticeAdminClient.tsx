'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PracticeAdminClientProps {
  examSlug: string
}

export function PracticeAdminClient({ examSlug }: PracticeAdminClientProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctOptionId, setCorrectOptionId] = useState('A')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState('medium')

  async function createQuestion() {
    setLoading(true)
    setStatus(null)
    try {
      const response = await fetch('/api/practice/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examSlug,
          question_text: questionText,
          options: [
            { id: 'A', text: optionA },
            { id: 'B', text: optionB },
            { id: 'C', text: optionC },
            { id: 'D', text: optionD },
          ],
          correct_option_id: correctOptionId,
          explanation,
          difficulty,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to create question')

      setStatus('Question created successfully.')
      setQuestionText('')
      setOptionA('')
      setOptionB('')
      setOptionC('')
      setOptionD('')
      setExplanation('')
      setCorrectOptionId('A')
      setDifficulty('medium')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  async function markOutdated(questionId: string) {
    setStatus(null)
    try {
      const response = await fetch(`/api/practice/admin/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_outdated: true }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Failed to update question')
      setStatus('Question marked as outdated.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to mark question as outdated')
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link className="text-primary underline" href={`/admin/practice-questions?exam=${encodeURIComponent(examSlug)}`}>
          Open full question editor
        </Link>
        <span className="text-muted-foreground"> — search, filter by domain and difficulty, inline edit, bulk outdated</span>
      </p>
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 text-lg font-semibold">Create Original Question</h3>
        <p className="mb-4 text-sm text-amber-600">
          Only create original, scenario-based learning content. Do not copy or approximate real certification exam questions.
        </p>
        <div className="grid gap-3">
          <textarea className="rounded border border-border bg-background p-2" placeholder="Question text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
          <input className="rounded border border-border bg-background p-2" placeholder="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} />
          <input className="rounded border border-border bg-background p-2" placeholder="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} />
          <input className="rounded border border-border bg-background p-2" placeholder="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} />
          <input className="rounded border border-border bg-background p-2" placeholder="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} />
          <select className="rounded border border-border bg-background p-2" value={correctOptionId} onChange={(e) => setCorrectOptionId(e.target.value)}>
            <option value="A">Correct: A</option>
            <option value="B">Correct: B</option>
            <option value="C">Correct: C</option>
            <option value="D">Correct: D</option>
          </select>
          <select className="rounded border border-border bg-background p-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <textarea className="rounded border border-border bg-background p-2" placeholder="Explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          <Button onClick={createQuestion} disabled={loading}>
            {loading ? 'Saving...' : 'Save Question'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 text-lg font-semibold">Mark Question Outdated</h3>
        <p className="mb-3 text-sm text-muted-foreground">Paste a question ID to mark it for review.</p>
        <MarkOutdatedForm onMark={markOutdated} />
      </div>

      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  )
}

function MarkOutdatedForm({ onMark }: { onMark: (questionId: string) => Promise<void> }) {
  const [questionId, setQuestionId] = useState('')

  return (
    <div className="flex gap-2">
      <input
        className="w-full rounded border border-border bg-background p-2"
        placeholder="Question UUID"
        value={questionId}
        onChange={(e) => setQuestionId(e.target.value)}
      />
      <Button variant="secondary" onClick={() => onMark(questionId)} disabled={!questionId}>
        Mark Outdated
      </Button>
    </div>
  )
}
