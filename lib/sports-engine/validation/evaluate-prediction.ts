export type PredictionEvaluation = {
  predicted_lean: 'home' | 'away'
  actual_result: string | null
  hit: boolean | null
  error_abs: number | null
}

/** Compare home-edge probability to a resolved outcome label. */
export function evaluatePrediction(
  probability: number,
  outcomeLabel: string | null
): PredictionEvaluation {
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

  return {
    predicted_lean: predictedLean,
    actual_result: actual,
    hit: null,
    error_abs: null,
  }
}
