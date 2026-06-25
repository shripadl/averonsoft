import {
  buildForecast,
  type FixtureWithPrediction,
} from '@/lib/sports-engine/get-today-with-predictions'
import { getFixtureByIdAndSportSlug } from '@/lib/sports-engine/db/fixtures'
import { getOutcomeForFixtureId } from '@/lib/sports-engine/db/outcomes'
import { getPredictionsForFixtureId } from '@/lib/sports-engine/db/predictions'
import { getStatsForFixture } from '@/lib/sports-engine/db/stats'

export type FixtureDetailPayload = {
  entry: FixtureWithPrediction
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

import { evaluatePrediction } from '@/lib/sports-engine/validation/evaluate-prediction'

export async function getFixtureDetail(
  sportSlug: string,
  fixtureId: number,
  options?: { includeHistoryResults?: boolean }
): Promise<FixtureDetailPayload | null> {
  const includeHistoryResults = options?.includeHistoryResults ?? true
  const fixture = await getFixtureByIdAndSportSlug(sportSlug, fixtureId)
  if (!fixture) return null

  const [stats, history, outcome] = await Promise.all([
    getStatsForFixture(fixtureId),
    getPredictionsForFixtureId(fixtureId),
    includeHistoryResults ? getOutcomeForFixtureId(fixtureId) : Promise.resolve(null),
  ])

  const latest = history[0] ?? null
  const entry: FixtureWithPrediction = {
    fixture,
    prediction: latest,
    forecast: buildForecast(fixture, latest),
  }

  return {
    entry,
    history_results_public_visible: includeHistoryResults,
    outcome: includeHistoryResults && outcome
      ? {
          result_label: outcome.result_label,
          resolved_at: outcome.resolved_at,
        }
      : null,
    stats,
    prediction_history: includeHistoryResults
      ? history.map((h) => {
      const evalResult = evaluatePrediction(h.probability, outcome?.result_label ?? null)
      return {
        id: h.id,
        model_version: h.model_version,
        probability: h.probability,
        confidence: h.confidence,
        decision_category: h.decision_category,
        created_at: h.created_at,
        ...evalResult,
      }
    })
      : [],
  }
}
