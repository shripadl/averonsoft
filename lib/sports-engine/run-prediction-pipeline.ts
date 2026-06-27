import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import { insertPrediction } from '@/lib/sports-engine/db/predictions'
import { getStatsForFixture } from '@/lib/sports-engine/db/stats'
import { classifyProbability } from '@/lib/sports-engine/decision/decisionEngine'
import { extractFeatures } from '@/lib/sports-engine/prediction/featureExtractor'
import { rawStatsFallbackFromFixture } from '@/lib/sports-engine/prediction/fallbackRawStats'
import { computeProbabilityV1, computeProbabilityV2 } from '@/lib/sports-engine/prediction/model-v2'
import { normaliseFeatures } from '@/lib/sports-engine/prediction/normaliser'
import { statsRowsToRawStats } from '@/lib/sports-engine/prediction/statsRowsToRawStats'

export const PREDICTION_MODEL_V1 = 'v1-basic'
export const PREDICTION_MODEL_V2_FOOTBALL = 'v2-football-form'

/** @deprecated Use PREDICTION_MODEL_V1 */
export const PREDICTION_MODEL_VERSION = PREDICTION_MODEL_V1

const SPORTS = ['football', 'cricket'] as const
const FOOTBALL_PREDICT_CHUNK = 40

export type PredictionRunSummary = {
  fixture_id: number
  sport: string
  model_version: string
  probability: number
  confidence: string
  decision_category: string
  prediction_id: number
}

async function mapInChunks<T, R>(
  items: T[],
  chunkSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const batch = await Promise.all(chunk.map(fn))
    out.push(...batch)
  }
  return out
}

function rawStatsForPrediction(fixture: Fixture, statRows: { feature_name: string; feature_value: number }[]) {
  const raw = statsRowsToRawStats(statRows)
  let features = extractFeatures(raw)
  const hasRealStats = statRows.some((r) => r.feature_name === 'homeAdvantageScore')

  if (features.length === 0 || !hasRealStats) {
    features = extractFeatures(rawStatsFallbackFromFixture(fixture))
    return { features, hasRealStats: false }
  }

  return { features, hasRealStats }
}

async function predictCricketFixture(fixture: Fixture): Promise<PredictionRunSummary> {
  const fixtureId = Number(fixture.id)
  const statRows = await getStatsForFixture(fixtureId)
  const { features } = rawStatsForPrediction(fixture, statRows)
  const normalised = normaliseFeatures(features)
  const probability = computeProbabilityV1(normalised)
  const decision = classifyProbability(probability)

  const row = await insertPrediction({
    fixture_id: fixtureId,
    model_version: PREDICTION_MODEL_V1,
    probability: decision.probability,
    confidence: decision.confidence,
    decision_category: decision.category,
  })

  return {
    fixture_id: fixtureId,
    sport: 'cricket',
    model_version: PREDICTION_MODEL_V1,
    probability: decision.probability,
    confidence: decision.confidence,
    decision_category: decision.category,
    prediction_id: row.id,
  }
}

async function predictFootballFixture(fixture: Fixture): Promise<PredictionRunSummary> {
  const fixtureId = Number(fixture.id)
  const statRows = await getStatsForFixture(fixtureId)
  const { features, hasRealStats } = rawStatsForPrediction(fixture, statRows)
  const normalised = normaliseFeatures(features)

  const modelVersion = hasRealStats ? PREDICTION_MODEL_V2_FOOTBALL : PREDICTION_MODEL_V1
  const probability = hasRealStats
    ? computeProbabilityV2(normalised)
    : computeProbabilityV1(normalised)
  const decision = classifyProbability(probability)

  const row = await insertPrediction({
    fixture_id: fixtureId,
    model_version: modelVersion,
    probability: decision.probability,
    confidence: decision.confidence,
    decision_category: decision.category,
  })

  return {
    fixture_id: fixtureId,
    sport: 'football',
    model_version: modelVersion,
    probability: decision.probability,
    confidence: decision.confidence,
    decision_category: decision.category,
    prediction_id: row.id,
  }
}

export async function runPredictionPipelineForFootballFixtures(
  fixtures: Fixture[]
): Promise<PredictionRunSummary[]> {
  return mapInChunks(fixtures, FOOTBALL_PREDICT_CHUNK, predictFootballFixture)
}

export async function runPredictionPipelineForSport(
  sport: (typeof SPORTS)[number]
): Promise<PredictionRunSummary[]> {
  const fixtures = await getTodayFixturesBySportSlug(sport)

  if (sport === 'football') {
    return mapInChunks(fixtures, FOOTBALL_PREDICT_CHUNK, predictFootballFixture)
  }

  return Promise.all(fixtures.map((fixture) => predictCricketFixture(fixture)))
}

export async function runPredictionPipelineForToday(): Promise<PredictionRunSummary[]> {
  const batches = await Promise.all(SPORTS.map((sport) => runPredictionPipelineForSport(sport)))
  return batches.flat()
}
