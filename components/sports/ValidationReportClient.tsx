'use client'

import { useCallback, useState } from 'react'
import type { ValidationRange, ValidationSummary } from '@/lib/sports-engine/validation/get-validation-report'
import { Download, Target, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'

function pct(value: number | null): string {
  if (value == null) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string
  hint?: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function ValidationReportClient({ initial }: { initial: ValidationSummary }) {
  const [range, setRange] = useState<ValidationRange>(initial.range)
  const [report, setReport] = useState<ValidationSummary>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportFrom, setExportFrom] = useState(report.from)
  const [exportTo, setExportTo] = useState(report.to)

  const load = useCallback(async (next: ValidationRange) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sports/validation/report?range=${next}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load validation report')
      const data = (await res.json()) as ValidationSummary
      setReport(data)
      setRange(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  const exportCsv = () => {
    const params = new URLSearchParams({ from: exportFrom, to: exportTo })
    window.location.href = `/api/sports/validation/export?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-border bg-surface p-1">
          {(['7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              disabled={loading}
              onClick={() => load(r)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === '7d' ? 'Last 7 days' : 'Last 30 days'}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="text-xs text-muted-foreground">
            From
            <input
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            To
            <input
              type="date"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-surface-hover"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Each finished match is scored against the model output from the <strong>day before kickoff</strong>.
        Draws and non-binary results are listed but excluded from hit-rate totals.
      </p>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Hit rate"
          value={pct(report.hit_rate)}
          hint={`${report.hits} hits / ${report.scorable} scorable`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="Evaluated"
          value={String(report.total_evaluated)}
          hint="Matches with prior-day prediction + outcome"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Hits"
          value={String(report.hits)}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        />
        <StatCard
          label="Misses"
          value={String(report.misses)}
          hint={report.avg_error_abs != null ? `Avg error ${report.avg_error_abs.toFixed(3)}` : undefined}
          icon={<XCircle className="h-4 w-4 text-red-400" />}
        />
      </div>

      {report.daily.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Daily breakdown
          </h2>
          <div className="space-y-2">
            {report.daily.map((d) => (
              <div
                key={d.date}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-2 text-sm"
              >
                <span className="font-medium">{d.date}</span>
                <span className="text-muted-foreground">
                  {d.hits}/{d.total} hits ({pct(d.hit_rate)})
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border bg-surface/60">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Match results
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Sport</th>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Predicted</th>
                <th className="px-4 py-3">Actual</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No validated matches in this window yet. Outcomes are resolved after each daily
                    ingestion run.
                  </td>
                </tr>
              ) : (
                report.rows.map((row) => (
                  <tr key={`${row.fixture_id}-${row.prediction_date}`} className="border-t border-border/60">
                    <td className="px-4 py-3 whitespace-nowrap">{row.start_time.slice(0, 10)}</td>
                    <td className="px-4 py-3 capitalize">{row.sport_slug}</td>
                    <td className="px-4 py-3">
                      {row.home_team} vs {row.away_team}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {row.predicted_lean} ({(row.probability * 100).toFixed(0)}%)
                    </td>
                    <td className="px-4 py-3">{row.actual_result.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      {row.hit === true ? (
                        <span className="text-emerald-500">Hit</span>
                      ) : row.hit === false ? (
                        <span className="text-red-400">Miss</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Report generated {new Date(report.generated_at).toLocaleString()}. For history beyond 30 days,
        use CSV export with a custom date range.
      </p>
    </div>
  )
}
