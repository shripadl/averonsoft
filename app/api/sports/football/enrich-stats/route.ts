import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import { enrichFootballStatsBatch } from '@/lib/sports-engine/ingestion/football-stats'
import { runPredictionPipelineForFootballFixtures } from '@/lib/sports-engine/run-prediction-pipeline'

/** Batched v2 stats enrichment; re-predicts only fixtures that received new stats. */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = Math.min(
    100,
    Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? '50'))
  )

  try {
    const batch = await enrichFootballStatsBatch(limit)
    let predictionsAdded = 0
    if (batch.fixtureIds.length > 0) {
      const fixtures = await getTodayFixturesBySportSlug('football')
      const idSet = new Set(batch.fixtureIds)
      const toPredict = fixtures.filter((f) => idSet.has(Number(f.id)))
      const preds = await runPredictionPipelineForFootballFixtures(toPredict)
      predictionsAdded = preds.length
    }

    return NextResponse.json({
      status: 'ok',
      football_stats_enriched: batch.enriched,
      football_predictions_added: predictionsAdded,
      generated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('Football enrich-stats failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Enrichment failed' },
      { status: 500 }
    )
  }
}
