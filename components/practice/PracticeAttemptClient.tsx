'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Question {
  id: string
  question_text: string
  options: Array<{ id: string; text: string }>
}

interface PracticeAttemptClientProps {
  examSlug: string
  attemptId: string
  questions: Question[]
}

export function PracticeAttemptClient({ examSlug, attemptId, questions }: PracticeAttemptClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isReviewing, setIsReviewing] = useState(false)
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const current = questions[currentIndex]
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const progressPct = Math.round((answeredCount / Math.max(1, questions.length)) * 100)

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  function openSubmitConfirmation() {
    setIsConfirmingSubmit(true)
  }

  async function submitAttempt() {
    setIsSubmitting(true)
    try {
      const payload = {
        attemptId,
        questionIds: questions.map((question) => question.id),
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }

      const response = await fetch(`/api/practice/exams/${examSlug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.error || 'Failed to submit attempt')
      }

      router.push(`/practice/${examSlug}/result/${attemptId}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit attempt')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!current) {
    return <p className="text-sm text-rose-600">No questions available for this attempt.</p>
  }

  if (isConfirmingSubmit) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-amber-500/40 bg-surface p-5">
          <h2 className="text-lg font-semibold">Confirm Submission</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This will submit the exam and will consume one attempt. Are you sure you want to submit the exam?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Answered {answeredCount} of {questions.length} questions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setIsConfirmingSubmit(false)
              setIsReviewing(false)
            }}
            disabled={isSubmitting}
          >
            Back to Exam
          </Button>
          <Button variant="secondary" onClick={() => setIsConfirmingSubmit(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submitAttempt} disabled={isSubmitting || answeredCount === 0}>
            {isSubmitting ? 'Submitting...' : 'Yes, Submit Attempt'}
          </Button>
        </div>
      </div>
    )
  }

  if (isReviewing) {
    const unanswered = questions.filter((q) => !answers[q.id]).length

    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Review Answers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Answered {answeredCount} of {questions.length} questions.
            {unanswered > 0 ? ` ${unanswered} question(s) are still unanswered.` : ' All questions are answered.'}
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-surface p-5">
          {questions.map((question, index) => {
            const selected = answers[question.id]
            return (
              <div key={question.id} className="flex items-center justify-between rounded border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Question {index + 1}</p>
                  <p className="truncate text-xs text-muted-foreground">{question.question_text}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <span className={`text-xs ${selected ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selected ? `Answered (${selected})` : 'Unanswered'}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCurrentIndex(index)
                      setIsReviewing(false)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setIsReviewing(false)} disabled={isSubmitting}>
            Back to Questions
          </Button>
          <Button onClick={openSubmitConfirmation} disabled={isSubmitting || answeredCount === 0}>
            Submit Attempt
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full rounded bg-muted">
          <div className="h-2 rounded bg-indigo-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="mb-3 text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <p className="mb-4 text-lg font-medium">{current.question_text}</p>
        <div className="space-y-2">
          {current.options.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-start gap-2 rounded border border-border p-3 hover:border-primary/60">
              <input
                type="radio"
                name={current.id}
                checked={answers[current.id] === option.id}
                onChange={() => selectAnswer(current.id, option.id)}
                className="mt-1"
              />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </Button>
        <Button variant="secondary" onClick={() => setIsReviewing(true)} disabled={isSubmitting}>
          Review Answers
        </Button>
        <Button onClick={openSubmitConfirmation} disabled={isSubmitting || answeredCount === 0}>
          Submit Attempt
        </Button>
      </div>
    </div>
  )
}
