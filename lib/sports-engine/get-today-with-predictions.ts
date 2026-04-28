import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import {
  getPredictionsForFixtureIds,
  type PredictionRow,
} from '@/lib/sports-engine/db/predictions'

export type FixtureWithPrediction = {
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

export type SportsDataMeta = {
  fixtures_count: number
  predicted_count: number
  generated_at: string
  stale: boolean
}

export function buildForecast(
  fixture: Fixture,
  prediction: PredictionRow | null
): FixtureWithPrediction['forecast'] {
  if (!prediction) {
    return {
      home_edge_probability: null,
      away_edge_probability: null,
      model_lean: 'No model output yet',
      signal_strength: 'NONE',
      summary: 'Waiting for model output',
    }
  }

  const home = Math.max(0, Math.min(1, prediction.probability))
  const away = 1 - home
  const signal =
    prediction.confidence === 'HIGH'
      ? 'HIGH'
      : prediction.confidence === 'MEDIUM'
        ? 'MEDIUM'
        : 'LOW'
  const lean = home >= 0.5 ? fixture.home_team : fixture.away_team
  const summary =
    signal === 'HIGH'
      ? `Strong lean toward ${lean}`
      : signal === 'MEDIUM'
        ? `Moderate lean toward ${lean}`
        : `Weak lean toward ${lean}`

  return {
    home_edge_probability: home,
    away_edge_probability: away,
    model_lean: lean,
    signal_strength: signal,
    summary,
  }
}

/**
 * Today’s fixtures for a sport slug, each paired with the latest prediction (if any).
 */
export async function getTodayFixturesWithPredictions(
  sportSlug: string
): Promise<FixtureWithPrediction[]> {
  const fixtures = await getTodayFixturesBySportSlug(sportSlug)
  const ids = fixtures.map((f) => Number(f.id))
  const preds = await getPredictionsForFixtureIds(ids)

  const latestByFixtureId = new Map<number, PredictionRow>()
  for (const p of preds) {
    const fid = Number(p.fixture_id)
    if (!latestByFixtureId.has(fid)) {
      latestByFixtureId.set(fid, p)
    }
  }

  return fixtures.map((fixture) => {
    const prediction = latestByFixtureId.get(Number(fixture.id)) ?? null
    return {
      fixture,
      prediction,
      forecast: buildForecast(fixture, prediction),
    }
  })
}

export function buildSportsDataMeta(entries: FixtureWithPrediction[]): SportsDataMeta {
  const fixturesCount = entries.length
  const predicted = entries.filter((e) => e.prediction != null)
  const predictedCount = predicted.length
  const newestPredictionTs = predicted
    .map((e) => e.prediction?.created_at)
    .filter((v): v is string => Boolean(v))
    .sort()
    .at(-1)
  const generatedAt = newestPredictionTs ?? new Date().toISOString()
  const staleMs = Date.now() - new Date(generatedAt).getTime()
  const stale = Number.isFinite(staleMs) ? staleMs > 12 * 60 * 60 * 1000 : true

  return {
    fixtures_count: fixturesCount,
    predicted_count: predictedCount,
    generated_at: generatedAt,
    stale,
  }
}
