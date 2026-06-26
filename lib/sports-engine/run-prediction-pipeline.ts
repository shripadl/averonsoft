import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import { insertPrediction } from '@/lib/sports-engine/db/predictions'
import { getStatsForFixture } from '@/lib/sports-engine/db/stats'
import { classifyProbability } from '@/lib/sports-engine/decision/decisionEngine'
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

function rawStatsForPrediction(
  fixture: Fixture,
  statRows: { feature_name: string; feature_value: number }[]
) {
  let raw = statsRowsToRawStats(statRows)
  let features = extractFeatures(raw)
  if (features.length === 0) {
    raw = rawStatsFallbackFromFixture(fixture)
    features = extractFeatures(raw)
  }
  return { raw, features }
}

async function predictFixture(
  sport: string,
  fixture: Fixture
): Promise<PredictionRunSummary> {
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

  return {
    fixture_id: fixtureId,
    sport,
    model_version: PREDICTION_MODEL_VERSION,
    probability: decision.probability,
    confidence: decision.confidence,
    decision_category: decision.category,
    prediction_id: row.id,
  }
}

export async function runPredictionPipelineForSport(
  sport: (typeof SPORTS)[number]
): Promise<PredictionRunSummary[]> {
  const fixtures = await getTodayFixturesBySportSlug(sport)
  return Promise.all(fixtures.map((fixture) => predictFixture(sport, fixture)))
}

/**
 * Runs the model for all fixtures in each sport window (football + cricket) in parallel.
 */
export async function runPredictionPipelineForToday(): Promise<PredictionRunSummary[]> {
  const batches = await Promise.all(SPORTS.map((sport) => runPredictionPipelineForSport(sport)))
  return batches.flat()
}
