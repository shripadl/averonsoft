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

function evaluatePrediction(
  probability: number,
  outcomeLabel: string | null
): {
  predicted_lean: 'home' | 'away'
  actual_result: string | null
  hit: boolean | null
  error_abs: number | null
} {
  const p = Math.max(0, Math.min(1, probability))
  const predictedLean: 'home' | 'away' = p >= 0.5 ? 'home' : 'away'
  const actual = outcomeLabel ? outcomeLabel.toLowerCase() : null

  if (!actual) {
    return {
      predicted_lean: predictedLean,
      actual_result: null,
      hit: null,
      error_abs: null,
    }
  }

  if (actual === 'home_win' || actual === 'away_win') {
    const hit =
      (actual === 'home_win' && predictedLean === 'home') ||
      (actual === 'away_win' && predictedLean === 'away')
    const actualHomeProb = actual === 'home_win' ? 1 : 0
    return {
      predicted_lean: predictedLean,
      actual_result: actual,
      hit,
      error_abs: Math.abs(p - actualHomeProb),
    }
  }

  // Draw/other outcomes are tracked, but error/hit aren't comparable to a binary home-edge score.
  return {
    predicted_lean: predictedLean,
    actual_result: actual,
    hit: null,
    error_abs: null,
  }
}

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
