import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import type { PredictionRow } from '@/lib/sports-engine/db/predictions'
import { decisionCategoryTextClass } from '@/lib/sports-engine/decision-category-styles'
import Link from 'next/link'

export type FixturePredictionEntry = {
  fixture: Fixture
  prediction: PredictionRow | null
  forecast: {
    home_edge_probability: number | null
    away_edge_probability: number | null
    model_lean: string
    signal_strength: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
    summary: string
  }
}

type Props = {
  entries: FixturePredictionEntry[]
  sportSlug?: string
  groupByDay?: boolean
}

function statusChipClass(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('live') || s === '1h' || s === '2h' || s === 'ht') {
    return 'border-red-500/30 bg-red-500/10 text-red-400'
  }
  if (s.includes('fin') || s === 'ft' || s === 'aet' || s === 'pen') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  }
  return 'border-border bg-background text-muted-foreground'
}

function confidenceBadgeClass(confidence: string): string {
  if (confidence === 'HIGH') return 'border-green-500/30 bg-green-500/10 text-green-400'
  if (confidence === 'MEDIUM') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
  if (confidence === 'LOW') return 'border-red-500/30 bg-red-500/10 text-red-400'
  return 'border-border bg-background text-muted-foreground'
}

function dayHeadingLabel(value: string): string {
  const d = new Date(`${value}T00:00:00`)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function byDay(entries: FixturePredictionEntry[]): Array<{ day: string; rows: FixturePredictionEntry[] }> {
  const map = new Map<string, FixturePredictionEntry[]>()
  for (const e of entries) {
    const day = e.fixture.start_time.slice(0, 10)
    const rows = map.get(day) ?? []
    rows.push(e)
    map.set(day, rows)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, rows]) => ({ day, rows }))
}

function FixtureRow({
  fixture,
  prediction,
  forecast,
  sportSlug,
}: FixturePredictionEntry & { sportSlug?: string }) {
  const catClass = decisionCategoryTextClass(prediction?.decision_category)
  const homeProb =
    forecast.home_edge_probability != null
      ? Math.max(0, Math.min(100, forecast.home_edge_probability * 100))
      : null
  const probPct = homeProb
  const probLabel = probPct != null ? `${probPct.toFixed(0)}%` : '—'
  const awayProbLabel =
    forecast.away_edge_probability != null
      ? `${(forecast.away_edge_probability * 100).toFixed(0)}%`
      : probPct != null
        ? `${(100 - probPct).toFixed(0)}%`
        : '—'
  const leanLabel = forecast.model_lean || '—'
  const confLabel = prediction?.confidence ?? '—'
  const categoryLabel = prediction?.decision_category ?? '—'

  const body = (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">
            {fixture.home_team} <span className="text-muted-foreground">vs</span> {fixture.away_team}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(fixture.start_time).toLocaleString()}</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 ${statusChipClass(fixture.status)}`}
            >
              {fixture.status}
            </span>
          </div>
        </div>
        <div className="min-w-[190px] text-right text-xs">
          <div className="text-muted-foreground">
            Home edge: <span className="text-foreground">{probLabel}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${probPct ?? 0}%` }}
            />
          </div>
          <div className="mt-1 text-muted-foreground">
            Away edge: <span className="text-foreground">{awayProbLabel}</span>
          </div>
          <div className="mt-1 text-muted-foreground">
            Model lean: <span className="text-foreground">{leanLabel}</span>
          </div>
          <div className="mt-1 text-muted-foreground">
            Insight: <span className="text-foreground">{forecast.summary}</span>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 ${confidenceBadgeClass(confLabel)}`}
            >
              {confLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-full border border-border px-2 py-0.5 ${prediction ? catClass : 'text-muted-foreground'}`}
            >
              {categoryLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  if (!sportSlug) return body
  return (
    <Link
      href={`/sports/${sportSlug}/fixture/${fixture.id}`}
      className="block transition hover:-translate-y-[1px] hover:opacity-95"
    >
      {body}
    </Link>
  )
}

export function TodayFixturesList({ entries, sportSlug, groupByDay = false }: Props) {
  if (!entries.length) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span>Sports data refresh is in progress.</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Fixtures and predictions can take a minute or two to appear after the scheduled or manual
          run.
        </p>
      </div>
    )
  }

  if (groupByDay) {
    const groups = byDay(entries)
    return (
      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.day} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dayHeadingLabel(g.day)}
            </h2>
            <div className="space-y-3">
              {g.rows.map((entry) => (
                <FixtureRow key={entry.fixture.id} sportSlug={sportSlug} {...entry} />
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <FixtureRow key={entry.fixture.id} sportSlug={sportSlug} {...entry} />
      ))}
    </div>
  )
}
