import type { Fixture } from '@/lib/sports-engine/db/fixtures'
import { getTodayFixturesBySportSlug } from '@/lib/sports-engine/db/fixtures'
import {
  insertPredictionsBatch,
  type InsertPredictionInput,
  type PredictionRow,
  getPredictionsForFixtureIds,
} from '@/lib/sports-engine/db/predictions'
import { getStatsForFixtures, type FixtureStatNameValue } from '@/lib/sports-engine/db/stats'
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
const PREDICT_CHUNK = 80

export type PredictionRunSummary = {
  fixture_id: number
  sport: string
  model_version: string
  probability: number
  confidence: string
  decision_category: string
  prediction_id: number
}

function utcDayStartIso(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

async function filterFixturesNeedingPrediction(fixtures: Fixture[]): Promise<Fixture[]> {
  if (fixtures.length === 0) return []
  const preds = await getPredictionsForFixtureIds(fixtures.map((f) => Number(f.id)))
  const latestCreatedAt = new Map<number, string>()
  for (const p of preds) {
    if (!latestCreatedAt.has(p.fixture_id)) {
      latestCreatedAt.set(p.fixture_id, p.created_at)
    }
  }
  const dayStart = utcDayStartIso()
  return fixtures.filter((f) => {
    const createdAt = latestCreatedAt.get(Number(f.id))
    return !createdAt || createdAt < dayStart
  })
}

function rawStatsForPrediction(
  fixture: Fixture,
  statRows: FixtureStatNameValue[]
): { features: ReturnType<typeof extractFeatures>; hasRealStats: boolean } {
  const raw = statsRowsToRawStats(statRows)
  let features = extractFeatures(raw)
  const hasRealStats = statRows.some((r) => r.feature_name === 'homeAdvantageScore')

  if (features.length === 0 || !hasRealStats) {
    features = extractFeatures(rawStatsFallbackFromFixture(fixture))
    return { features, hasRealStats: false }
  }

  return { features, hasRealStats }
}

function buildPredictionInput(
  fixture: Fixture,
  statRows: FixtureStatNameValue[],
  sport: 'football' | 'cricket'
): InsertPredictionInput {
  const { features, hasRealStats } = rawStatsForPrediction(fixture, statRows)
  const normalised = normaliseFeatures(features)
  const useV2 = sport === 'football' && hasRealStats
  const modelVersion = useV2 ? PREDICTION_MODEL_V2_FOOTBALL : PREDICTION_MODEL_V1
  const probability = useV2 ? computeProbabilityV2(normalised) : computeProbabilityV1(normalised)
  const decision = classifyProbability(probability)

  return {
    fixture_id: Number(fixture.id),
    model_version: modelVersion,
    probability: decision.probability,
    confidence: decision.confidence,
    decision_category: decision.category,
  }
}

function toSummary(input: InsertPredictionInput, row: PredictionRow, sport: string): PredictionRunSummary {
  return {
    fixture_id: input.fixture_id,
    sport,
    model_version: input.model_version,
    probability: input.probability,
    confidence: input.confidence,
    decision_category: input.decision_category,
    prediction_id: row.id,
  }
}

async function predictFixturesInChunks(
  fixtures: Fixture[],
  sport: 'football' | 'cricket'
): Promise<PredictionRunSummary[]> {
  const results: PredictionRunSummary[] = []

  for (let i = 0; i < fixtures.length; i += PREDICT_CHUNK) {
    const chunk = fixtures.slice(i, i + PREDICT_CHUNK)
    const ids = chunk.map((f) => Number(f.id))
    const statsMap = await getStatsForFixtures(ids)

    const inputs = chunk.map((fixture) =>
      buildPredictionInput(fixture, statsMap.get(Number(fixture.id)) ?? [], sport)
    )
    const rows = await insertPredictionsBatch(inputs)
    for (let j = 0; j < inputs.length; j++) {
      const row = rows[j]
      if (row) results.push(toSummary(inputs[j]!, row, sport))
    }
  }

  return results
}

export async function runPredictionPipelineForFootballFixtures(
  fixtures: Fixture[]
): Promise<PredictionRunSummary[]> {
  return predictFixturesInChunks(fixtures, 'football')
}

export async function runPredictionPipelineForSport(
  sport: (typeof SPORTS)[number]
): Promise<PredictionRunSummary[]> {
  const fixtures = await getTodayFixturesBySportSlug(sport)
  const pending = await filterFixturesNeedingPrediction(fixtures)
  return predictFixturesInChunks(pending, sport)
}

export async function runPredictionPipelineForToday(): Promise<PredictionRunSummary[]> {
  const batches = await Promise.all(SPORTS.map((sport) => runPredictionPipelineForSport(sport)))
  return batches.flat()
}
