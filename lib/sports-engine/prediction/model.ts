import type { NormalisedFeature } from './normaliser'

const WEIGHTS: Record<string, number> = {
  recentFormScore: 1.2,
  goalDifferenceScore: 0.8,
  rankingScore: 1.0,
}

export function computeScore(features: NormalisedFeature[]): number {
  return features.reduce((acc, f) => {
    const w = WEIGHTS[f.name] ?? 0
    return acc + f.normalised * w
  }, 0)
}

export function logistic(probScore: number): number {
  return 1 / (1 + Math.exp(-probScore))
}

export function computeProbability(features: NormalisedFeature[]): number {
  const score = computeScore(features)
  return logistic(score)
}
