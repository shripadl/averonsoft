'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ExamOption = { slug: string; name: string; provider: string }

type Mode = 'single' | 'multiple' | 'all'

export function PracticeResetAttemptsClient({
  exams,
  canEdit,
  initialExamSlug,
}: {
  exams: ExamOption[]
  canEdit: boolean
  initialExamSlug?: string | null
}) {
  const [mode, setMode] = useState<Mode>('single')
  const [examSlug, setExamSlug] = useState(
    initialExamSlug && exams.some((e) => e.slug === initialExamSlug) ? initialExamSlug : exams[0]?.slug ?? '',
  )
  const [selectedExamSlugs, setSelectedExamSlugs] = useState<string[]>(
    initialExamSlug && exams.some((e) => e.slug === initialExamSlug) ? [initialExamSlug] : [],
  )
  const [emailsText, setEmailsText] = useState('')
  const [userIdsText, setUserIdsText] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function runReset() {
    setStatus(null)
    setLoading(true)
    try {
      const emails = emailsText
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter(Boolean)
      const userIds = userIdsText
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter(Boolean)

      if (emails.length === 0 && userIds.length === 0) {
        setStatus('Enter at least one email or user UUID.')
        return
      }
      if (mode === 'single' && !examSlug) {
        setStatus('Select an exam.')
        return
      }
      if (mode === 'multiple' && selectedExamSlugs.length === 0) {
        setStatus('Select at least one exam for multiple mode.')
        return
      }

      const res = await fetch('/api/admin/practice/reset-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          ...(mode === 'single' ? { examSlug } : {}),
          ...(mode === 'multiple' ? { examSlugs: selectedExamSlugs } : {}),
          ...(emails.length ? { emails } : {}),
          ...(userIds.length ? { userIds } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data?.error || 'Request failed')
        return
      }
      const parts = [
        `Reset ${data.resetCount}/${data.totalOperations} operation(s) for ${data.userCount} user(s).`,
        data.examSlugs?.length ? `Exams: ${data.examSlugs.join(', ')}` : null,
        data.notFoundEmails?.length ? `Emails not found: ${data.notFoundEmails.join(', ')}` : null,
        data.failures?.length
          ? `Failures: ${data.failures.map((f: { userId: string; error: string }) => `${f.userId}: ${f.error}`).join(' | ')}`
          : null,
      ]
        .filter(Boolean)
        .join(' ')
      setStatus(parts)
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (exams.length === 0) {
    return <p className="text-sm text-muted-foreground">No active exams in the database.</p>
  }
  if (!canEdit) {
    return <p className="text-sm text-muted-foreground">Read-only admin role cannot run reset actions.</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 rounded border border-border bg-surface p-3 text-sm md:grid-cols-3">
        <label className="inline-flex items-center gap-2">
          <input type="radio" checked={mode === 'single'} onChange={() => setMode('single')} />
          Single exam
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" checked={mode === 'multiple'} onChange={() => setMode('multiple')} />
          Multiple exams
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" checked={mode === 'all'} onChange={() => setMode('all')} />
          All exams
        </label>
      </div>

      {mode === 'single' ? (
        <label className="flex max-w-md flex-col gap-1 text-sm">
          <span>Exam</span>
          <select
            className="rounded border border-border bg-background px-3 py-2"
            value={examSlug}
            onChange={(e) => setExamSlug(e.target.value)}
          >
            {exams.map((ex) => (
              <option key={ex.slug} value={ex.slug}>
                {ex.name} ({ex.provider})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {mode === 'multiple' ? (
        <div className="space-y-2 rounded border border-border bg-surface p-3">
          <p className="text-sm font-medium">Select one or more exams</p>
          <div className="grid gap-2 md:grid-cols-2">
            {exams.map((ex) => {
              const checked = selectedExamSlugs.includes(ex.slug)
              return (
                <label key={ex.slug} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedExamSlugs((prev) =>
                        checked ? prev.filter((s) => s !== ex.slug) : [...prev, ex.slug],
                      )
                    }
                  />
                  {ex.name} ({ex.provider})
                </label>
              )
            })}
          </div>
        </div>
      ) : null}

      {mode === 'all' ? (
        <p className="text-sm text-muted-foreground">
          All active exams will be reset for selected users ({exams.length} exams).
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span>User emails (one per line, or comma-separated)</span>
        <textarea
          className="min-h-[100px] rounded border border-border bg-background px-3 py-2 font-mono text-xs"
          value={emailsText}
          onChange={(e) => setEmailsText(e.target.value)}
          placeholder="user1@example.com&#10;user2@example.com"
        />
      </label>
      <p className="text-xs text-muted-foreground">Or</p>
      <label className="flex flex-col gap-1 text-sm">
        <span>User IDs (UUID, one per line or comma-separated)</span>
        <textarea
          className="min-h-[80px] rounded border border-border bg-background px-3 py-2 font-mono text-xs"
          value={userIdsText}
          onChange={(e) => setUserIdsText(e.target.value)}
        />
      </label>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Sets <strong>one free attempt</strong> remaining for the chosen exam scope: clears paid entitlements, marks the
        free attempt as unused, and removes any <strong>in-progress</strong> (unsubmitted) attempts. Completed attempt history
        is kept.
      </p>
      <Button onClick={() => void runReset()} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset attempts'}
      </Button>
      {status ? <p className="text-sm text-muted-foreground whitespace-pre-wrap">{status}</p> : null}
    </div>
  )
}
