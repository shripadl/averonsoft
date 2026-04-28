import type { RawStats } from './featureExtractor'

/**
 * Maps fixture_stats rows (feature_name / feature_value) into RawStats for the extractor.
 * Only keys recognised by featureExtractor are populated.
 */
export function statsRowsToRawStats(
  rows: { feature_name: string; feature_value: number }[]
): RawStats {
  const raw: RawStats = {}
  for (const { feature_name, feature_value } of rows) {
    if (feature_name === 'recentFormScore') raw.recentFormScore = feature_value
    else if (feature_name === 'goalDifferenceScore') raw.goalDifferenceScore = feature_value
    else if (feature_name === 'rankingScore') raw.rankingScore = feature_value
  }
  return raw
}
