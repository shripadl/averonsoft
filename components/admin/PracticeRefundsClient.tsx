'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type RefundEvent = {
  id: string
  provider: string
  provider_event_id: string
  user_id: string
  user_email: string | null
  plan_type: string
  exam_slugs: string[]
  attempts_per_exam: number
  status: string
  refund_decision: string | null
  refund_note: string | null
  updated_at: string
}

export function PracticeRefundsClient() {
  const [rows, setRows] = useState<RefundEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'all'>('pending')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setStatus(null)
    try {
      const p = new URLSearchParams({ status: filterStatus })
      if (search.trim()) p.set('q', search.trim())
      const res = await fetch(`/api/admin/practice/refunds?${p.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load')
      setRows(data.refunds || [])
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function resolve(id: string, action: 'revoke' | 'allow') {
    setStatus(null)
    try {
      const res = await fetch('/api/admin/practice/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to resolve refund')
      setStatus(`Refund ${action === 'revoke' ? 'revoked' : 'allowed'} successfully.`)
      await load()
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Failed to resolve refund')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        For each refunded payment, choose whether to revoke remaining purchased attempts or allow continued usage as goodwill.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>Status</span>
          <select
            className="rounded border border-border bg-background px-3 py-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'pending' | 'resolved' | 'all')}
          >
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="all">All</option>
          </select>
        </label>
        <label className="flex min-w-[260px] flex-1 flex-col gap-1 text-sm">
          <span>Search by user email or id</span>
          <input
            className="rounded border border-border bg-background px-3 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void load()
            }}
            placeholder="user@example.com"
          />
        </label>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          Apply
        </Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      {!loading && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filterStatus === 'pending' ? 'No pending refund cases.' : 'No refund cases found for this filter.'}
        </p>
      ) : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium">{row.plan_type}</p>
            <p className="text-xs text-muted-foreground">
              User: {row.user_email ? `${row.user_email} (${row.user_id})` : row.user_id}
            </p>
            <p className="text-xs text-muted-foreground">
              Exams: {(row.exam_slugs || []).join(', ')} · Attempts per exam: {row.attempts_per_exam}
            </p>
            <p className="text-xs text-muted-foreground">
              Provider: {row.provider} · Event: {row.provider_event_id}
            </p>
            {row.refund_decision === 'pending' ? (
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={() => void resolve(row.id, 'allow')}>
                  Allow (goodwill)
                </Button>
                <Button variant="destructive" onClick={() => void resolve(row.id, 'revoke')}>
                  Revoke attempts
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Decision: {row.refund_decision || 'n/a'}
                {row.refund_note ? ` · Note: ${row.refund_note}` : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
