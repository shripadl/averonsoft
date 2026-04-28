'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExamQuestion, QuestionDifficulty } from '@/lib/practice/types'

type ExamListItem = { id: string; slug: string; name: string }

type ListResponse = {
  exam: { id: string; slug: string; name: string }
  questions: ExamQuestion[]
  total: number
  page: number
  pageSize: number
  domains: string[]
}

const DIFFICULTIES: QuestionDifficulty[] = ['easy', 'medium', 'hard']
const DEFAULT_PAGE_SIZE = 25

function preview(text: string, max = 100) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

function parseFromUrl(searchParams: { get: (k: string) => string | null }, exams: ExamListItem[]) {
  const exam = searchParams.get('exam')?.trim() || null
  const d = searchParams.get('difficulty') || ''
  const diff = d === 'easy' || d === 'medium' || d === 'hard' ? d : ''
  const o = searchParams.get('outdated') || 'all'
  const out = o === 'true' || o === 'false' || o === 'all' ? o : 'all'
  return {
    exam: exam && exams.some((e) => e.slug === exam) ? exam : null,
    q: searchParams.get('q') || '',
    domain: searchParams.get('domain') || '',
    difficulty: diff,
    outdated: out,
    page: Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1),
  }
}

export function PracticeQuestionsAdminClient({
  exams,
  searchParams: searchParamsFromServer,
}: {
  exams: ExamListItem[]
  searchParams: { get: (k: string) => string | null }
}) {
  const router = useRouter()
  const pathname = usePathname()

  const fromUrl = parseFromUrl(searchParamsFromServer, exams)

  const [examSlug, setExamSlug] = useState(() => fromUrl.exam ?? exams[0]?.slug ?? '')
  const [q, setQ] = useState(fromUrl.q)
  const [domain, setDomain] = useState(fromUrl.domain)
  const [difficulty, setDifficulty] = useState(fromUrl.difficulty)
  const [outdated, setOutdated] = useState(fromUrl.outdated)
  const [page, setPage] = useState(fromUrl.page)

  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<ExamQuestion | null>(null)
  const [saving, setSaving] = useState(false)
  const [bulkMsg, setBulkMsg] = useState<string | null>(null)

  const filterRef = useRef({ q, domain, difficulty, outdated })
  useEffect(() => {
    filterRef.current = { q, domain, difficulty, outdated }
  }, [q, domain, difficulty, outdated])

  const syncUrl = useCallback(() => {
    const p = new URLSearchParams()
    p.set('exam', examSlug)
    if (q.trim()) p.set('q', q.trim())
    if (domain) p.set('domain', domain)
    if (difficulty) p.set('difficulty', difficulty)
    if (outdated !== 'all') p.set('outdated', outdated)
    if (page > 1) p.set('page', String(page))
    const qs = p.toString()
    const href = qs ? `${pathname}?${qs}` : pathname
    router.replace(href, { scroll: false })
  }, [examSlug, q, domain, difficulty, outdated, page, pathname, router])

  const load = useCallback(async () => {
    if (!examSlug) return
    const { q: fq, domain: dom, difficulty: dif, outdated: ood } = filterRef.current
    setLoading(true)
    setError(null)
    setBulkMsg(null)
    try {
      const p = new URLSearchParams({
        examSlug,
        page: String(page),
        pageSize: String(DEFAULT_PAGE_SIZE),
      })
      if (fq.trim()) p.set('q', fq.trim())
      if (dom) p.set('domain', dom)
      if (dif) p.set('difficulty', dif)
      if (ood === 'true' || ood === 'false') p.set('outdated', ood)

      const res = await fetch(`/api/practice/admin/questions?${p}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load')
      setData(json as ListResponse)
      setSelected(new Set())
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }, [examSlug, page])

  useEffect(() => {
    void load()
  }, [load])

  function applyFilters() {
    if (page === 1) {
      void load()
    } else {
      setPage(1)
    }
  }

  useEffect(() => {
    syncUrl()
  }, [syncUrl])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectPage() {
    if (!data?.questions) return
    setSelected(new Set(data.questions.map((x) => x.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function bulkSetOutdated(is_outdated: boolean) {
    const ids = [...selected]
    if (ids.length === 0) return
    setBulkMsg(null)
    setSaving(true)
    try {
      const res = await fetch('/api/practice/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: ids, is_outdated }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Bulk update failed')
      setBulkMsg(`Updated ${json.updated} question(s).`)
      clearSelection()
      await load()
    } catch (e) {
      setBulkMsg(e instanceof Error ? e.message : 'Bulk update failed')
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    setError(null)
    try {
      const o = editing.options
      if (!Array.isArray(o) || o.length < 2) throw new Error('At least 2 options required')
      const res = await fetch(`/api/practice/admin/questions/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: editing.question_text,
          options: o,
          correct_option_id: editing.correct_option_id,
          explanation: editing.explanation,
          difficulty: editing.difficulty,
          domain: editing.domain?.trim() || null,
          is_outdated: editing.is_outdated,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Save failed')
      setEditing(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Only edit original, scenario-based learning content. This tool is for maintenance and does not change legal disclaimers shown to learners.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[200px] flex-col gap-1 text-sm">
          <span>Exam</span>
          <select
            className="rounded border border-border bg-background px-3 py-2 text-foreground"
            value={examSlug}
            onChange={(e) => {
              setExamSlug(e.target.value)
              setPage(1)
              setDomain('')
            }}
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.slug}>
                {ex.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[180px] flex-1 flex flex-col gap-1 text-sm">
          <span>Search question text</span>
          <input
            className="rounded border border-border bg-background px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyFilters()
            }}
            placeholder="Match text in stem…"
          />
        </label>
        <label className="flex min-w-[140px] flex-col gap-1 text-sm">
          <span>Domain</span>
          <input
            list="question-domains"
            className="rounded border border-border bg-background px-3 py-2"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Filter (exact)"
          />
          <datalist id="question-domains">
            {data?.domains.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </label>
        <label className="flex min-w-[120px] flex-col gap-1 text-sm">
          <span>Difficulty</span>
          <select
            className="rounded border border-border bg-background px-3 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Any</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[120px] flex-col gap-1 text-sm">
          <span>Outdated</span>
          <select
            className="rounded border border-border bg-background px-3 py-2"
            value={outdated}
            onChange={(e) => setOutdated(e.target.value)}
          >
            <option value="all">All</option>
            <option value="true">Outdated only</option>
            <option value="false">Not outdated</option>
          </select>
        </label>
        <Button type="button" variant="secondary" onClick={() => applyFilters()}>
          Apply
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {bulkMsg ? <p className="text-sm text-muted-foreground">{bulkMsg}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={selectPage} disabled={!data?.questions.length}>
          Select page
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={clearSelection} disabled={selected.size === 0}>
          Clear selection
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={selected.size === 0 || saving}
          onClick={() => void bulkSetOutdated(true)}
        >
          Mark selected outdated
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={selected.size === 0 || saving}
          onClick={() => void bulkSetOutdated(false)}
        >
          Mark selected current
        </Button>
        <span className="text-sm text-muted-foreground">
          {selected.size > 0 ? `${selected.size} selected` : data ? `${data.total} total` : null}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        {loading && !data ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-foreground-secondary">
              <tr>
                <th className="w-8 p-2" />
                <th className="p-2">Preview</th>
                <th className="p-2">Domain</th>
                <th className="p-2">Difficulty</th>
                <th className="p-2">Outdated</th>
                <th className="p-2 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.questions || []).map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      className="rounded border-border"
                      aria-label={`Select ${row.id}`}
                    />
                  </td>
                  <td className="p-2 align-top text-foreground">{preview(row.question_text, 120)}</td>
                  <td className="p-2 align-top text-muted-foreground">{row.domain ?? '—'}</td>
                  <td className="p-2 align-top capitalize">{row.difficulty}</td>
                  <td className="p-2 align-top">{row.is_outdated ? 'Yes' : 'No'}</td>
                  <td className="p-2 align-top">
                    <Button type="button" size="sm" variant="ghost" className="h-auto p-0 px-0 underline" onClick={() => setEditing({ ...row })}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {data.page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit question</CardTitle>
            <p className="text-xs text-muted-foreground font-mono">{editing.id}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>Question</span>
              <textarea
                className="min-h-[100px] rounded border border-border bg-background p-2 font-sans"
                value={editing.question_text}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, question_text: e.target.value } : null))}
              />
            </label>
            {(
              (Array.isArray(editing.options) && editing.options.length
                ? editing.options
                : [
                    { id: 'A', text: '' },
                    { id: 'B', text: '' },
                    { id: 'C', text: '' },
                    { id: 'D', text: '' },
                  ]) as { id: string; text: string }[]
            ).map((opt, i) => (
              <label key={opt.id || i} className="flex flex-col gap-1 text-sm">
                <span>Option {String.fromCharCode(65 + i)}</span>
                <input
                  className="rounded border border-border bg-background p-2"
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...(editing.options as { id: string; text: string }[])]
                    next[i] = { ...next[i], text: e.target.value, id: next[i]?.id || String.fromCharCode(65 + i) }
                    setEditing((prev) => (prev ? { ...prev, options: next } : null))
                  }}
                />
              </label>
            ))}
            <label className="flex flex-col gap-1 text-sm">
              <span>Correct option</span>
              <select
                className="rounded border border-border bg-background px-3 py-2"
                value={editing.correct_option_id}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, correct_option_id: e.target.value } : null))}
              >
                {(['A', 'B', 'C', 'D'] as const).map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Explanation</span>
              <textarea
                className="min-h-[80px] rounded border border-border bg-background p-2"
                value={editing.explanation}
                onChange={(e) => setEditing((prev) => (prev ? { ...prev, explanation: e.target.value } : null))}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="flex min-w-[140px] flex-col gap-1 text-sm">
                <span>Domain</span>
                <input
                  className="rounded border border-border bg-background px-3 py-2"
                  value={editing.domain ?? ''}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, domain: e.target.value || null } : null))}
                />
              </label>
              <label className="flex min-w-[120px] flex-col gap-1 text-sm">
                <span>Difficulty</span>
                <select
                  className="rounded border border-border bg-background px-3 py-2"
                  value={editing.difficulty}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            difficulty: e.target.value as QuestionDifficulty,
                          }
                        : null,
                    )
                  }
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 pt-6 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_outdated}
                  onChange={(e) => setEditing((prev) => (prev ? { ...prev, is_outdated: e.target.checked } : null))}
                />
                Mark as outdated
              </label>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="button" onClick={() => void saveEdit()} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Per-exam quick add: <Link className="underline" href={examSlug ? `/practice/${examSlug}/admin` : '/admin'}>Practice admin for this exam</Link>
      </p>
    </div>
  )
}
