import type { NormalisedFeature } from './normaliser'

/** v1 — legacy weights (hash fallback features). */
const WEIGHTS_V1: Record<string, number> = {
  recentFormScore: 1.2,
  goalDifferenceScore: 0.8,
  rankingScore: 1.0,
}

/**
 * v2 — tuned for API-Sports form, goal difference, standings, and home advantage.
 * Trained heuristically; compare hit-rate in the validator after deployment.
 */
const WEIGHTS_V2: Record<string, number> = {
  recentFormScore: 1.5,
  goalDifferenceScore: 1.1,
  rankingScore: 0.9,
  homeAdvantageScore: 0.7,
}

export function computeScore(
  features: NormalisedFeature[],
  weights: Record<string, number>
): number {
  return features.reduce((acc, f) => {
    const w = weights[f.name] ?? 0
    return acc + f.normalised * w
  }, 0)
}

export function logistic(probScore: number): number {
  return 1 / (1 + Math.exp(-probScore))
}

export function computeProbabilityV1(features: NormalisedFeature[]): number {
  return logistic(computeScore(features, WEIGHTS_V1))
}

export function computeProbabilityV2(features: NormalisedFeature[]): number {
  return logistic(computeScore(features, WEIGHTS_V2))
}

/** @deprecated Use computeProbabilityV1 or computeProbabilityV2 */
export function computeProbability(features: NormalisedFeature[]): number {
  return computeProbabilityV1(features)
}
