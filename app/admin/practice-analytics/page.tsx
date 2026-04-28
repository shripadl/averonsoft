import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PASS_PERCENTAGE } from '@/lib/practice/constants'

type AttemptRow = {
  id: string
  exam_id: string
  score: number
  total_questions: number
}

type ResponseRow = {
  attempt_id: string
  question_id: string
  is_correct: boolean
}

type QuestionRow = {
  id: string
  exam_id: string
  domain: string | null
}

type ExamRow = {
  id: string
  slug: string
  name: string
  provider: string
}

export default async function PracticeAnalyticsPage() {
  await requireAdmin('readonly')
  const supabase = await createClient()

  const [{ data: exams }, { data: attempts }, { data: responses }, { data: questions }] = await Promise.all([
    supabase.from('exams').select('id, slug, name, provider').eq('is_active', true).order('provider').order('name'),
    supabase.from('user_exam_attempts').select('id, exam_id, score, total_questions').order('completed_at', { ascending: false }).limit(5000),
    supabase.from('user_exam_responses').select('attempt_id, question_id, is_correct').limit(50000),
    supabase.from('exam_questions').select('id, exam_id, domain').eq('is_outdated', false).limit(20000),
  ])

  const examList = (exams || []) as ExamRow[]
  const attemptRows = (attempts || []) as AttemptRow[]
  const responseRows = (responses || []) as ResponseRow[]
  const questionRows = (questions || []) as QuestionRow[]

  const totalAttempts = attemptRows.length
  const avgScorePct = totalAttempts
    ? Math.round(
        (attemptRows.reduce((sum, a) => sum + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) /
          totalAttempts) *
          10,
      ) / 10
    : 0
  const passCount = attemptRows.filter(
    (a) => a.total_questions > 0 && ((a.score / a.total_questions) * 100 >= PASS_PERCENTAGE),
  ).length
  const passRate = totalAttempts ? Math.round((passCount / totalAttempts) * 1000) / 10 : 0

  const attemptsByExam = new Map<string, AttemptRow[]>()
  for (const attempt of attemptRows) {
    const arr = attemptsByExam.get(attempt.exam_id) || []
    arr.push(attempt)
    attemptsByExam.set(attempt.exam_id, arr)
  }

  const questionById = new Map(questionRows.map((q) => [q.id, q]))
  const examById = new Map(examList.map((e) => [e.id, e]))
  const attemptById = new Map(attemptRows.map((a) => [a.id, a]))

  const weakByDomain = new Map<string, { total: number; incorrect: number }>()
  for (const response of responseRows) {
    const attempt = attemptById.get(response.attempt_id)
    if (!attempt) continue
    const question = questionById.get(response.question_id)
    if (!question) continue
    const domain = question.domain || 'Unspecified'
    const current = weakByDomain.get(domain) || { total: 0, incorrect: 0 }
    current.total += 1
    if (!response.is_correct) current.incorrect += 1
    weakByDomain.set(domain, current)
  }

  const weakDomains = [...weakByDomain.entries()]
    .map(([domain, stats]) => ({
      domain,
      attempts: stats.total,
      incorrectRate: stats.total > 0 ? (stats.incorrect / stats.total) * 100 : 0,
    }))
    .filter((row) => row.attempts >= 20)
    .sort((a, b) => b.incorrectRate - a.incorrectRate)
    .slice(0, 10)

  const examStats = examList.map((exam) => {
    const rows = attemptsByExam.get(exam.id) || []
    const attemptsCount = rows.length
    const avgPct = attemptsCount
      ? Math.round(
          (rows.reduce((sum, a) => sum + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) /
            attemptsCount) *
            10,
        ) / 10
      : 0
    const pass = rows.filter((a) => a.total_questions > 0 && ((a.score / a.total_questions) * 100 >= PASS_PERCENTAGE)).length
    const rate = attemptsCount ? Math.round((pass / attemptsCount) * 1000) / 10 : 0

    return {
      exam,
      attemptsCount,
      avgPct,
      passRate: rate,
    }
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Attempts, score quality, pass rate, and domain weak spots.
          </p>
        </div>
        <Link href="/admin" className="rounded border border-border px-4 py-2 text-sm hover:bg-surface-hover">
          Back to Admin
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAttempts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <CardDescription>Across all captured attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScorePct}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CardDescription>Threshold: {PASS_PERCENTAGE}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{passRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Per-Exam Performance</CardTitle>
            <CardDescription>Attempts, average score, and pass rate per exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examStats.map((row) => (
                <div key={row.exam.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">{row.exam.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.exam.provider} · <code>{row.exam.slug}</code>
                  </p>
                  <p className="mt-2 text-sm">
                    Attempts: {row.attemptsCount} · Avg: {row.avgPct}% · Pass rate: {row.passRate}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain Weak Spots</CardTitle>
            <CardDescription>Top domains by incorrect-rate (minimum 20 responses)</CardDescription>
          </CardHeader>
          <CardContent>
            {weakDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enough domain response data yet.</p>
            ) : (
              <div className="space-y-3">
                {weakDomains.map((row) => (
                  <div key={row.domain} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">{row.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      Responses: {row.attempts}
                    </p>
                    <p className="mt-1 text-sm text-amber-600">
                      Incorrect rate: {Math.round(row.incorrectRate * 10) / 10}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

