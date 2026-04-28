import { classifyProbability } from '@/lib/sports-engine/decision/decisionEngine'
import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import { insertPrediction } from '@/lib/sports-engine/db/predictions'
import { getStatsForFixture } from '@/lib/sports-engine/db/stats'
import { extractFeatures } from '@/lib/sports-engine/prediction/featureExtractor'
import { rawStatsFallbackFromFixture } from '@/lib/sports-engine/prediction/fallbackRawStats'
import { computeProbability } from '@/lib/sports-engine/prediction/model'
import { normaliseFeatures } from '@/lib/sports-engine/prediction/normaliser'
import { statsRowsToRawStats } from '@/lib/sports-engine/prediction/statsRowsToRawStats'

export const PREDICTION_MODEL_VERSION = 'v1-basic'

const SPORTS = ['football', 'cricket'] as const

export type PredictionRunSummary = {
  fixture_id: number
  sport: string
  model_version: string
  probability: number
  confidence: string
  decision_category: string
  prediction_id: number
}

function rawStatsForPrediction(fixture: Fixture, statRows: { feature_name: string; feature_value: number }[]) {
  let raw = statsRowsToRawStats(statRows)
  let features = extractFeatures(raw)
  if (features.length === 0) {
    raw = rawStatsFallbackFromFixture(fixture)
    features = extractFeatures(raw)
  }
  return { raw, features }
}

/**
 * Runs the model for all of today’s fixtures (football + cricket) and inserts prediction rows.
 * Used by `/api/sports/predictions/run` and after `/api/sports/ingestion/run` so UI stays in sync.
 */
export async function runPredictionPipelineForToday(): Promise<PredictionRunSummary[]> {
  const predictions: PredictionRunSummary[] = []

  for (const sport of SPORTS) {
    const fixtures = await getTodayFixturesBySportSlug(sport)

    for (const fixture of fixtures) {
      const fixtureId = Number(fixture.id)
      const statRows = await getStatsForFixture(fixtureId)
      const { features } = rawStatsForPrediction(fixture, statRows)
      const normalised = normaliseFeatures(features)
      const probability = computeProbability(normalised)
      const decision = classifyProbability(probability)

      const row = await insertPrediction({
        fixture_id: fixtureId,
        model_version: PREDICTION_MODEL_VERSION,
        probability: decision.probability,
        confidence: decision.confidence,
        decision_category: decision.category,
      })

      predictions.push({
        fixture_id: fixtureId,
        sport,
        model_version: PREDICTION_MODEL_VERSION,
        probability: decision.probability,
        confidence: decision.confidence,
        decision_category: decision.category,
        prediction_id: row.id,
      })
    }
  }

  return predictions
}
