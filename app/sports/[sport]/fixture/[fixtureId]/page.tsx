import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SportsDisclaimer } from '@/components/sports/SportsDisclaimer'
import { getServerFetchBaseUrl } from '@/lib/sports-engine/get-base-url'

type PageProps = {
  params: Promise<{ sport: string; fixtureId: string }>
}

type FixtureDetailResponse = {
  entry: {
    fixture: {
      id: number
      home_team: string
      away_team: string
      start_time: string
      status: string
    }
    prediction: {
      id: number
      model_version: string
      probability: number
      confidence: string
      decision_category: string
      created_at: string
    } | null
    forecast: {
      home_edge_probability: number | null
      away_edge_probability: number | null
      model_lean: string
      signal_strength: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
      summary: string
    }
  }
  history_results_public_visible: boolean
  outcome: {
    result_label: string
    resolved_at: string
  } | null
  stats: { feature_name: string; feature_value: number }[]
  prediction_history: {
    id: number
    model_version: string
    probability: number
    confidence: string
    decision_category: string
    created_at: string
    predicted_lean: 'home' | 'away'
    actual_result: string | null
    hit: boolean | null
    error_abs: number | null
  }[]
}

async function fetchFixtureDetail(
  sport: string,
  fixtureId: string
): Promise<FixtureDetailResponse | null> {
  const base = await getServerFetchBaseUrl()
  const res = await fetch(`${base}/api/sports/${sport}/fixtures/${fixtureId}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load fixture details')
  return (await res.json()) as FixtureDetailResponse
}

export default async function FixtureDetailPage({ params }: PageProps) {
  const { sport, fixtureId } = await params
  const detail = await fetchFixtureDetail(sport, fixtureId)
  if (!detail) notFound()

  const { fixture } = detail.entry
  const homePct =
    detail.entry.forecast.home_edge_probability != null
      ? `${(detail.entry.forecast.home_edge_probability * 100).toFixed(0)}%`
      : '—'
  const awayPct =
    detail.entry.forecast.away_edge_probability != null
      ? `${(detail.entry.forecast.away_edge_probability * 100).toFixed(0)}%`
      : '—'
  const trendPoints = detail.prediction_history
    .slice(0, 12)
    .map((h) => ({ id: h.id, pct: Math.max(0, Math.min(100, h.probability * 100)) }))
    .reverse()
  const sparkW = 420
  const sparkH = 64
  const sparkCoords = trendPoints.map((p, i) => {
    const x = trendPoints.length <= 1 ? sparkW / 2 : (i / (trendPoints.length - 1)) * sparkW
    const y = ((100 - p.pct) / 100) * sparkH
    return { ...p, x, y }
  })
  const sparkPath = sparkCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {fixture.home_team} vs {fixture.away_team}
          </h1>
          <Link
            href={`/sports/${sport}`}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-hover"
          >
            Back
          </Link>
        </div>

        <SportsDisclaimer compact />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-xs text-muted-foreground">Home edge</div>
            <div className="mt-1 text-2xl font-semibold">{homePct}</div>
            <div className="text-xs text-muted-foreground">{fixture.home_team}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-xs text-muted-foreground">Away edge</div>
            <div className="mt-1 text-2xl font-semibold">{awayPct}</div>
            <div className="text-xs text-muted-foreground">{fixture.away_team}</div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="text-xs text-muted-foreground">Model lean</div>
            <div className="mt-1 text-lg font-semibold">{detail.entry.forecast.model_lean}</div>
            <div className="text-xs text-muted-foreground">{detail.entry.forecast.summary}</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="font-semibold">Match info</h2>
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Start: {new Date(fixture.start_time).toLocaleString()}</div>
            <div>Status: {fixture.status}</div>
            <div>Signal strength: {detail.entry.forecast.signal_strength}</div>
            <div>
              Outcome:{' '}
              {detail.outcome ? (
                <span className="text-foreground">
                  {detail.outcome.result_label} ({new Date(detail.outcome.resolved_at).toLocaleString()})
                </span>
              ) : (
                <span className="text-muted-foreground">pending</span>
              )}
            </div>
          </div>
        </div>

        {detail.history_results_public_visible ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h2 className="font-semibold">Prediction history</h2>
            {trendPoints.length ? (
            <div className="mt-3 rounded-md border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Probability trend (oldest → newest)</span>
                <span>{trendPoints[trendPoints.length - 1]?.pct.toFixed(0)}% latest</span>
              </div>
              <svg
                viewBox={`0 0 ${sparkW} ${sparkH}`}
                className="h-16 w-full"
                role="img"
                aria-label="Prediction probability trend"
              >
                <line x1="0" y1={sparkH} x2={sparkW} y2={sparkH} stroke="currentColor" opacity="0.2" />
                <line x1="0" y1={sparkH / 2} x2={sparkW} y2={sparkH / 2} stroke="currentColor" opacity="0.12" />
                {trendPoints.length > 1 ? (
                  <path d={sparkPath} fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                ) : null}
                {sparkCoords.map((p) => (
                  <circle key={p.id} cx={p.x} cy={p.y} r="2.5" className="fill-primary" />
                ))}
              </svg>
            </div>
            ) : null}
            {detail.prediction_history.length ? (
              <div className="mt-3 space-y-2 text-sm">
                {detail.prediction_history.slice(0, 8).map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-col gap-1 border-b border-border pb-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="text-muted-foreground">
                      {new Date(h.created_at).toLocaleString()} • {h.model_version}
                    </div>
                    <div>
                      {(h.probability * 100).toFixed(0)}% • {h.confidence} • {h.decision_category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {h.actual_result ? (
                        <>
                          actual: {h.actual_result} •{' '}
                          {h.hit == null ? 'n/a' : h.hit ? 'hit' : 'miss'} • error:{' '}
                          {h.error_abs == null ? 'n/a' : `${(h.error_abs * 100).toFixed(0)}%`}
                        </>
                      ) : (
                        <>actual: pending</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No prediction history yet.</p>
            )}
          </div>
        ) : null}

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="font-semibold">Model input stats</h2>
          {detail.stats.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
              {detail.stats.map((s) => (
                <div key={s.feature_name} className="rounded border border-border bg-background px-3 py-2">
                  <span className="text-muted-foreground">{s.feature_name}: </span>
                  <span>{s.feature_value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No stored stats found for this fixture. Fallback deterministic features may have been used.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
