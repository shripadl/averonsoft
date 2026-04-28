import type { Feature } from './featureExtractor'

export type NormalisedFeature = Feature & { normalised: number }

export function normaliseFeatures(features: Feature[]): NormalisedFeature[] {
  const divisor = 10
  return features.map((f) => ({
    ...f,
    normalised: f.value / divisor,
  }))
}
